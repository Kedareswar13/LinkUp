const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const generateOtp = require("../utils/generateOtp.js");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const hbs = require("hbs");
const sendEmail = require("../utils/email.js");

const loadTemplate = (templateName, replacements) => {
  const templatePath = path.join(__dirname, "../emailTemplate", templateName);
  const source = fs.readFileSync(templatePath, "utf-8");
  const template = hbs.compile(source);
  return template(replacements);
};

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res, message) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Prevents client-side JS from accessing the cookie
    secure: process.env.NODE_ENV === "production", // Send over HTTPS in production
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Cross-site cookie handling
  };

  res.cookie("token", token, cookieOptions);

  // Remove sensitive fields before sending user data
  user.password = undefined;
  user.otp = undefined;

  res.status(statusCode).json({
    status: "success",
    message,
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { email, password, passwordConfirm, username } = req.body;

  // Check if the user already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return next(new AppError("Email already registered", 400));
  }
  const otp = generateOtp(); // Generates a 6-digit OTP
  const otpExpires = Date.now() + 24 * 60 * 60 * 1000; // OTP expires in 24 hours

  const newUser = await User.create({
    username,
    email,
    password,
    passwordConfirm,
    otp,
    otpExpires,
  });

  const htmlTemplate = loadTemplate("otpTemplate.hbs", {
    title: "OTP Verification",
    username: newUser.username,
    otp: otp,
    message: "Your one-time password (OTP) for account verification is:",
  });

  try {
    // Example: Sending the email using Nodemailer (assuming you have a sendEmail function)
    await sendEmail({
      email: newUser.email,
      subject: "OTP for Email Verification",
      html: htmlTemplate,
    });
    createSendToken(
      newUser,
      200,
      res,
      "Registration successful. Check your Email for OTP Verification"
    );
  } catch (error) {
    await User.findByIdAndDelete(newUser.id);
    return next(
      new AppError(
        "There is an Error creating the account.Please try again later!",
        500
      )
    );
  }
});

exports.verifyAccount = catchAsync(async (req, res, next) => {
  const { otp } = req.body;

  if (!otp) {
    return next(new AppError("OTP is required for verification", 400));
  }

  const user = req.user || (await User.findById(req.user.id));

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.otp !== otp) {
    return next(new AppError("Invalid OTP", 400));
  }

  if (Date.now() > user.otpExpires) {
    return next(new AppError("OTP has expired. Please request a new OTP", 400));
  }

  // Mark account as verified and clear OTP fields
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save({ validateBeforeSave: false });

  createSendToken(user, 200, res, "Email has been Verified");
});

exports.resendOtp = catchAsync(async (req, res, next) => {
  const { email } = req.user;

  if (!email) {
    return next(new AppError("Email is required", 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.isVerified) {
    return next(new AppError("This account is already verified", 400));
  }

  // Generate new OTP and set expiration time
  const otp = generateOtp();
  const otpExpires = Date.now() + 2 * 60 * 1000; // OTP valid for 24 hours

  user.otp = otp;
  user.otpExpires = otpExpires;

  await user.save({ validateBeforeSave: false });

  // Send OTP via email
  const htmlTemplate = loadTemplate("otpTemplate.hbs", {
    title: "OTP Resend",
    username: user.username,
    otp,
    message: "Your new one-time password (OTP) for account verification is:",
  });

  try {
    await sendEmail({
      email: user.email,
      subject: "Resend OTP for Email Verification",
      html: htmlTemplate,
    });

    res.status(200).json({
      status: "success",
      message: "A new OTP has been sent successfully to your email.",
    });
  } catch (error) {
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError("There is an Error in sending OTP email. Try again later!", 500));
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
  }

  // Find user and explicitly select the password
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Incorrect email or password", 401));
  }
  
  createSendToken(user,200,res,"Login Successful");
});

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie("token", "loggedout", {
      expires: new Date(Date.now() + 10 * 1000), // Expires in 10 seconds
      httpOnly: true, // Prevents XSS attacks
      secure: process.env.NODE_ENV === "production", // Only secure in production
      sameSite: "None", // Allows cross-site logout if necessary
  });

  res.status(200).json({
      status: "success",
      message: "Logged out successfully.",
  });
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return next(new AppError("Please provide a valid email address", 400));
    }
    const user = await User.findOne({ email });
    if (!user) {
        return next(new AppError("No user found with this email", 404));
    }
    const otp = generateOtp();
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

    await user.save({ validateBeforeSave: false });

    // Send OTP via email
    const htmlTemplate = loadTemplate("otpTemplate.hbs", {
        title: "Password Reset OTP",
        username: user.username,
        otp,
        message: "Use the OTP below to reset your password. It expires in 5 minutes."
    });

    try {
        await sendEmail({
            email: user.email,
            subject: "Password Reset OTP (valid for 5 min)",
            html: htmlTemplate
        });

        res.status(200).json({
            status: "success",
            message: "Password Reset OTP sent successfully. Please check your email.",
        });
    } catch (error) {
        user.resetPasswordOTP = undefined;
        user.resetPasswordOTPExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError("Error sending OTP. Please try again later!", 500));
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { email, otp, password, passwordConfirm } = req.body;

  // Find user with valid OTP
  const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordOTPExpires: { $gt: Date.now() }, // Ensures OTP isn't expired
  });

  if (!user) {
      return next(new AppError("No user Found.", 400));
  }

  // Validate password and confirmation
  if (password !== passwordConfirm) {
      return next(new AppError("Passwords do not match!", 400));
  }

  // Update user password
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.resetPasswordOTP = undefined;
  user.resetPasswordOTPExpires = undefined;

  await user.save();

  createSendToken(user,200,res,"Password Reset Successful");
});

exports.changePassword = catchAsync(async (req, res, next) => {
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;
    const { email } = req.user;

    // Find the user and select password field
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    // Check if the current password is correct
    if (!(await user.correctPassword(currentPassword, user.password))) {
        return next(new AppError("Incorrect current password", 400));
    }

    // Validate if new password matches confirmation
    if (newPassword !== newPasswordConfirm) {
        return next(new AppError("New Password and Confirm Password do not match!", 400));
    }

    // Update password
    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;
    
    await user.save();

    createSendToken(user,200,res,"Password changed successfully.");
});
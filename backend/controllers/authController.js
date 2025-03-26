const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const generateOtp = require("../utils/generateOtp");

const jwt = require("jsonwebtoken");

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

res.status(200).json({
  status: "success",
  message: "User registered successfully. Please verify OTP.",
  data: {
    user: newUser,
    email: newUser.email,
  },
});
   
  
});
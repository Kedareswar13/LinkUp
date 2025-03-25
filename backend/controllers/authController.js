const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const generateOtp = require("../utils/generateOtp");


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
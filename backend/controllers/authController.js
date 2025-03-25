const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const generateOtp = require("../utils/generateOtp");
const generateOtp = require("../utils/generateOtp"); // Ensure OTP generator is imported


exports.signup = catchAsync(async (req, res, next) => {
  const { email, password, passwordConfirm, username } = req.body;

  // Check if the user already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return next(new AppError("Email already registered", 400));
}
const otp = generateOtp();
const otpExpires = Date.now() + 24 * 60 * 60 * 100;
  
});
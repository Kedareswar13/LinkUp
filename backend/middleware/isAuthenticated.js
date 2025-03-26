const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/userModel");

const isAuthenticated = catchAsync(async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to access.", 401)
    );
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError("The User belonging to this token no longer exists.", 401)
      );
    }

    // Attach user data to request object
    req.user = currentUser;
    next();
  } catch (error) {
    return next(
      new AppError("Invalid or expired token. Please log in again.", 401)
    );
  }
});

module.exports = isAuthenticated;

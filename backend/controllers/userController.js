const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const getDataUri = require("../utils/datauri");
const { uploadToCloudinary } = require("../utils/cloudinary");

exports.getProfile = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id)
    .select(
      "-password -otp -otpExpires -resetPasswordOTP -resetPasswordOTPExpires -passwordConfirm"
    )
    .populate({
      path: "posts",
      options: { sort: { createdAt: -1 } },
    })
    .populate({
      path: "savedPosts",
      options: { sort: { createdAt: -1 } },
    });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.editProfile = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { bio, username } = req.body; // Accept username and bio from the request body
  const profilePicture = req.file; // Ensure file is provided via multer

  let cloudResponse;

  // If a profile picture file is provided, convert it and upload it to Cloudinary
  if (profilePicture) {
    const fileUri = getDataUri(profilePicture);
    cloudResponse = await uploadToCloudinary(fileUri);
  }

  // Find the user by ID, excluding the password field
  const user = await User.findById(userId).select("-password");

  if (!user) return next(new AppError("User Not Found", 404));

  // Update fields if provided in the request
  if (bio) user.bio = bio;
  if (username) user.username = username;
  if (profilePicture) {
    user.profilePicture = cloudResponse.secure_url;
  }

  // Save the updated user (without re-validating all fields)
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    message: "Profile updated successfully",
    status: "success",
    data: { user },
  });
});

exports.suggestedUser = catchAsync(async (req, res, next) => {
  const loginUserId = req.user.id;

  const users = await User.find({ _id: { $ne: loginUserId } }).select(
    "-password -otp -otpExpires -resetPasswordOTP -resetPasswordOTPExpires -passwordConfirm"
  );

  res.status(200).json({
    status: "success",
    data: {
      users,
    }, // Wrapped users inside an object
  });
});

exports.followUnfollow = catchAsync(async (req, res, next) => {
  const loginUserId = req.user._id;
  const targetUserId = req.params.id;

  if (loginUserId.toString() === targetUserId) {
    return next(new AppError("You cannot follow/unfollow yourself", 400));
  }

  const targetUser = await User.findById(targetUserId);
  const loginUser = await User.findById(loginUserId);

  if (!targetUser) {
    return next(new AppError("User not found", 404));
  }

  const isFollowing = targetUser.followers.includes(loginUserId);

  if (isFollowing) {
    // Unfollow logic
    await Promise.all([
      User.updateOne(
        { _id: loginUserId },
        { $pull: { following: targetUserId } }
      ),
      User.updateOne(
        { _id: targetUserId },
        { $pull: { followers: loginUserId } }
      ),
    ]);
  } else {
    // Follow logic
    await Promise.all([
      User.updateOne(
        { _id: loginUserId },
        { $addToSet: { following: targetUserId } }
      ),
      User.updateOne(
        { _id: targetUserId },
        { $addToSet: { followers: loginUserId } }
      ),
    ]);
  }

  const updatedLoggedInUser = await User.findById(loginUserId).select(
    "-password"
  );

  if (!updatedLoggedInUser) {
    return next(
      new AppError("Something went wrong. User not found after update.", 500)
    );
  }

  res.status(200).json({
    status: "success",
    message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
    user: updatedLoggedInUser,
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  const user = req.user;

  if (!user) {
    return next(new AppError("User not authenticated", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Authenticated User",
    data: { user },
  });
});

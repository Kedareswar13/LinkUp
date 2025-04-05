const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

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
  const { bio } = req.body;
  const profilePicture = req.file; // Ensure file path is set

  let cloudResponse;

  if (profilePicture) {
    const fileUri = getDataUri(profilePicture);
    cloudResponse = await uploadToCloudinary(fileUri);
  }

  const user = await User.findById(userId).select("-password");

  if (!user) return next(new AppError("User Not Found", 404));

  if (bio) user.bio = bio;

  if (profilePicture) {
    user.profilePicture = cloudResponse.secure_url;
  }

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    message: "Profile updated successfully",
    status: "success",
    data: {
      user,
    },
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
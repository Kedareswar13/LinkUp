const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const sharp = require("sharp");
const { uploadToCloudinary } = require("../utils/cloudinary");
const Post = require("../models/postModel");
const User = require("../models/userModel");
const Comment = require("../models/commentModel")

exports.createPost = catchAsync(async (req, res, next) => {
  const { caption } = req.body;
  const file = req.file; // renamed variable
  const userId = req.user._id;

  if (!file || !file.buffer) {
    return next(new AppError("File is required for the post", 400));
  }

  // Determine media type
  const isVideo = file.mimetype.startsWith("video/");
  let fileUri;
  let resourceType = "image"; // default

  if (!isVideo) {
    // Optimize image using sharp
    const optimizedImageBuffer = await sharp(file.buffer)
      .resize({ width: 800, height: 800, fit: "inside" })
      .toFormat("jpeg", { quality: 80 })
      .toBuffer();

    fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString("base64")}`;
  } else {
    // For videos, no sharp optimization; convert to base64
    fileUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
    resourceType = "video";
  }

  // Upload file to Cloudinary with appropriate resource type
  const cloudResponse = await uploadToCloudinary(fileUri, resourceType);

  // Create post with a 'media' field (instead of 'image')
  let post = await Post.create({
    caption,
    media: {
      url: cloudResponse.secure_url,
      publicId: cloudResponse.public_id,
      type: resourceType, // "image" or "video"
    },
    user: userId,
  });

  // Add post to user's posts
  const user = await User.findById(userId);
  if (user) {
    user.posts.push(post.id);
    await user.save({ validateBeforeSave: false });
  }

  // Populate user details in the post
  await post.populate({
    path: "user",
    select: "username email bio profilePicture",
  });

  return res.status(201).json({
    status: "success",
    message: "Post created successfully",
    data: {
      post,
    },
  });
});

exports.getAllPost = catchAsync(async (req, res, next) => {
  const posts = await Post.find()
    .populate({
      path: "user",
      select: "username profilePicture bio",
    })
    .populate({
      path: "comments",
      select: "text user",
      populate: {
        path: "user",
        select: "username profilePicture",
      },
    })
    .sort({ createdAt: -1 }); // Sort posts by newest first

  return res.status(200).json({
    status: "success",
    results: posts.length,
    data: {
      posts,
    },
  });
});

exports.getUserPosts = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  const posts = await Post.find({ user: userId })
    .populate({
      path: "comments",
      select: "text user",
      populate: {
        path: "user",
        select: "username profilePicture",
      },
    })
    .sort({ createdAt: -1 }); // Sort by newest posts first

  return res.status(200).json({
    status: "success",
    results: posts.length,
    data: {
      posts,
    },
  });
});

exports.saveOrUnsavePost = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const postId = req.params.id;

  const user = await User.findById(userId);

  if (!user) return next(new AppError("User not found", 404));

  // Check if post is already saved
  const isPostSaved = user.savedPosts.includes(postId);

  if (isPostSaved) {
    user.savedPosts.pull(postId); // Remove post from saved list
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      status: "success",
      message: "Post unsaved Successfully",
      data: {
        user,
      },
    });
  } else {
    user.savedPosts.push(postId); // Save post
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      status: "success",
      message: "Post saved Successfully",
      data: {
        user,
      },
    });
  }
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const post = await Post.findById(id).populate("user");

  if (!post) {
    return next(new AppError("Post not found", 404));
  }

  if (post.user._id.toString() !== userId.toString()) {
    return next(new AppError("You are not authorized to delete this post", 403));
  }

  // Remove the post from the user's posts list
  await User.updateOne({ _id: userId }, { $pull: { posts: id } });

  // Remove this post from all users' saved lists
  await User.updateMany({ savedPosts: id }, { $pull: { savedPosts: id } });

  // Remove all comments associated with this post
  await Comment.deleteMany({ post: id });

  // Remove media from Cloudinary (if it exists)
  if (post.media.publicId) {
    const cloudinary = require("../utils/cloudinary");
    await cloudinary.uploader.destroy(post.media.publicId);
  }

  // Delete the post from the database
  await Post.findByIdAndDelete(id);

  return res.status(200).json({
    status: "success",
    message: "Post deleted successfully",
  });
});

exports.likeOrDislikePost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const post = await Post.findById(id);

  if (!post) return next(new AppError("Post not found", 404));

  const isLiked = post.likes.includes(userId);

  let updatedPost;
  if (isLiked) {
    // Unlike the post (remove user from likes array)
    updatedPost = await Post.findByIdAndUpdate(
      id,
      { $pull: { likes: userId } },
      { new: true }
    );
    return res.status(200).json({
      status: "success",
      message: "Post disliked Successfully",
    });
  } else {
    updatedPost = await Post.findByIdAndUpdate(
      id,
      { $addToSet: { likes: userId } },
      { new: true }
    );
    return res.status(200).json({
      status: "success",
      message: "Post liked Successfully",
    });
  }
});

exports.addComment = catchAsync(async (req, res, next) => {
  const { id: postId } = req.params;
  const userId = req.user._id;
  const { text } = req.body;

  // Check if post exists
  const post = await Post.findById(postId);
  if (!post) return next(new AppError("Post not found", 404));

  // Check if text is provided
  if (!text) return next(new AppError("Comment text is required", 400));

  // Create a new comment
  const comment = await Comment.create({
    text,
    user: userId,
    createdAt: Date.now(),
  });

  // Add comment to post's comments array
  post.comments.push(comment);
  await post.save({ validateBeforeSave: false });

  // Populate user details in the comment
  await comment.populate({
    path: "user",
    select: "username profilePicture bio",
  });

  return res.status(201).json({
    status: "success",
    message: "Comment added successfully",
    data: {
      comment,
    },
  });
});

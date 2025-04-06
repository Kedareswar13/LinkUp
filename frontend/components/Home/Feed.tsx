"use client";
import { BASE_API_URL } from "@/server";
import { RootState } from "@/store/store";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { handleAuthRequest } from "../utils/apiRequest";
import { likeOrDislike, setPost } from "@/store/postSlice";
import { Bookmark, HeartIcon, Loader, MessageCircle, Send } from "lucide-react";
import { Avatar, AvatarImage } from "../ui/avatar";
import DotButton from "../Helper/DotButton";
import Image from "next/image";
import Comments from "../Helper/Comments";
import { toast } from "sonner";

const Feed = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const posts = useSelector((state: RootState) => state.posts.posts);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // Global animation state; this triggers animation on all hearts
  const [animateHeart, setAnimateHeart] = useState(false);

  useEffect(() => {
    const getAllPost = async () => {
      const getAllPostReq = async () =>
        await axios.get(`${BASE_API_URL}/posts/all`);

      const result = await handleAuthRequest(getAllPostReq, setIsLoading);

      if (result) {
        dispatch(setPost(result.data.data.posts));
      }
    };

    getAllPost();
  }, [dispatch]);

  const handleLikeDislike = async (id: string) => {
    if (!user || !user._id) {
      toast.error("User not found. Please log in.");
      return;
    }
    // Trigger the pop animation
    setAnimateHeart(true);
    setTimeout(() => setAnimateHeart(false), 500);

    try {
      const result = await axios.post(
        `${BASE_API_URL}/posts/like-dislike/${id}`,
        {},
        { withCredentials: true }
      );

      if (result.data.status === "success") {
        dispatch(likeOrDislike({ postId: id, userId: user._id }));
        toast(result.data.message); // "Post liked" or "Post disliked"
      } else {
        toast.error("Something went wrong!");
      }
    } catch (error: any) {
      console.error("Error liking/disliking post:", error);
      toast.error(error?.response?.data?.message || "Failed to like/dislike");
    }
  };

  const handleSaveUnsave = async (id: string) => {
    // Implement save/unsave functionality here.
  };

  const handleComment = async (id: string) => {
    // Implement comment functionality here.
  };

  const scrollToComments = (postId: string) => {
    const element = document.getElementById(`comments-${postId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center flex-col">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (posts.length < 1) {
    return (
      <div className="text-3xl m-8 text-center capitalize font-bold">
        No posts to Show
      </div>
    );
  }

  return (
    <>
      <div className="mt-10 w-[70%] mx-auto">
        {posts.map((post) => (
          <div key={post._id} className="mt-8 border-b pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Avatar className="w-9 h-9">
                  <AvatarImage
                    src={post.user?.profilePicture}
                    className="h-full w-full"
                  />
                </Avatar>
                <h1 className="font-semibold">{post.user?.username}</h1>
              </div>
              <DotButton post={post} user={user} />
            </div>

            {/* Media Rendering */}
            <div className="mt-2">
              {post.media?.type === "image" ? (
                <Image
                  src={post.media.url}
                  alt="Post"
                  width={800}
                  height={500}
                  className="w-full h-auto object-cover rounded-md"
                />
              ) : post.media?.type === "video" ? (
                <video
                  src={post.media.url}
                  controls
                  className="w-full max-h-[500px] object-contain rounded-md"
                />
              ) : null}
            </div>

            {/* Action Buttons */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <HeartIcon
                  onClick={() => handleLikeDislike(post._id)}
                  className={`cursor-pointer transition-transform duration-300 ${
                    user && post.likes.includes(user._id)
                      ? "text-red-500 fill-red-500"
                      : "text-gray-500"
                  } ${animateHeart ? "animate-like-pop" : ""}`}
                />
                <MessageCircle
                  className="cursor-pointer text-gray-500"
                />
                <Send className="cursor-pointer text-gray-500" />
              </div>
              <Bookmark
                onClick={() => handleSaveUnsave(post._id)}
                className="cursor-pointer text-gray-500"
              />
            </div>

            {/* Likes and Caption */}
            <h1 className="mt-2 text-sm font-semibold">
              {post.likes.length} likes
            </h1>
            {post.caption && (
              <p className="mt-2 font-semibold">{post.caption}</p>
            )}

            {/* Comments */}
            <Comments post={post} user={user} />

            {/* Add Comment Input */}
            <div className="mt-2 flex items-center">
              <input
                type="text"
                placeholder="Add a Comment ..."
                className="flex-1 border border-gray-300 rounded px-3 py-1 placeholder-gray-800 outline-none"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <p
                role="button"
                className="ml-2 text-sm font-semibold text-blue-700 cursor-pointer"
                onClick={() => handleComment(post._id)}
              >
                Post
              </p>
            </div>
            <div className="pb-6 border-b-2"></div>
            <div id={`comments-${post._id}`}></div>
          </div>
        ))}
      </div>

      {/* Global CSS for heart animation */}
      <style jsx global>{`
        @keyframes like-pop {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.5);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-like-pop {
          animation: like-pop 0.5s ease-in-out;
        }
      `}</style>
    </>
  );
};

export default Feed;

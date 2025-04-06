"use client";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Post, User } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import DotButton from "./DotButton";
import { Button } from "../ui/button";

type Props = {
  user: User | null;
  post: Post | null;
};

const Comment = ({ post, user }: Props) => {
  const [comment, setComment] = useState("");
  const dispatch = useDispatch();

  const addCommentHandler = async (id: string) => {
    console.log("Adding comment to post:", id);
    // API call or Redux dispatch here
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger>
          <p className="mt-2 text-sm font-semibold cursor-pointer hover:underline">
            View All {post?.comments.length || 0} Comments
          </p>
        </DialogTrigger>
        <DialogContent className="max-w-5xl p-0 gap-0 flex flex-col">
          <DialogTitle />

          <div className="flex flex-1">
            {/* Image or Video Section */}
            <div className="sm:w-1/2 hidden max-h-[80vh] sm:block">
              {post?.media?.type === "image" && post?.media?.url && (
                <Image
                  src={post.media.url}
                  alt="Post Media"
                  width={500}
                  height={500}
                  className="w-full h-full object-cover rounded-lg"
                />
              )}

              {post?.media?.type === "video" && post?.media?.url && (
                <video
                  src={post.media.url}
                  controls
                  className="w-full max-h-[500px] object-contain rounded-md"
                />
              )}
            </div>
            {/* Right Side: Comments & Input */}
            <div className="w-full sm:w-1/2 flex flex-col justify-between">
              <div className="flex items-center mt-4 justify-between p-4">
                <div className="flex gap-3 items-center">
                  <Avatar>
                    <AvatarImage
                      src={user?.profilePicture || "/default-avatar.png"}
                      alt="User Avatar"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{user?.username}</p>
                  </div>
                </div>
                <DotButton user={user} post={post} />
              </div>
              <hr />
              <div className="flex-1 overflow-y-auto max-h-96 p-4">
                {post?.comments.map((item) => {
                  return (
                    <div
                      key={item._id}
                      className="flex mb-4 gap-3 items-center"
                    >
                      <Avatar>
                        <AvatarImage
                          src={
                            item?.user?.profilePicture || "/default-avatar.png"
                          }
                          alt="User Avatar"
                        />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                      <div className="flex items-center space-x-2">
                        <p className="font-bold text-sm">
                          {item?.user?.username}
                        </p>
                        <span className="font-normal text-sm">{item?.text}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full outline-none border text-sm border-gray-300 p-2 rounded"
                  />
                  <Button variant="outline">
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Comment;

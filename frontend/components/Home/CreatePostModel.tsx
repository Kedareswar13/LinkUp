"use client";
import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import Image from "next/image";
import LoadingButton from "../Helper/loadingButton";
import { Button } from "../ui/button";
import { ImageIcon, VideoIcon } from "lucide-react";
import { toast } from "sonner";
import { BASE_API_URL } from "@/server";
import axios from "axios";
import { handleAuthRequest } from "../utils/apiRequest";
import { addPost } from "@/store/postSlice";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePostModal = ({ isOpen, onClose }: Props) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setCaption("");
    }
  }, [isOpen]);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      // Validate file type: allow images or videos
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        toast.error("Please select a valid image or video file!");
        return;
      }

      // Validate file size (e.g., 10MB maximum)
      if (file.size > 20 * 1024 * 1024) {
        toast.error("File size should not exceed 10MB!");
        return;
      }

      const fileUrl = URL.createObjectURL(file);
      setSelectedFile(file);
      setPreviewUrl(fileUrl);
    }
  };

  const handleCreatePost = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("caption", caption);
    // Append file with key "media" for the backend to pick up
    formData.append("media", selectedFile);

    const createPostReq = async () =>
      await axios.post(`${BASE_API_URL}/posts/create-post`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

    const result = await handleAuthRequest(createPostReq, setIsLoading);

    if (result) {
      toast.success("Post created successfully!");
      dispatch(addPost(result?.data?.data?.post)); // Optional: Add to Redux
      setSelectedFile(null);
      setPreviewUrl(null);
      setCaption("");
      onClose(); // Close the modal
      router.push("/");
      router.refresh();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        {previewUrl ? (
          // Show preview based on file type
          <div className="flex flex-col justify-center items-center text-center space-y-4">
            <div className="mt-4">
              {selectedFile?.type.startsWith("video/") ? (
                <video
                  controls
                  src={previewUrl}
                  className="overflow-auto max-h-96 rounded-md object-contain w-full"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={400}
                  height={400}
                  className="overflow-auto max-h-96 rounded-md object-contain w-full"
                />
              )}
            </div>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption ..."
              className="mt-4 p-2 border rounded-md w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <div className="flex space-x-4 mt-4">
              <LoadingButton
                className="bg-blue-600 text-white hover:bg-blue-700"
                isLoading={isLoading}
                onClick={handleCreatePost}
              >
                Create Post
              </LoadingButton>
              <Button
                className="bg-gray-500 text-white hover:bg-gray-600"
                onClick={() => {
                  setPreviewUrl(null);
                  setSelectedFile(null);
                  setCaption("");
                  onClose();
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          // Default view before a file is selected
          <>
            <DialogHeader>
              <DialogTitle className="text-center mt-3 mb-3">
                Upload Photo or Video
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="flex space-x-2 text-gray-600">
                <ImageIcon size={40}/>
                <VideoIcon size={40}/>
              </div>
              <p className="text-gray-600 mt-4">
                Select a photo or video from your computer
              </p>
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleButtonClick}
              >
                Select from computer
              </Button>
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;

"use client";
import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import Image from "next/image";
import LoadingButton from "../Helper/loadingButton";
import { Button } from "../ui/button";
import { ImageIcon } from "lucide-react";
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

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedImage(null);
      setPreviewImage(null);
      setCaption("");
    }
  }, [isOpen]);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file!");
        return;
      }

      // Validate image size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size should not exceed 10MB!");
        return;
      }
      const imageUrl = URL.createObjectURL(file); 
      setSelectedImage(file);
      setPreviewImage(imageUrl);
    }
  };

  const handleCreatePost = async () => {
    const formData = new FormData();
  
    if (selectedImage) {
      formData.append("caption", caption);
      formData.append("image", selectedImage);
    }
  
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
      setSelectedImage(null);
      setPreviewImage(null);
      setCaption("");
      onClose(); // Close the modal
      router.push("/");
      router.refresh();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        {previewImage ? (
          //Only show the selected image and input for caption when image is chosen
          <div className="flex flex-col justify-center items-center text-center space-y-4">
            <div className="mt-4">
              <Image
                src={previewImage}
                alt="Image"
                width={400}
                height={400}
                className="overflow-auto max-h-96 rounded-md object-contain w-full"
              />
            </div>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption ..."
              className="mt-4 p-2 border rounded-md w-full text-gray-700
          focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                  setPreviewImage(null);
                  setSelectedImage(null);
                  setCaption("");
                  onClose();
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          //Show the default Veiw
          <>
            <DialogHeader>
              <DialogTitle className="text-center mt-3 mb-3">
                Upload Photo
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="flex space-x-2 text-gray-600">
                <ImageIcon size={40} />
              </div>

              <p className="text-gray-600 mt-4">
                Select a photo from your computer
              </p>

              <Button
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleButtonClick}
              >
                Select from computer
              </Button>
              <input
                type="file"
                accept="image/*"
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

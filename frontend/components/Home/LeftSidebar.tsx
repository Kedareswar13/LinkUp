"use client";

import {
  Heart,
  HomeIcon,
  LogOut,
  MessageCircle,
  Search,
  SquarePlus,
} from "lucide-react";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import { BASE_API_URL } from "@/server";
import { setAuthUser } from "@/store/authSlice";
import { toast } from "sonner";
import CreatePostModel from "./CreatePostModel";


const LeftSidebar = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();
  const dispatch = useDispatch();
  const [isDialogOpen ,setIsDialogOpen] = useState(false);
  const handleLogout = async () => {
    try {
      await axios.post(
        `${BASE_API_URL}/users/logout`,
        {},
        { withCredentials: true }
      );
  
      dispatch(setAuthUser(null));
      toast.success("Logged out successfully");
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed");
    }
  };
  
  const handleSidebar = async (label: string) => {
    if (label === "Home") router.push("/");
    if (label === "Logout") handleLogout();
    if(label === "Profile") router.push(`/profile/${user?._id}`);
    if(label === "Create") setIsDialogOpen(true);
  };
  const SidebarLinks = [
    {
      icon: <HomeIcon className="w-5 h-5" />,
      label: "Home",
    },
    {
      icon: <Search className="w-5 h-5" />,
      label: "Search",
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      label: "Messages",
    },
    {
      icon: <Heart className="w-5 h-5" />,
      label: "Notifications",
    },
    {
      icon: <SquarePlus className="w-5 h-5" />,
      label: "Create",
    },
    {
      icon: (
        <Avatar className="w-7 h-7">
          <AvatarImage
            src={user?.profilePicture}
            className="h-full w-full"
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ),
      label: "Profile",
    },
    {
      icon: <LogOut className="w-5 h-5" />,
      label: "Logout",
    },
  ];

  return (
    <div className="h-full">
      <CreatePostModel isOpen = {isDialogOpen} onClose = {() => setIsDialogOpen(false)}/>
      <div className="m-2 mt-3 lg:p-6 p-3 cursor-pointer">
        <div
          onClick={() => {
            router.push("/");
          }}

        >
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={150}
            height={150}
            className="mt-[-2rem]"
          />
        </div>

        <div className="mt-6">
          {SidebarLinks.map((link) => {
            return (
              <div
                key={link.label}
                className="flex items-center mb-2 p-2 rounded-lg group cursor-pointer 
            transition-all duration-200 hover:bg-gray-100 space-x-2"
            onClick={()=>handleSidebar(link.label)}
              >
                <div className="group-hover:scale-110 transition-all duration-200">
                  {link.icon}
                </div>
                <p className="text-sm lg:text-base">{link.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;

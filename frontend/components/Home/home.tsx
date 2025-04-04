"use client";

import React from "react";
import LeftSidebar from "./LeftSidebar";
import Feed from "./Feed";
import RightSidebar from "./RightSidebar";

const Home = () => {
  return (
  <div className="flex">
    <div className="w-[20%] hidden md:block border-r-2 h-screen fixed">
      <LeftSidebar/>
    </div>
    <div className="flex-1 md:ml-[20%] overflow-y-auto">
      <Feed/>
    </div>
    <div className="w-[30%] pt-8 px-6 lg:block hidden">
      <RightSidebar/>
    </div>
  </div>
  )
};

export default Home;
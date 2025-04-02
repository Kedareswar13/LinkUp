"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const Home = () => {
  const user = useSelector((state: RootState) => state?.auth?.user);

  console.log("User:", user || "No user data available");

  return <div>Home</div>;
};

export default Home;
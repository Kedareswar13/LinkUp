"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import PasswordInput from "./PasswordInput";
import LoadingButton from "../Helper/loadingButton";
import { Button } from "../ui/button";
import Link from "next/link";
import { useDispatch } from "react-redux";

const PasswordReset = () => {
    const searchParams = useSearchParams();
    const email = searchParams.get("email");
    const [otp,setOtp] = useState("");
    const [password,setPassword] = useState("");
    const [passwordconfirm,setPasswordConfirm] = useState("");
    const [isLoading,setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const router = useRouter();
    

    return (
        <div className="h-screen flex items-center justify-center flex-col">
            <h1 className="text-2xl sm:text-3xl font-bold mb-3">
                Reset your password
            </h1>
            <p className="mb-6 text-sm sm:text-base text-center text-gray-600 font-medium">
                Enter your OTP and new password to reset your password
            </p>
            <input
                type="number"
                placeholder="Enter OTP"
                className="block w-[90%] sm:w-[80%] md:w-[60%] lg:w-[40%] xl:w-[30%] 
                mx-auto px-6 py-3 bg-gray-300 rounded-lg outline-none no-spinner"
                value={otp}
                onChange={(e)=>setOtp(e.target.value)}
            />
            <div className="mb-4 mt-4 w-[90%] sm:w-[80%] md:w-[60%] lg:w-[40%] xl:w-[30%]">
                <PasswordInput
                    name="password"
                    placeholder="Enter new password"
                    inputClassName="px-6 py-3 bg-gray-300 rounded-lg outline-none w-full"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                />
            </div>
            <div className="mb-4 mt-4 w-[90%] sm:w-[80%] md:w-[60%] lg:w-[40%] xl:w-[30%]">
                <PasswordInput
                    name="passwordconfirm"
                    placeholder="Confirm new password"
                    inputClassName="px-6 py-3 bg-gray-300 rounded-lg outline-none w-full"
                    value={passwordconfirm}
                    onChange={(e)=>setPasswordConfirm(e.target.value)}
                />
            </div>
            <div className="flex items-center space-x-4 mt-6">
                <LoadingButton isLoading={isLoading}>Change Password</LoadingButton>
                <Button variant={"ghost"}>
                    <Link href="/auth/forget-password">Go Back</Link>
                </Button>
            </div>
        </div>
    );
};

export default PasswordReset;
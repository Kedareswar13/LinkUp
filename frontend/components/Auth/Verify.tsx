"use client";
import { useRouter } from "next/navigation";
import { Loader, MailCheck } from "lucide-react";
import React, { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";
import LoadingButton from "../Helper/loadingButton";
import { BASE_API_URL } from "@/server";
import { handleAuthRequest } from "../utils/apiRequest";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setAuthUser } from "@/store/authSlice";
import { toast } from "sonner";
import { RootState } from "@/store/store";

const OTP_EXPIRY_TIME = 60; // 1 minute in seconds

const Verify = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const user = useSelector((state : RootState) => state?.auth.user);
  const [timer, setTimer] = useState(OTP_EXPIRY_TIME);
  const [canResend, setCanResend] = useState(false);
  const [isPageLoading,setIsPageLoading] = useState(true);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!user) {
      router.replace("/auth/login");
    } else if (user && user.isVerified) {
      router.replace("/");
    } else {
      setIsPageLoading(false);
    }
  }, [user, router]);

  useEffect(() => {
    console.log("Current OTP:", otp);
  }, [otp]);

  // Timer Countdown
  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < otp.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const otpValue = otp.join("");
    try {
      const verifyReq = async () =>
        await axios.post(
          `${BASE_API_URL}/users/verify`,
          { otp: otpValue },
          { withCredentials: true }
        );
      const result = await handleAuthRequest(verifyReq, setIsLoading);
      if (result) {
        dispatch(setAuthUser(result.data));
        toast.success(result.data.message);
        router.push("/");
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
      toast.error("Failed to verify OTP.");
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return; 
    setCanResend(false);
    setTimer(OTP_EXPIRY_TIME);

    try {
      const resendOtpReq = async () =>
        await axios.post(`${BASE_API_URL}/users/resend-otp`, null, { withCredentials: true });
      const result = await handleAuthRequest(resendOtpReq, setIsLoading);
      if (result) {
        toast.success(result.data.message);
      }
    } catch (error) {
      console.error("Failed to resend OTP:", error);
      toast.error("Could not resend OTP.");
    }
  };
  
  if (isPageLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Loader className="w-20 h-20 animate-spin" />
      </div>
    );
  }
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <MailCheck className="w-20 h-20 sm:w-32 sm:h-32 text-red-600 mb-12" />
      <h1 className="text-2xl sm:text-3xl font-bold mb-3">OTP Verification</h1>
      <p className="mb-6 text-sm sm:text-base text-gray-600 font-medium">
        We have sent a code to {user?.email} 
      </p>

      <div className="flex space-x-4">
        {otp.map((digit, index) => (
          <input
            key={index}
            type="text"
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            ref={(el) => {
              if (el) inputRefs.current[index] = el;
            }}
            
            maxLength={1}
            className="sm:w-20 sm:h-20 w-10 h-10 rounded-lg bg-gray-200 text-lg sm:text-3xl font-bold outline-gray-500 text-center no-spinner"
          />
        ))}
      </div>

      <div className="flex items-center mt-4 space-x-2">
        <h1 className="text-sm sm:text-lg font-medium text-gray-700">
          Didn&apos;t get the OTP code?
        </h1>
        <button
          onClick={handleResendOtp}
          disabled={!canResend}
          className={`text-sm sm:text-lg font-medium ${canResend ? "text-blue-900 underline" : "text-gray-500 cursor-not-allowed"}`}
        >
          Resend Code {canResend ? "" : `in ${timer}s`}
        </button>
      </div>

      <LoadingButton isLoading={isLoading} size="lg" className="mt-6 w-52" onClick={handleSubmit}>
        Verify
      </LoadingButton>
    </div>
  );
};

export default Verify;

import Image from "next/image";
import React from "react";

const Signup = () => {
  return (
    <div className="w-full h-screen overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        {/* Banner */}
        <div className="lg:col-span-4 h-screen hidden lg:block">
          <Image
            src="/images/sinup-banner.jpg"
            alt="signup"
            width={1000}
            height={1000}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="lg:col-span-3 flex flex-col items-center justify-center h-screen">
          <h1 className="font-bold text-xl sm:text-2xl text-left uppercase mb-8">
            Sign Up with <span className="text-green-600">LinkUp SRMAP</span>
          </h1>

          <form className="block w-[90%] sm:w-[80%] md:w-[60%] lg:w-[90%] xl:w-[80%]">
            {/* Username Field */}
            <div className="mb-4">
              <label htmlFor="username" className="font-semibold mb-2 block">
                Username
              </label>
              <input
                type="text"
                name="username"
                id="username"
                placeholder="Username"
                className="px-4 py-3 bg-gray-200 rounded-lg w-full block outline-none"
              />
            </div>
            {/* Email Field */}
            <div className="mb-4">
              <label htmlFor="email" className="font-semibold mb-2 block">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Email Address"
                className="px-4 py-3 bg-gray-200 rounded-lg w-full block outline-none"
              />
            </div>
            {/* Password */}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;

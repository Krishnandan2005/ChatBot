import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Loading() {
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate("/");
    }, 8000);

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-[#531B81] via-[#3A2168] to-[#1E133A] overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute w-72 h-72 bg-purple-500/20 rounded-full blur-3xl top-20 left-20 animate-pulse" />
      <div className="absolute w-72 h-72 bg-pink-500/20 rounded-full blur-3xl bottom-20 right-20 animate-pulse" />

      {/* Card */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-10 py-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl">
        
        {/* Spinner */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-[5px] border-white/20"></div>

          <div className="absolute inset-0 w-20 h-20 rounded-full border-[5px] border-transparent border-t-white animate-spin"></div>

          <div className="absolute inset-3 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
            ✨
          </div>
        </div>

        {/* Text */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white">
            Loading
          </h2>

          <p className="text-sm text-gray-300 mt-2">
            Preparing your workspace...
          </p>
        </div>

        {/* Animated Dots */}
        <div className="flex gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-bounce"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-bounce delay-150"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-bounce delay-300"></span>
        </div>
      </div>
    </div>
  );
}

export default Loading;
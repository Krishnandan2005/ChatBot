import React, { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Login = () => {
  const [state, setState] = useState("login");
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { axios, setToken } = useAppContext();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url =
      state === "login"
        ? "/api/user/login"
        : "/api/user/register";

    try {
      const { data } = await axios.post(url, {
        name,
        email,
        password,
      });

      if (data.success) {
        setToken(data.token);
        localStorage.setItem("token", data.token);

        toast.success(
          state === "login"
            ? "Login Successful"
            : "Account Created Successfully"
        );

        setName("");
        setEmail("");
        setPassword("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message
      );
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-[0_0_40px_rgba(139,92,246,0.15)]"
      >
        {/* Heading */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {state === "login" ? "Welcome Back" : "Create Account"}
          </h2>

          <p className="text-gray-400 mt-2 text-sm">
            {state === "login"
              ? "Login to continue"
              : "Join us and start creating"}
          </p>
        </div>

        {/* Login / Signup Toggle */}
        <div className="flex bg-white/5 rounded-xl p-1 mb-6">
          <button
            type="button"
            onClick={() => setState("login")}
            className={`flex-1 py-2.5 rounded-lg font-medium transition ${
              state === "login"
                ? "bg-purple-600 text-white"
                : "text-gray-400"
            }`}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => setState("signup")}
            className={`flex-1 py-2.5 rounded-lg font-medium transition ${
              state === "signup"
                ? "bg-purple-600 text-white"
                : "text-gray-400"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Name */}
        {state === "signup" && (
          <div className="mb-3">
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 focus-within:border-purple-500 transition">
              <User className="text-gray-400" size={18} />

              <input
                type="text"
                placeholder="Full Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent px-3 py-3 outline-none text-white placeholder-gray-500"
              />
            </div>
          </div>
        )}

        {/* Email */}
        <div className="mb-3">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 focus-within:border-purple-500 transition">
            <Mail className="text-gray-400" size={18} />

            <input
              type="email"
              placeholder="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent px-3 py-3 outline-none text-white placeholder-gray-500"
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-3">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 focus-within:border-purple-500 transition">
            <Lock className="text-gray-400" size={18} />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent px-3 py-3 outline-none text-white placeholder-gray-500"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? (
                <EyeOff className="text-gray-400" size={18} />
              ) : (
                <Eye className="text-gray-400" size={18} />
              )}
            </button>
          </div>
        </div>

        {/* Forgot Password */}
        {state === "login" && (
          <div className="text-right mb-4">
            <button
              type="button"
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              Forgot Password?
            </button>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:scale-[1.02] transition-all duration-300"
        >
          {state === "login" ? "Login" : "Create Account"}
        </button>
      </form>
    </div>
  );
};

export default Login;
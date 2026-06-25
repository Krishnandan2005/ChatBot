import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import Message from "./Message";

const ChatBox = () => {
  const { selectedChats, theme } = useAppContext();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("text");
  const [isPublished, setIsPublished] = useState(false);

  const bottomRef = useRef(null);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!prompt.trim()) return;

    try {
      setLoading(true);

      console.log({
        prompt,
        mode,
        isPublished,
      });

      // API Call Here

      setPrompt("");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChats) {
      setMessages(selectedChats.messages || []);
    } else {
      setMessages([]);
    }
  }, [selectedChats]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  return (
    <div className="flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40">
      {/* Messages Section */}
      <div className="flex-1 mb-5 overflow-y-auto pr-2">
        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-primary">
            <img
              src={theme === "dark" ? assets.logo_full : assets.logo_full_dark}
              alt="Logo"
              className="w-full max-w-56 sm:max-w-68"
            />

            <p className="mt-5 text-4xl sm:text-6xl text-center text-gray-400 dark:text-white">
              Ask me Anything
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}

        {/* Loading Animation */}
        {loading && (
          <div className="flex items-start gap-3 my-6">
            <img
              src={assets.logo}
              alt="Assistant"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-500/20"
            />

            <div className="px-5 py-4 rounded-3xl rounded-tl-lg bg-gradient-to-br from-white via-slate-50 to-violet-50 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:from-[#211B2E] dark:via-[#1B1625] dark:to-[#14101C] dark:border-[#80609F]/20">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-[pulse_1s_ease-in-out_infinite]" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-[pulse_1s_ease-in-out_0.2s_infinite]" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-[pulse_1s_ease-in-out_0.4s_infinite]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Publish Option */}
      {mode === "image" && (
        <label
          htmlFor="publish"
          className="inline-flex items-center gap-2 mb-3 text-sm mx-auto cursor-pointer"
        >
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Publish your generated image to the community
          </p>

          <input
            id="publish"
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="cursor-pointer"
          />
        </label>
      )}

      {/* Input Form */}
      <form
        onSubmit={onSubmit}
        className="flex items-center gap-3 p-3 border border-gray-300 dark:border-white/15 rounded-xl bg-white dark:bg-[#1A1A1A]"
      >
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="bg-transparent text-sm outline-none dark:text-white"
        >
          <option value="text" className="dark:bg-purple-900">
            Text
          </option>

          <option value="image" className="dark:bg-purple-900">
            Images
          </option>
        </select>

        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            mode === "image"
              ? "Describe the image you want to generate..."
              : "Type your prompt here..."
          }
          className="flex-1 bg-transparent outline-none text-sm dark:text-white"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`p-2 rounded-lg transition ${
            loading
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-100 dark:hover:bg-white/10"
          }`}
        >
          <img
            src={loading ? assets.stop_icon : assets.send_icon}
            alt={loading ? "Stop" : "Send"}
            className="w-5 h-5"
          />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
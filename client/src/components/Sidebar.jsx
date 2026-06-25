
import React, { useState, useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import moment from "moment";

const Sidebar = ({ isMenuOpen, setMenuOpen }) => {
  const {
    chats,
    selectedChats,
    theme,
    setTheme,
    user,
    navigate,
    setSelectedChats,
    deleteChat,
    logout,
  } = useAppContext();

  const [search, setSearch] = useState("");

  const filteredChats = useMemo(() => {
    return chats.filter((chat) =>
      chat.messages[0]
        ? chat.messages[0].content
            .toLowerCase()
            .includes(search.toLowerCase())
        : chat.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [chats, search]);

  return (
    <div
      className={`flex flex-col h-screen min-w-72 p-5 dark:bg-gradient-to-b from-[#242124]/30 to-[#000000]/30 border-r border-[#80609F]/60 backdrop-blur-4xl transition-all duration-500 max-md:absolute left-0 z-10 ${
        !isMenuOpen ? "max-md:-translate-x-full" : ""
      }`}
    >
      {/* Logo */}
      <img
        src={theme === "dark" ? assets.logo_full : assets.logo_full_dark}
        alt="Logo"
        className="w-full max-w-48"
      />

      {/* New Chat */}
      <button
        onClick={() => {
          setSelectedChats(null);
          navigate("/");
          setMenuOpen(false);
        }}
        className="flex justify-center items-center w-full py-2 mt-10 text-white bg-gradient-to-r from-[#186132] to-[#163874] text-sm rounded-md cursor-pointer hover:opacity-90 transition"
      >
        <span className="mr-2 text-xl">+</span>
        New Chat
      </button>

      {/* Search */}
      <div className="flex items-center gap-2 p-3 mt-4 border border-gray-400 dark:border-white/20 rounded-md">
        <img
          src={assets.search_icon}
          alt="Search"
          className="w-4 not-dark:invert"
        />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Conversations"
          aria-label="Search conversations"
          className="flex-1 text-xs placeholder:text-gray-400 outline-none bg-transparent"
        />
      </div>

      {/* Recent Chats */}
      {chats.length > 0 && (
        <p className="mt-4 text-sm font-medium">Recent Chats</p>
      )}

      <div className="flex-1 overflow-y-auto mt-3 text-sm space-y-3">
        {filteredChats.map((chat) => (
          <div
            key={chat._id}
            onClick={() => {
              navigate("/");
              setSelectedChats(chat);
              setMenuOpen(false);
            }}
            className={`p-2 px-4 rounded-md cursor-pointer flex justify-between items-center group border transition-all overflow-hidden
              ${
                selectedChats?._id === chat._id
                  ? "bg-purple-500/20 border-purple-500"
                  : "dark:bg-[#57317C]/10 border-gray-300 dark:border-[#80609F]/15"
              }`}
          >
            <div className="flex-1 overflow-hidden">
              <p className="truncate">
                {chat.messages.length > 0
                  ? chat.messages[0].content.slice(0, 32)
                  : chat.name}
              </p>

              <p className="text-xs text-gray-500 dark:text-[#B1A6C0]">
                {moment(chat.updatedAt).fromNow()}
              </p>
            </div>

            <img
              src={assets.bin_icon}
              alt="Delete"
              onClick={(e) => {
                e.stopPropagation();
                deleteChat(chat._id);
              }}
              className="hidden group-hover:block w-4 cursor-pointer not-dark:invert ml-2"
            />
          </div>
        ))}
      </div>

      {/* Community Images */}
      <div
        onClick={() => {
          navigate("/community");
          setMenuOpen(false);
        }}
        className="flex items-center gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer hover:scale-[1.03] transition-all"
      >
        <img
          src={assets.gallery_icon}
          alt="Gallery"
          className="w-5 not-dark:invert"
        />

        <div className="flex flex-col text-sm">
          <p>Community Images</p>
        </div>
      </div>

      {/* Credits */}
      <div
        onClick={() => {
          navigate("/credits");
          setMenuOpen(false);
        }}
        className="flex items-center gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer hover:scale-[1.03] transition-all"
      >
        <img
          src={assets.diamond_icon}
          alt="Credits"
          className="w-5 dark:invert"
        />

        <div className="flex flex-col text-sm">
          <p>Credits : {user?.credits}</p>

          <p className="text-xs text-gray-400">
            Add Credits to your account to use chatbot seamlessly
          </p>
        </div>
      </div>

      {/* Theme Toggle */}
      <div className="flex items-center justify-between gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md hover:scale-[1.03] transition-all">
        <div className="flex items-center gap-2 text-sm">
          <img
            src={assets.theme_icon}
            alt="Theme"
            className="w-4 not-dark:invert"
          />

          <span>Dark Mode</span>
        </div>

        <label className="relative inline-flex cursor-pointer">
          <input
            type="checkbox"
            className="sr-only"
            checked={theme === "dark"}
            onChange={() =>
              setTheme(theme === "dark" ? "light" : "dark")
            }
          />

          <div
            className={`relative w-10 h-5 rounded-full transition-all duration-300 ${
              theme === "dark" ? "bg-green-600" : "bg-gray-400"
            }`}
          >
            <div
              className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${
                theme === "dark"
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            />
          </div>
        </label>
      </div>

      {/* User */}
      <div
        onClick={() => navigate("/community")}
        className="flex items-center gap-3 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer group hover:scale-[1.03] transition-all"
      >
        <img
          src={assets.user_icon}
          alt="User"
          className="w-7 rounded-full"
        />

        <p className="flex-1 text-sm dark:text-primary truncate">
          {user ? user.name : "Login your account"}
        </p>

        {user && (
          <img
            src={assets.logout_icon}
            alt="Logout"
            onClick={(e) => {
              e.stopPropagation();
              logout();
            }}
            className="h-5 cursor-pointer hidden group-hover:block not-dark:invert"
          />
        )}
      </div>

      {/* Mobile Close Button */}
      <img
        onClick={() => setMenuOpen(false)}
        src={assets.close_icon}
        alt="Close"
        className="absolute top-3 right-3 w-5 h-5 cursor-pointer md:hidden not-dark:invert"
      />
    </div>
  );
};

export default Sidebar;

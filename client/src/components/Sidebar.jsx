import React, { useState, useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import moment from "moment";
import toast from "react-hot-toast";

const Sidebar = ({ isMenuOpen, setMenuOpen }) => {
  const {
    chats,
    selectedChat,
    theme,
    setTheme,
    user,
    navigate,
    setSelectedChat,
    createNewChat,
    axios,
    setChats,
    fetchUserChats,
    setToken,
  } = useAppContext();

  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login");
    toast.success("Logout Successfully");
  };

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this chat?"
    );

    if (!confirmDelete) return;

    try {
      const { data } = await axios.post(
        "/api/chat/delete",
        { chatId },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (data.success) {
        setChats((prev) => prev.filter((chat) => chat._id !== chatId));
        await fetchUserChats();
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const filteredChats = useMemo(() => {
    return chats.filter((chat) => {
      const firstMessage = chat.messages?.[0]?.content || "";
      const chatName = chat.chatName || chat.name || "";

      return (
        firstMessage.toLowerCase().includes(search.toLowerCase()) ||
        chatName.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [chats, search]);

  return (
    <div
      className={`flex flex-col h-screen w-[270px] flex-shrink-0 p-4
      dark:bg-gradient-to-b from-[#242124]/30 to-[#000000]/30
      border-r border-[#80609F]/60 backdrop-blur-3xl
      transition-all duration-500
      max-md:absolute left-0 z-20
      ${!isMenuOpen ? "max-md:-translate-x-full" : ""}`}
    >
      {/* Logo */}
      <img
        src={theme === "dark" ? assets.logo_full : assets.logo_full_dark}
        alt="Logo"
        className="max-w-40"
      />

      {/* New Chat */}
      <button
        onClick={() => {
          setSelectedChat(null);
          navigate("/");
          setMenuOpen(false);
          createNewChat();
        }}
        className="flex items-center justify-center w-full py-2 mt-6 rounded-lg text-sm font-medium text-white
        bg-gradient-to-r from-[#186132] to-[#163874]
        hover:opacity-90 transition"
      >
        <span className="mr-2 text-lg">+</span>
        New Chat
      </button>

      {/* Search */}
      <div className="flex items-center gap-2 p-2.5 mt-3 border border-gray-300 dark:border-white/20 rounded-lg">
        <img
          src={assets.search_icon}
          alt="Search"
          className="w-4 not-dark:invert"
        />

        <input
          type="text"
          placeholder="Search Chats"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400"
        />
      </div>

      {/* Recent Chats */}
      {filteredChats.length > 0 && (
        <p className="mt-4 mb-2 text-sm font-semibold text-gray-500 dark:text-gray-300">
          Recent Chats
        </p>
      )}

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {filteredChats.map((chat) => (
          <div
            key={chat._id}
            onClick={() => {
              navigate("/");
              setSelectedChat(chat);
              setMenuOpen(false);
            }}
            className={`flex items-center justify-between rounded-lg p-3 cursor-pointer group transition
              ${
                selectedChat?._id === chat._id
                  ? "bg-purple-500/20 border border-purple-500"
                  : "border border-transparent hover:bg-white/5"
              }`}
          >
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm">
                {chat.messages?.length
                  ? chat.messages?.[0]?.content?.slice(0, 30)
                  : chat.chatName || chat.name || "New Chat"}
              </p>

              <p className="text-xs text-gray-500">
                {chat.updatedAt
                  ? moment(chat.updatedAt).fromNow()
                  : ""}
              </p>
            </div>

            <img
              src={assets.bin_icon}
              alt="Delete"
              onClick={(e) => {
                toast.promise(handleDeleteChat(e, chat._id), {
                  loading: "Deleting...",
                  success: "Chat deleted",
                  error: "Failed to delete chat",
                });
              }}
              className="hidden group-hover:block w-4 ml-2 cursor-pointer not-dark:invert"
            />
          </div>
        ))}
      </div>

      {/* Community */}
      <div
        onClick={() => {
          navigate("/community");
          setMenuOpen(false);
        }}
        className="flex items-center gap-3 p-3 mt-3 border border-gray-300 dark:border-white/15 rounded-lg cursor-pointer hover:bg-white/5 transition"
      >
        <img
          src={assets.gallery_icon}
          alt="Gallery"
          className="w-5 not-dark:invert"
        />

        <span className="text-sm">Community Images</span>
      </div>

      {/* Credits */}
      <div
        onClick={() => {
          navigate("/credits");
          setMenuOpen(false);
        }}
        className="flex items-center gap-3 p-3 mt-3 border border-gray-300 dark:border-white/15 rounded-lg cursor-pointer hover:bg-white/5 transition"
      >
        <img
          src={assets.diamond_icon}
          alt="Credits"
          className="w-5 dark:invert"
        />

        <div className="flex flex-col">
          <p className="text-sm font-medium">
            Credits: {user?.credits ?? 0}
          </p>

          <p className="text-xs text-gray-400">
            Buy more credits
          </p>
        </div>
      </div>

      {/* Theme Toggle */}
      <div className="flex items-center justify-between p-3 mt-3 border border-gray-300 dark:border-white/15 rounded-lg">
        <div className="flex items-center gap-2">
          <img
            src={assets.theme_icon}
            alt="Theme"
            className="w-4 not-dark:invert"
          />

          <span className="text-sm">Dark Mode</span>
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
            className={`w-10 h-5 rounded-full transition ${
              theme === "dark"
                ? "bg-green-600"
                : "bg-gray-400"
            }`}
          >
            <div
              className={`w-3 h-3 bg-white rounded-full mt-1 transition-transform ${
                theme === "dark"
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            />
          </div>
        </label>
      </div>

      {/* User */}
      <div className="flex items-center gap-3 p-3 mt-3 border border-gray-300 dark:border-white/15 rounded-lg group cursor-pointer hover:bg-white/5 transition">
        <img
          src={assets.user_icon}
          alt="User"
          className="w-8 rounded-full"
        />

        <p className="flex-1 truncate text-sm">
          {user?.name || "Guest"}
        </p>

        {user && (
          <img
            src={assets.logout_icon}
            alt="Logout"
            onClick={(e) => {
              e.stopPropagation();
              logout();
            }}
            className="hidden group-hover:block h-5 cursor-pointer not-dark:invert"
          />
        )}
      </div>

      {/* Mobile Close */}
      <img
        src={assets.close_icon}
        alt="Close"
        onClick={() => setMenuOpen(false)}
        className="absolute top-4 right-4 w-5 cursor-pointer md:hidden not-dark:invert"
      />
    </div>
  );
};

export default Sidebar;
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  // User should initially be null, not dummyUserData
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  const [token, setToken] = useState(
    localStorage.getItem("token") || null
  );

  const [loadingUser, setLoadingUser] = useState(true);

  // Fetch logged-in user
  const fetchUser = async () => {
    if (!token) {
      setUser(null);
      setLoadingUser(false);
      return;
    }

    try {
      const { data } = await axios.get("/api/user/data", {
        headers: {
          Authorization: token,
        },
      });

      if (data.success) {
        setUser(data.user);
      } else {
        setUser(null);
        toast.error(data.message);
      }
    } catch (error) {
      setUser(null);

      toast.error(
        error.response?.data?.message || error.message
      );
    } finally {
      setLoadingUser(false);
    }
  };

  // Fetch user's chats
  const fetchUserChats = async () => {
    // Don't call protected API without authentication
    if (!user || !token) return;

    try {
      const { data } = await axios.get("/api/chat/get", {
        headers: {
          Authorization: token,
        },
      });

      if (data.success) {
        setChats(data.chats);

        // If user has no chats, create one
        if (data.chats.length === 0) {
          await createNewChat();
          return;
        }

        setSelectedChat(data.chats[0]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message
      );
    }
  };

  // Create new chat
  const createNewChat = async () => {
    if (!user || !token) {
      toast("Login to create a new chat");
      navigate("/");
      return;
    }

    try {
      await axios.get("/api/chat/create", {
        headers: {
          Authorization: token,
        },
      });

      await fetchUserChats();
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message
      );
    }
  };

  // Delete chat
  const deleteChat = (chatId) => {
    const updatedChats = chats.filter(
      (chat) => chat._id !== chatId
    );

    setChats(updatedChats);

    if (selectedChat?._id === chatId) {
      setSelectedChat(updatedChats[0] ?? null);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");

    setToken(null);
    setUser(null);
    setChats([]);
    setSelectedChat(null);

    navigate("/");
  };

  // Theme
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  // Check authentication when app starts/token changes
  useEffect(() => {
    if (token) {
      setLoadingUser(true);
      fetchUser();
    } else {
      setUser(null);
      setChats([]);
      setSelectedChat(null);
      setLoadingUser(false);
    }
  }, [token]);

  // Fetch chats only AFTER authentication is finished
  useEffect(() => {
    if (loadingUser) return;

    if (user && token) {
      fetchUserChats();
    } else {
      setChats([]);
      setSelectedChat(null);
    }
  }, [user, token, loadingUser]);

  const value = {
    navigate,

    user,
    setUser,
    fetchUser,

    chats,
    setChats,

    selectedChat,
    setSelectedChat,

    deleteChat,
    logout,

    theme,
    setTheme,

    createNewChat,
    loadingUser,
    fetchUserChats,

    token,
    setToken,
    axios,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
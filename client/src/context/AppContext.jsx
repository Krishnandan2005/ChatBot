import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyChats, dummyUserData } from "../assets/assets";

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChats, setSelectedChats] = useState(null);

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  const fetchUser = async () => {
    setUser();
  };

  const fetchUserChats = async () => {
    setChats(dummyChats);

    if (dummyChats.length > 0) {
      setSelectedChats(dummyChats[0]);
    }
  };

  const deleteChat = (chatId) => {
    const updatedChats = chats.filter(
      (chat) => chat._id !== chatId
    );

    setChats(updatedChats);

    if (selectedChats?._id === chatId) {
      setSelectedChats(updatedChats[0] || null);
    }
  };

  const logout = () => {
    setUser(null);
    setChats([]);
    setSelectedChats(null);
    navigate("/");
  };

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (user) {
      fetchUserChats();
    } else {
      setChats([]);
      setSelectedChats(null);
    }
  }, [user]);

  useEffect(() => {
    fetchUser();
  }, []);

  const value = {
    navigate,

    user,
    setUser,
    fetchUser,

    chats,
    setChats,

    selectedChats,
    setSelectedChats,

    deleteChat,
    logout,

    theme,
    setTheme,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

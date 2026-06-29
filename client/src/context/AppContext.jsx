import { createContext, useContext, useEffect, useState } from "react";
import { data, useNavigate } from "react-router-dom";
import { dummyChats, dummyUserData } from "../assets/assets";
import axios from 'axios';
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(dummyUserData);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light");

    const [token,setToken] = useState(localStorage.getItem('token')|| null)
    const [loadingUser,setLoadingUser] = useState(true)

  // Fetch user 
  const fetchUser = async () => {
      // Backend Integration
    try {
      const { data } = await axios.get("/api/user/data",{headers:{Authorization: token}});
      if (data.success) {
        setUser(data.user);
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
    finally
    {
      setLoadingUser(false);
    }
  };

  const createNewChat = async () => {
    try {
      if(!user) return toast('Login to create a new Chat')
        navigate('/')

      await axios.get('/api/chat/create',{headers:{Authorization: token}})
      await fetchUserChats()
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Fetch chats 
  const fetchUserChats = async () => {
    // Backend Integration
    try {
      const { data } = await axios.get("/api/chat/get",{headers:{Authorization: token}});
      if (data.success) {
        setChats(data.chats);
        // if the user has no chats , create one 
        if(data.chats.length === 0 ){
          await createNewChat()
          return fetchUserChats()
        }
        else 
        setSelectedChat(data.chats[0]);
      }
      else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  };

  // Delete chat
  const deleteChat = (chatId) => {
    const updatedChats = chats.filter((chat) => chat._id !== chatId);

    setChats(updatedChats);

    if (selectedChat?._id === chatId) {
      setSelectedChat(updatedChats[0] ?? null);
    }
  };

  // Logout
  const logout = () => {
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

  // Load chats whenever user changes
  useEffect(() => {
    if (user) {
      fetchUserChats();
    } else {
      setChats([]);
      setSelectedChat(null);
    }
  }, [user]);

  // Load user on app start
  useEffect(() => {
    if(token){
      fetchUser();
    }else{
      setUser(null)
      setLoadingUser(false)
    }
    
  }, [token]);

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
    axios
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
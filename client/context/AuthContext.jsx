import { createContext, useEffect, useState } from "react";
import axios from "axios"; // HTTP client for making requests
import toast from "react-hot-toast";
import { io } from "socket.io-client"; // Import socket.io client for browser

// Set backend base URL from environment variables
const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

// Create the authentication context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // State variables for authentication and socket connection
  const [token, setToken] = useState(localStorage.getItem("token")); // Auth token from localStorage
  const [authUser, setAuthUser] = useState(null); // Authenticated user data
  const [onlineUsers, setOnlineUsers] = useState([]); // List of currently online users
  const [socket, setSocket] = useState(null); // Socket.IO connection instance

  // Checks if the user is authenticated by calling the backend API.
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      // If authenticated:
      if (data.success) {
        // Sets user data
        setAuthUser(data.user);
        // Connects the socket
        connectSocket(data.user);
      }
    } catch (error) {
      toast.error("User Not Authenticated");
    }
  };

  // Login function to handle user authentication and socket connection
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`api/auth/${state}`, credentials);
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
        axios.defaults.headers.common["token"] = data.token; // Set token in Axios headers
        setToken(data.token);
        localStorage.setItem("token", data.token); // Store token in localStorage
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      // axios treat 400 status code (send by backend) as error
      if (error.response && error.response.data) {
        toast.error(error.response.data.message); // Show backend message
      } else {
        toast.error(error.message); // Fallback
      }
    }
  };

  // Logout function to handle user logout and socket disconnection
  const logout = async () => {
    try {
      // Clear user data and token
      setAuthUser(null);
      setToken(null);
      localStorage.removeItem("token");
      setOnlineUsers([]);
      axios.defaults.headers.common["token"] = null; // Remove token from Axios headers
      toast.success("Logged out successfully");
      socket?.disconnect(); // Disconnect the socket if connected
      setSocket(null);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Update profile function to handle user profile updates
  const updateProfile = async (userData) => {
    try {
      const { data } = await axios.put("/api/auth/update", userData);
      if (data.success) {
        setAuthUser(data.user); // Update the authenticated user data
        toast.success("Profile Updated Successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Connects the user to the Socket.IO server for real-time features.
  const connectSocket = (userData) => {
    // Avoids reconnecting if already connected.
    if (!userData || socket?.connected) return; // Prevent duplicate connections

    // Sends `userId` in the connection query.
    const newSocket = io(backendUrl, {
      query: { userId: userData._id },
    });

    newSocket.connect(); // Establish connection
    setSocket(newSocket);

    // Listens for "getOnlineUsers" event and updates the online users list.
    newSocket.on("getOnlineUsers", (userIDs) => {
      setOnlineUsers(userIDs);
    });
  };

  // Runs once on mount — sets token in Axios headers and checks authentication
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["token"] = token;
    }
    checkAuth();
  }, []);

  // Values provided to all components that use AuthContext
  const value = {
    axios,
    token,
    setToken,
    authUser,
    setAuthUser,
    onlineUsers,
    setOnlineUsers,
    socket,
    setSocket,
    updateProfile,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

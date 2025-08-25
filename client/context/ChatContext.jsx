import { createContext, useContext, useEffect, useState } from "react";
import AuthContext from "./authContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  // // State to store unseen messages count for each user { userId: count }
  const [unseenMessages, setUnseenMessages] = useState({});

  // // Import socket connection and axios instance from AuthContext
  const { soket, axios } = useContext(AuthContext);

  // Fetch all users (and unseen messages) for sidebar
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Fetch chat messages of the selected user
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (err) {
      toast.error(err);
    }
  };

  // Send a new message to the selected user
  const sendMessage = async (messageData) => {
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );
      if (data.success) {
        // Append new message to local state
        setMessages((prevMessages) => [...prevMessages, data.newMsg]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Subscribe to real-time messages via socket.io
  // Updates local messages state or unseen message count
  const subscribeToMessages = async () => {
    if (!soket) return;
    // Event emitted by backend when a new message is received
    soket.on("newMessage", (newMessage) => {
      // // If chat window of that user is already open
      if (selectedUser && newMessage.senderID == selectedUser._id) {
        newMessage.seen = true;
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        // Mark message as seen in backend
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        // If chat window is NOT open, increment unseen message count
        setUnseenMessages((prevUnseenMsg) => ({
          ...prevUnseenMsg,
          [newMessage.senderID]: prevUnseenMsg[newMessage.senderID]
            ? prevUnseenMsg[newMessage.senderID] + 1
            : 1,
        }));
      }
    });
  };

  // Unsubscribe from real-time messages (cleans up socket listener to avoid multiple bindings)
  const unsubscribeFromMessages = () => {
    if (soket) soket.off("newMessage");
  };

  // Subscribe when socket/selectedUser changes, clean up on unmount
  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [soket, selectedUser]);

  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    getMessages,
    setMessages,
    sendMessage,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
  };

  // Provide context to children
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

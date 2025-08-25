import Message from "../models/message.js";
import User from "../models/user.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

// Get all users except logged-in user. Also fetch the count of unseen messages from each user
export const getUsers = async (req, res) => {
  try {
    const userID = req.user.id; // Extract the authenticated user's ID

    // Find all users except the logged-in one, and exclude their password field
    const users = await User.find({ _id: { $ne: userID } }).select("-password");

    const unseenMessages = {}; // Store unseen message counts keyed by user ID

    // For each user, find messages they sent to the logged-in user that are not yet seen
    const promises = users.map(async (user) => {
      const messages = await Message.find({
        senderID: user._id,
        receiverID: userID,
        seen: false,
      });

      // If unseen messages exist, store their count
      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
    });

    // Wait for all unseen message counts to be fetched
    await Promise.all(promises);

    // Send the user list along with unseen message counts
    res.status(200).json({ success: true, users, unseenMessages });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all messages between logged-in user and selected user. Also mark messages from the other user as 'seen'
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params; // ID of the other user
    const myId = req.user.id; // Logged-in user's ID

    // Fetch messages sent either way between the two users
    const messages = await Message.find({
      $or: [
        { senderID: myId, receiverID: selectedUserId },
        { senderID: selectedUserId, receiverID: myId },
      ],
    });

    // Mark all messages from the selected user to logged-in user as 'seen'
    await Message.updateMany(
      {
        senderID: selectedUserId,
        receiverID: myId,
      },
      { seen: true }
    );

    // Send back all messages
    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark a specific message as seen using its ID
export const markMessageAsSeen = async (req, res) => {
  try {
    const { messageId } = req.params; // Message ID from URL

    // Update the 'seen' status of the specified message
    await Message.findByIdAndUpdate(messageId, { seen: true });

    // Send back success message
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error marking message as seen:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Controller to handle sending a message to selected user
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body; // Extract message text and optional image from request body
    const receiverID = req.params.id; // ID of the recipient user
    const senderID = req.user.id; // ID of the sender (logged-in user)

    let imageUrl;
    if (image) {
      // If an image is provided, upload it to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: "messages", // Store inside "messages" folder in Cloudinary
      });
      imageUrl = uploadResult.secure_url; // Get the public secure URL
    }

    // Create and save the new message document in the database
    const newMsg = await Message.create({
      text,
      image: imageUrl,
      senderID,
      receiverID,
    });

    // Check if the receiver is online, then emit the new message via Socket.IO
    const receiverSocketId = userSocketMap[receiverID];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMsg);
    }

    // Respond with success and the created message
    res.status(201).json({ success: true, newMsg });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

import express from "express";
import { protectRoutes } from "../middlewares/auth.js";
import {
  getMessages, // Get all messages between logged-in user and selected user
  getUsers, // Get all users except the logged-in user
  markMessageAsSeen, // Mark a specific message as seen
  sendMessage, // Send a message to a specific user
} from "../controllers/messageController.js";

// Create a new Express Router instance
const msgRouter = express.Router();

msgRouter.get("/users", protectRoutes, getUsers);
msgRouter.get("/:id", protectRoutes, getMessages);
msgRouter.put("/mark/:messageId", protectRoutes, markMessageAsSeen);
msgRouter.post("/send/:id", protectRoutes, sendMessage);

export default msgRouter;

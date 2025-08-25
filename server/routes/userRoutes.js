import express from "express";
import {
  authMsg, // Controller to check if user is authenticated
  login, // Controller for user login
  signup, // Controller for user registration
  updateProfile, // Controller for updating user profile
} from "../controllers/userController.js";

import { protectRoutes } from "../middlewares/auth.js"; // Middleware to protect routes

// Create a new Express Router instance
const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.get("/check", protectRoutes, authMsg);
userRouter.put("/update", protectRoutes, updateProfile);

export default userRouter;

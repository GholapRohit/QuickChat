import jwt from "jsonwebtoken"; // Needed to verify JWT tokens
import User from "../models/user.js"; // Mongoose model for user

// Middleware to protect routes - only accessible with a valid token
export const protectRoutes = async (req, res, next) => {
  try {
    // 1. Get token from request headers
    const token = req.headers.token;

    // 2. If no token is provided, deny access
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // 3. Verify token using the secret key
    // jwt.verify() returns the decoded payload if the token is valid
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Find the user by ID from the token payload, excluding the password field
    const user = await User.findById(decoded.id).select("-password");

    // 5. If the user doesn't exist, return error
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 6. Attach user data to the request object for further use in routes
    req.user = user;

    // 7. Move to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

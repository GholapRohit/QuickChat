import { generateToken } from "../lib/utils.js"; // Utility to generate JWT token
import User from "../models/user.js"; // Mongoose User model
import bcrypt from "bcryptjs"; // Library for hashing and comparing passwords
import cloudinary from "../lib/cloudinary.js"; // Cloudinary configuration for image uploads

// -------------------- SIGNUP FUNCTION --------------------
export const signup = async (req, res) => {
  const { fullName, email, password, bio } = req.body; // Extract data from request body

  try {
    // 1. Validate required fields
    if (!fullName || !email || !password || !bio) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 2. Check if a user with this email already exists
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // 3. Generate salt and hash the password
    const salt = await bcrypt.genSalt(10); // Higher salt rounds = stronger hash but slower
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create a new user instance
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword, // Store hashed password instead of plain text
      bio,
    });

    // 5. Save user to database
    await newUser.save();

    // 6. Generate authentication token (JWT)
    const token = generateToken(newUser._id);

    // 7. Send success response
    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: newUser,
      token,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// -------------------- LOGIN FUNCTION --------------------
export const login = async (req, res) => {
  const { email, password } = req.body; // Extract credentials from request body

  try {
    // 1. Validate input fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 2. Check if user exists with given email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email",
      });
    }

    // 3. Compare entered password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    // 4. Generate token for logged-in user
    const token = generateToken(user._id);

    // 5. Send success response
    res.status(200).json({
      success: true,
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Controller to confirm if user is authenticated
export const authMsg = (req, res) => {
  res.status(200).json({
    success: true,
    message: "User is authenticated", // Success message
    user: req.user, // Authenticated user's data (from protectRoutes middleware)
  });
};

// Controller to update authenticated user's profile details
export const updateProfile = async (req, res) => {
  try {
    // Extract updated profile fields from request body
    const { fullName, bio, profilePicture } = req.body;

    // Get the currently authenticated user's ID from the request (added by protectRoutes middleware)
    const userID = req.user.id;

    let updatedUser;

    // If profilePicture is NOT provided, update other fields only
    if (!profilePicture) {
      updatedUser = await User.findByIdAndUpdate(
        userID,
        { fullName, bio }, // Fields to update
        { new: true } // Return the updated document instead of old one
      );
    } else {
      // Upload new profile picture to Cloudinary
      const upload = await cloudinary.uploader.upload(profilePicture, {
        folder: "chat_profile_pictures", // Save images in this Cloudinary folder
      });

      // Update user with new profile picture URL
      updatedUser = await User.findByIdAndUpdate(userID, {
        fullName,
        bio,
        profilePicture: upload.secure_url, // Cloudinary's secure URL for the uploaded image
      });
    }

    // Send success response with updated user
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Import mongoose library for MongoDB object modeling
import mongoose from "mongoose";

// Define the schema (structure) for the User collection
const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    profilePicture: { type: String, default: "" },
    bio: { type: String },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Create a Mongoose model (User) based on the schema
const User = mongoose.model("User", userSchema);

export default User;

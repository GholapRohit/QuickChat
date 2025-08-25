// Import mongoose library for MongoDB connection and modeling
import mongoose from "mongoose";

// Asynchronous function to connect to MongoDB
const connectDB = async () => {
  try {
    // Event listener for successful MongoDB connection
    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected");
    });

    // Connect to MongoDB using the connection string from environment variables
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

export default connectDB;

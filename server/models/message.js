// Import mongoose library for MongoDB object modeling
import mongoose from "mongoose";

// Define the schema (structure) for the Message collection
const messageSchema = new mongoose.Schema(
  {
    senderID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String },
    image: { type: String },
    seen: { type: Boolean, default: false },
  },
  // Automatically add createdAt and updatedAt timestamps
  { timestamps: true }
);

// Create a Mongoose model (Message) based on the schema
const Message = mongoose.model("Message", messageSchema);

export default Message;

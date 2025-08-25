// Import required modules
import express from "express"; // Express framework for building web servers
import "dotenv/config"; // Loads environment variables from .env file
import cors from "cors"; // Enables Cross-Origin Resource Sharing
import http from "http"; // Node.js HTTP server module
import connectDB from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import msgRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io"; // Socket.IO Server class for enabling real-time, bidirectional communication

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Create a new Socket.IO server instance attached to our HTTP server
export const io = new Server(server, {
  cors: {
    origin: "*", // Allows all frontend origins to connect
  },
});

// Store online users in the format: { userID: socketID }
export const userSocketMap = {};

// Triggered when a new client connects to the server
io.on("connection", (socket) => {
  // Extract userID from connection query parameters. (This is sent by the client when they connect)
  const userID = socket.handshake.query.userId;
  console.log(`User connected: ${userID}`);

  // If a valid userID is provided, store their socket ID. (This lets us know which socket belongs to which user)
  if (userID) {
    userSocketMap[userID] = socket.id;
  }

  // Broadcast the updated list of online users to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Object.keys(userSocketMap) = array of currently online user IDs

  // Triggered when a connected client disconnects (closes tab, leaves app, etc.)
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${userID}`);

    // Remove the user from our online users map
    delete userSocketMap[userID];

    // Broadcast the updated online users list again after removal
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  // Listen for new messages from clients
  socket.on("sendMessage", (message) => {
    const receiverSocketId = userSocketMap[message.receiverID];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
    }
  });
});

// Set the port for the server
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
await connectDB();

// Middleware to parse JSON requests with a 5MB limit
app.use(express.json({ limit: "5mb" }));
// Enable CORS for all routes
app.use(cors());

app.use("/api/auth", userRouter);
app.use("/api/messages", msgRouter);

// Basic route for testing server
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Start the server on port 5000 if in development stage
if (process.env.NODE_ENV != "production") {
  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// export server for vercel
export default server;

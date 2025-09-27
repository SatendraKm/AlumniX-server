import express from "express";
import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define a custom temp directory
const tempDir = path.join(__dirname, "temp");

// Ensure the temp directory exists
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Import routes
import userRoute from "./routes/userRoute.js";
import otpRoute from "./routes/otpRoute.js";
import profileRoute from "./routes/profileRoute.js";
import eventRoute from "./routes/eventRoute.js";
import projectRoute from "./routes/projectRoute.js";
import jobRoute from "./routes/jobRoute.js";
import messageRoute from "./routes/messagesRoute.js";
import postRoute from "./routes/postRoute.js";
import groupRoute from "./routes/groupRoute.js";
import groupMessageRoute from "./routes/groupMessage.js";
import reUnionRoute from "./routes/reunionRoute.js";
import storyRoute from "./routes/storyRoute.js";
import volunteerRoute from "./routes/volunteerRoute.js";
import donationRoute from "./routes/donationRoute.js";
import communityRoute from "./routes/communityRoute.js";
import mentorshipRoute from "./routes/mentorshipRoute.js";
import fundingRoute from "./routes/fundingRoute.js";
import recommdationRoute from "./routes/recommdationRoute.js";
import adminRoute from "./routes/adminRoute.js";
import organizationRoute from "./routes/organizationRoutes.js";

// Setup middleware
app.use(
  cors({
    origin: [
      "https://n-square-backend.onrender.com",
      "https://network-next-backend.onrender.com",
      "https://n-square.vercel.app",
      "http://localhost:5173",
      "http://localhost:3001",
      "https://n-square-chat-app.vercel.app",
    ],
    methods: "GET,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: tempDir, // Use the custom temp directory
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

// Database connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Database connection is ready.");
  })
  .catch((err) => {
    console.log("Database connection failed. Exiting now...", err);
    process.exit(1);
  });

// Cloudinary Connection
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Socket.IO Connection with improved reconnection settings
const io = new Server(server, {
  cors: {
    origin: [
      "https://n-square-backend.onrender.com",
      "https://network-next-backend.onrender.com",
      "https://n-square.vercel.app",
      "http://localhost:5173",
      "http://localhost:3001",
      "https://n-square-chat-app.vercel.app",
    ],
    credentials: true,
  },
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  pingInterval: 25000,
  pingTimeout: 60000,
});

// Store online users with support for multi-device connections
global.onlineUsers = new Map();

// Store active group chats (groupId -> Set of socket IDs)
global.groupChats = new Map();

io.on("connection", (socket) => {
  console.log(`New connection established: ${socket.id}`);

  // Add user to the online users map
  socket.on("add-user", (userId) => {
    console.log(`User added with ID: ${userId}`);
    if (!userId) {
      console.error("Invalid userId received.");
      return;
    }
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set()); // Use Set for better handling of unique socket IDs
    }
    onlineUsers.get(userId).add(socket.id);
  });

  // Handle message sending to individual users
  socket.on("send-msg", (data) => {
    if (!data.to || !data.msg) {
      console.error("Incomplete message data:", data);
      return;
    }
    console.log(`Message from ${data.from} to ${data.to}: ${data.msg}`);
    const sendUserSockets = onlineUsers.get(data.to);
    if (sendUserSockets) {
      sendUserSockets.forEach((sendUserSocket) => {
        console.log(`Sending message to socket: ${sendUserSocket}`);
        io.to(sendUserSocket).emit("msg-recieve", {
          from: data.from,
          msg: data.msg,
        });
      });
    } else {
      console.log(`User ${data.to} is currently offline.`);
    }
  });

  // Handle adding users to a group
  socket.on("join-group", (groupId, userId) => {
    console.log(`User ${userId} is joining group: ${groupId}`);
    if (!groupChats.has(groupId)) {
      groupChats.set(groupId, new Set()); // Initialize the group if not already present
    }
    groupChats.get(groupId).add(socket.id); // Add the user's socket to the group
  });

  // Handle message sending to a group
  socket.on("send-group-msg", (data) => {
    if (!data.groupId || !data.msg || !data.from) {
      console.error("Incomplete group message data:", data);
      return;
    }
    console.log(
      `Group message from ${data.from} to group ${data.groupId}: ${data.msg}`
    );

    const groupSockets = groupChats.get(data.groupId);
    if (groupSockets) {
      groupSockets.forEach((groupSocket) => {
        console.log(`Sending message to socket: ${groupSocket}`);
        io.to(groupSocket).emit("group-msg-receive", {
          from: data.from,
          msg: data.msg,
        });
      });
    } else {
      console.log(`Group ${data.groupId} does not exist.`);
    }
  });

  // Handle user leaving a group
  socket.on("leave-group", (groupId) => {
    console.log(`Socket ${socket.id} is leaving group ${groupId}`);
    const groupSockets = groupChats.get(groupId);
    if (groupSockets) {
      groupSockets.delete(socket.id); // Remove the user's socket from the group
      if (groupSockets.size === 0) {
        groupChats.delete(groupId); // Remove the group if no active users remain
      }
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);

    // Remove socket ID from all users
    for (const [userId, sockets] of onlineUsers.entries()) {
      sockets.delete(socket.id); // Remove socket ID from Set
      if (sockets.size === 0) {
        onlineUsers.delete(userId); // Remove user if no active connections
      }
    }

    // Remove socket ID from all group chats
    for (const [groupId, sockets] of groupChats.entries()) {
      sockets.delete(socket.id); // Remove socket from group
      if (sockets.size === 0) {
        groupChats.delete(groupId); // Delete group if no active users remain
      }
    }
  });

  // Cleanup for unexpected errors
  socket.on("error", (err) => {
    console.error(`Error on socket ${socket.id}:`, err.message);
  });
});

// Base API URL
const api = process.env.API_URL;

// Routes
app.use(`${api}/users`, userRoute);
app.use(`${api}/otp`, otpRoute);
app.use(`${api}/profile`, profileRoute);
app.use(`${api}/event`, eventRoute);
app.use(`${api}/project`, projectRoute);
app.use(`${api}/jobs`, jobRoute);
app.use(`${api}/messages`, messageRoute);
app.use(`${api}/post`, postRoute);
app.use(`${api}/groups`, groupRoute);
app.use(`${api}/group-message`, groupMessageRoute);
app.use(`${api}/reunions`, reUnionRoute);
app.use(`${api}/stories`, storyRoute);
app.use(`${api}/volunteer`, volunteerRoute);
app.use(`${api}/donation`, donationRoute);
app.use(`${api}/mentorship`, mentorshipRoute);
app.use(`${api}/community`, communityRoute);
app.use(`${api}/funding`, fundingRoute);
app.use(`${api}/recommadation`, recommdationRoute);
app.use(`${api}/organization`, adminRoute);
app.use(`${api}/organizations`, organizationRoute);

// Root endpoint
app.get("/", (req, res) => {
  res.send("Welcome to Home Page");
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

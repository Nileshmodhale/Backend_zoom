import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";
import cors from "cors";
import userRoutes from "./routes/users.routes.js";

const app = express();
const server = createServer(app);

// Configure CORS for both Express and Socket.io
const allowedOrigins = [
  "https://frontend-zoom.vercel.app",
  "http://localhost:3000",  // For local development
  // Add any other origins you need
];

// CORS for Express
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Setup Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST","PUT","DELETE"],
    credentials: true
  }
});

// Use your connection function
connectToSocket(io);

app.set("port", (process.env.PORT || 8000));
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);

// Add a basic route for testing
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

const start = async () => {
    try {
        const connectionDb = await mongoose.connect("mongodb+srv://kalelamol07:ak%40123@cluster0.soe58o3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
        
        console.log(`MONGO Connected DB Host: ${connectionDb.connection.host}`);
        server.listen(app.get("port"), () => {
            console.log(`LISTENING ON PORT ${app.get("port")}`);
        });
    } catch (error) {
        console.error("Failed to connect to database or start server:", error);
        process.exit(1);
    }
};

start();
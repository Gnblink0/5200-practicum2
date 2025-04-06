require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Import routes
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const doctorScheduleRoutes = require("./routes/doctorScheduleRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Detailed CORS configuration
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-User-Email",
      "X-User-UID",
    ],
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test routes
app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

app.get("/test", (req, res) => {
  res.json({
    message: "Server is running",
    mongoStatus:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    mongoDetails: {
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
      uri: process.env.MONGODB_URI,
    },
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
    },
  });
});

// Connect to MongoDB
console.log(
  "Attempting to connect to MongoDB with URI:",
  process.env.MONGODB_URI
);

// Add connection options
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // 5 second timeout
  socketTimeoutMS: 45000, // 45 second timeout
  family: 4, // Use IPv4, skip trying IPv6
};

mongoose
  .connect(process.env.MONGODB_URI, mongooseOptions)
  .then(() => {
    console.log("Successfully connected to MongoDB");
    console.log("Database name:", mongoose.connection.name);
    console.log("Host:", mongoose.connection.host);
    console.log("Port:", mongoose.connection.port);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    console.error("Error name:", err.name);
    console.error("Error code:", err.code);
    console.error("Error message:", err.message);
    console.error("MongoDB URI:", process.env.MONGODB_URI);
    process.exit(1);
  });

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected");
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

// API routes
app.use("/api/users", userRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/schedules", doctorScheduleRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

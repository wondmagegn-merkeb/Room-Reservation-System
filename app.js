import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path"; // Add path module to resolve the uploads directory
import cors from "cors";
import { fileURLToPath } from "url";

// Import routes
import amenityRoutes from "./src/routes/amenityRoutes.js";
import roomsRoutes from "./src/routes/roomRoutes.js";
import roomTypeRoutes from "./src/routes/roomTypeRoutes.js";
import amenitiesRoutes from "./src/routes/amenitiesRoutes.js";
import roomImagesRoutes from "./src/routes/roomImagesRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js"
import reservationRoutes from "./src/routes/reservationRouter.js";
import userRouter from "./src/routes/userRoutes.js"; // Adjust the path as needed
import guestRoutes  from "./src/routes/guestRoutes.js";
import logRoutes from "./src/routes/logRoutes.js"
import multer from "multer";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
// Use cookie-parser middleware to parse cookies in the request
app.use(cookieParser()); // This must be before your routes

// Define __dirname manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "/uploads")));

// Middleware
app.use(bodyParser.json());
// Example of configuring CORS
const corsOptions = {
  origin: process.env.BASE_URL, // Allow requests only from this origin
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Allow only these HTTP methods
};

app.use(cors());

// Routes
app.use("/api/user", userRouter);
app.use("/api/room-types", roomTypeRoutes);
app.use("/api/rooms", roomsRoutes);
app.use("/api/guests", guestRoutes);
app.use("/api/amenities", amenityRoutes);
app.use("/api/room-images", roomImagesRoutes);
app.use("/api/amenity-to-room-types", amenitiesRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/logs", logRoutes);

// Handle multer error and send success response
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Log Multer-specific errors
    console.error('Multer Error:', err);
    res.status(400).json({ success: false, statusCode: 400, error: err.message });
  } else if (err) {
    // Log other errors
    console.error('General Error:', err);
    res.status(500).json({ success: false, statusCode: 500, error: err.message });
  } else {
    // Success response
    res.status(200).json({ success: true, statusCode: 200, message: "File uploaded successfully" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

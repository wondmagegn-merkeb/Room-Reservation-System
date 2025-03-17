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
app.use("/api", userRouter);
app.use("/api/room-types", roomTypeRoutes);
app.use("/api/rooms", roomsRoutes);
app.use("/api/guests", guestRoutes);
app.use("/api/amenities", amenityRoutes);
app.use("/api/room-images", roomImagesRoutes);
app.use("/api/amenity-to-room-types", amenitiesRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/logs", logRoutes);


// handle multer error
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    res.status(400).json({ error: err.message });
  } else if (err) {
    // Other errors
    res.status(500).json({ error: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

import nodemailer from "nodemailer";

// Generate a random 6-digit OTP code
const otp = Math.floor(100000 + Math.random() * 900000).toString();

// Create a transporter object
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "wondmagegnmerkebbeleka@gmail.com",
    pass: "jfwp dcrm khrm ypsd", // Use OAuth or environment variables for better security
  },
});

// Email options
const mailOptions = {
  from: "wondmagegnmerkebbeleka@gmail.com",
  to: "wondmagegnmerkbebeleka@gmail.com",
  subject: "Your OTP Code",
  html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; text-align: center;">
            <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 10px; 
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #2D89EF;">Your OTP Code</h2>
                <p style="font-size: 16px; color: #555;">
                    Use the code below to complete your verification. This code is valid for <strong>5 minutes</strong>.
                </p>
                <div style="font-size: 24px; font-weight: bold; color: #2D89EF; 
                            padding: 10px; background: #f1f1f1; display: inline-block; border-radius: 5px;">
                    ${otp}
                </div>
                <p style="font-size: 14px; color: #999; margin-top: 20px;">
                    If you did not request this, please ignore this email.
                </p>
            </div>
        </div>
    `,
};

// // Send email
// transporter.sendMail(mailOptions, (error, info) => {
//   if (error) {
//     console.error("Error:", error);
//   } else {
//     console.log("Email sent:", info.response);
//   }
// });

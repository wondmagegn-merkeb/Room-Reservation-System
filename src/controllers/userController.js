import { prisma } from "../prismaClient.js";
import { hashPassword, comparePassword } from "../utils/hashPassword.js";
import { pathGenerator } from "../utils/pathGenerator.js";
import { UnlinkImage } from "../utils/UnlinkImage.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import crypto from "crypto";
import {sendVerificationEmail} from '../middlewares/emailVerification.js'
import { sendOTPEmail, saveOTP, verifyOTP } from "../utils/otpService.js"; 

// Register User
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, password, email, phone, role } = req.body;

    // Check for missing required fields
    if (!firstName || !lastName || !password || !email || !phone) {
      return res.status(400).json({ success: false,
message: "Missing required fields" });
    }

    // Check if the email or phone already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      // Clean up uploaded file if an error occurs
      if (req.file) {
        UnlinkImage(req.file.filename); // Delete the uploaded file
      }

      return res.status(400).json({
        success: false,
        error:
          existingUser.email === email
            ? "Email already exists. Please try another one."
            : "Phone number already exists. Please try another one.",
      });
    }
    // Check if the email or phone already exists
    const existingGuest = await prisma.guest.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingGuest) {
      return res.status(400).json({
        success: false,
        error:
          existingGuest.email === email
            ? "Email already exists. Please try another one."
            : "Phone number already exists. Please try another one.",
      });
    }

    // Hash the password (assume you have a `hashPassword` utility)
    const hashedPassword = await hashPassword(password);

    // Process file upload only after validation
    const image = req.file?.filename || "";
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create the user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        role,
        password: hashedPassword,
        image,
        verificationToken,
      },
    });

    const { password: _, ...users } = user;

    // Log the successful user registration
    await prisma.log.create({
      data: {
        category: "CREATE", // Category could be "CREATE" for user creation
        description: `User registered successfully. Email: ${email}, Phone: ${phone}`,
        performedBy: req.user.id
      },
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    return res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please check your email to verify your account.",
      ...users,
      image: pathGenerator(image),
    });
  } catch (error) {
    // Delete uploaded file if error occurred
    if (req.file) UnlinkImage(req.file.filename); // Delete the uploaded file on error
    console.log(error);

    // Handle specific Prisma error codes
    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        error:
          "A user with this email or phone already exists. Please try a different one.",
      });
    }

    // Additional handling for validation or other errors
    if (error.message.includes("validation")) {
      return res
        .status(422)
        .json({ 
          success: false,error: "Validation failed", details: error.message });
    }

    // Default error handler for any other unexpected issues
    return res
      .status(500)
      .json({success: false,message: "Error registering user", error: error.message });
  }
};
// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    // Fetch users from the database
    const userdata = await prisma.user.findMany({
      where: {
        id: {
          not: req.user.id, // Exclude the user with the given ID
        },
      },
    });

    const users = userdata.map(({ password, image, ...users }) => ({
      ...users,
      image: pathGenerator(image), // Remove password
    }));

    // Check if no users are found
    if (!users || users.length === 0) {
      return res.status(404).json({
        success: true,
        message: "No users found",
      });
    }

    // Send a success response with the list of users
    return res.status(200).json({ success: true, users });
  } catch (error) {
    // Log the error to the console for debugging
    console.error("Error fetching users:", error.message || error); // Log the error message or the error itself

    // Return an error response
    return res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message || error,
    });
  }
};
// Get User by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching user with ID:", id);

    // Fetch the user by ID
    const user = await prisma.user.findUnique({ where: { id: id } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Exclude password and generate image path
    const { password, ...users } = user;
    const image = pathGenerator(user.image);

    // Send a success response with the user data
    return res.status(200).json({
      success: true,
      user: { ...users, image },
    });
  } catch (error) {
    // Log the error message to the console for debugging
    console.error("Error fetching user:", error.message || error);

    // Return an error response with success flag set to false
    return res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message || error,
    });
  }
};
// Update User
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone } = req.body;
    
    // Find the user
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.id !== id) {
      return res
        .status(400)
        .json({ success: false, message: "Access Forbidden: Insufficient Role" });
    }
    
    // Check if email or phone already exists (excluding the current user)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
        NOT: { id: id },
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error:
          existingUser.email === email
            ? "Email already exists. Please try another one."
            : "Phone number already exists. Please try another one.",
      });
    }
       
    // Track changes before and after update
    const changes = [];
    if (user.firstName !== firstName) changes.push(`First Name: ${user.firstName} -> ${firstName}`);
    if (user.lastName !== lastName) changes.push(`Last Name: ${user.lastName} -> ${lastName}`);
    if (user.email !== email) changes.push(`Email: ${user.email} -> ${email}`);
    if (user.phone !== phone) changes.push(`Phone: ${user.phone} -> ${phone}`);

    if (user.email !== email) {
      // Send verification email
      const verificationToken = crypto.randomBytes(32).toString("hex");

      await prisma.user.update({
        where: { id: id },
        data: {
          verificationToken,
          status: "INACTIVE",
        },
      });

      // Send verification email
      await sendVerificationEmail(email, verificationToken);
      changes.push("Status changed to INACTIVE, verification email sent.");
    }

    // Update user in the database
    const updatedUserData = await prisma.user.update({
      where: { id: id },
      data: {
        firstName,
        lastName,
        email,
        phone,
      },
    });

    // Create a log entry for the update operation
    await prisma.log.create({
      data: {
        category: "UPDATE", // Category for the operation
        description: `Updated user with ID ${id}. Changes: ${changes.join(", ")}`, // Include changes in description
        performedBy: req.user.id, // The user performing the action
      },
    });

    const { password: _, ...updatedUser } = updatedUserData;

    // Send success response
    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      ...updatedUser,
      image: pathGenerator(updatedUser.image),
    });
  } catch (error) {
    // Log the error message to the console for debugging
    console.error("Error updating user:", error.message || error);

    // Return an error response with success flag set to false
    return res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message || error,
      errorStack: error.stack
    });
  }
};
// Update Profile Photo Route
export const ProfileUser = async (req, res) => {
  try {
    const { id } = req.params;
    const profilePhoto = req.file ? req.file.filename : null;

    // Check if a file is uploaded
    if (!profilePhoto) {
      console.error("No file uploaded");
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Find the user by ID
    const user = await prisma.user.findUnique({ where: { id: id } });
    if (!user) {
      console.error(`User with ID ${id} not found`);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Delete old profile photo if it exists
    if (user.image) {
      UnlinkImage(user.image);
      console.log(`Deleted old profile photo: ${user.image}`);
    }

    // Update the user's profile photo in the database
    await prisma.user.update({
      where: { id: id },
      data: {
        image: profilePhoto,
      },
    });

    res.json({
      success: true,
      message: "Profile photo updated successfully",
      photoUrl: `/uploads/${profilePhoto}`,
    });
  } catch (error) {
    // Log the error message for debugging
    console.error("Error updating user profile photo:", error);

    // Return an error response
    res.status(500).json({
      success: false,
      message: "Error updating user profile photo",
      error: error.message,
    });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Create a log entry before deleting the user
    await prisma.log.create({
      data: {
        category: "DELETE", // Category for the operation
        description: `Deleted user with ID ${id} (${user.firstName} ${user.lastName})`, // Description with user details
        performedBy: req.user.id, // The user performing the action
      },
    });

    // Delete user image file if exists
    UnlinkImage(user.image);

    // Delete the user from the database
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    // Send a success response
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    // Handle errors and unlink image if necessary
    console.error("Error deleting user:", error);
    UnlinkImage(req.file?.filename);
    res.status(500).json({ message: "Error deleting user", error });
  }
};

// Change User Status
export const changeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Expecting status to be either 'ACTIVE' or 'INACTIVE'

    // Validate status value
    if (!["ACTIVE", "BLOCK"].includes(status)) {
      console.error("Invalid status value:", status);
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    // Find the user
    const user = await prisma.user.findUnique({ where: { id: id } });
    if (!user) {
      console.error(`User with ID ${id} not found`);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Remove verification token if it exists
    if (user.verificationToken) {
      await prisma.user.update({
        where: { id: id },
        data: {
          verificationToken: null,
        },
      });
      console.log(`Verification token removed for user with ID ${id}`);
    }

    // Update user status in the database
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: {
        status,
      },
    });

    // Log the status change operation
    await prisma.log.create({
      data: {
        category: "UPDATE",
        description: `Changed status of user with ID ${id} from ${user.status} to ${status}`,
        performedBy: req.user.id,
      },
    });


    // Send a success response
    res.status(200).json({ success: true, message: "User status updated", updatedUser });
  } catch (error) {
    // Log the error for debugging
    console.error("Error updating user status:", error);

    // Send error response
    res.status(500).json({
      success: false,
      message: "Error updating status",
      error: error.message || error,
      errorStack: error.stack
    });
  }
};
// Change Password
export const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      console.error("Password is required");
      return res.status(400).json({ success: false, message: "Password is required" });
    }

    // Find the user by ID
    const user = await prisma.user.findUnique({ where: { id: id } });
    if (!user) {
      console.error(`User with ID ${id} not found`);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.id !== id) {
      console.error("Access Forbidden: Insufficient Role");
      return res.status(400).json({ success: false, message: "Access Forbidden: Insufficient Role" });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Update the user's password
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: {
        password: hashedPassword,
      },
    });

    // Create a log entry for password change
    await prisma.log.create({
      data: {
        category: "UPDATE",
        description: `Changed password for user with ID ${id} (${user.firstName} ${user.lastName})`,
        performedBy: req.user.id,
      },
    });

    // Respond with success message
    console.log(`Password successfully updated for user ID ${id}`);
    return res.status(200).json({
      success: true,
      message: "Password successfully updated",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
      },
    });

  } catch (error) {
    console.error('Error updating password:', error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the password",
      error: error.message || error,
    });
  }
};

// Forgot Password (send OTP)
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error(`User with email ${email} not found`);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Generate OTP and send email
    const otp = await saveOTP(email);
    await sendOTPEmail(email, otp);

    console.log(`OTP sent to email: ${email}`);
    return res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("Error processing forgot password request:", error);
    return res.status(500).json({
      success: false,
      message: "Error processing the request",
      error: error.message,
    });
  }
};

// Reset Password (verify OTP and reset password)
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    // Verify OTP
    const isOtpValid = await verifyOTP(email, otp);
    if (!isOtpValid) {
      console.error("Invalid or expired OTP");
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password in the database
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    console.log(`Password successfully reset for user with email: ${email}`);
    return res.status(200).json({ success: true, message: "Password successfully reset" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({
      success: false,
      message: "Error resetting password",
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required","body":req.body });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Validate password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    if (user.status !== "ACTIVE")
      return res
        .status(401)
        .json({ success: false, message: "Please verify your email before logging in." });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set cookies for both tokens
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      sameSite: "Strict",
      maxAge: 1000 * 60 * 60 * 12, // 12 hours
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    // Log the login action
    await prisma.log.create({
      data: {
        category: "LOGIN",
        description: `User ${user.firstName} ${user.lastName} logged in`,
        performedBy: user.id,
      },
    });

    // Send response with userId, role, and user name
    return res.status(200).json({
      success: true,
      message: "Login successful",
    });

  } catch (error) {
    // Log the error message to the console for debugging
    console.error("Error logging in:", error.message || error);  // log the error message
    return res.status(500).json({ success: false, message: "Error logging in", error });
  }
};

// Logout User
export const logoutUser = async (req, res) => {
  try {
    // Clear cookies for access_token and refresh_token
    res.clearCookie("access_token", {
      httpOnly: true,
      sameSite: "Strict",
    });

    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    // Log the logout action
    await prisma.log.create({
      data: {
        category: "LOGOUT",
        description: `User with ID ${req.user.id} logged out`,
        performedBy: req.user.id,
      },
    });

    // Send success response
    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    // Log the error message for debugging
    console.error("Error logging out:", error.message || error);

    return res.status(500).json({
      success: false,
      message: "Error logging out",
      error: error.message || error,
    });
  }
};

// Refresh Access Token
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return res.status(403).json({ message: "Refresh token not provided" });
    }

    // Verify the refresh token (using your method, e.g., jwt.verify)
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Generate new access token
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    const newAccessToken = generateAccessToken(user);

    // Send new access token in response cookies
    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 1000 * 60 * 15, // 15 minutes
    });

    return res.status(200).json({ message: "Access token refreshed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error refreshing token", error });
  }
};

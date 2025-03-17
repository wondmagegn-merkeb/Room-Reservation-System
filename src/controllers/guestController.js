import { prisma } from "../prismaClient.js";
import { sendOTPEmail, saveOTP, verifyOTP } from "../utils/otpService.js"; 
import { hashPassword, comparePassword } from "../utils/hashPassword.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.js";
// Register Guest

export const registerGuest = async (req, res) => {
  try {
    const { firstName, lastName, password, email, phone } = req.body;
    // Check for missing required fields
    if (!firstName || !lastName || !password || !email || !phone) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if the email or phone already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

  if (existingUser) {
    return res.status(400).json({
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
        error:
          existingGuest.email === email
            ? "Email already exists. Please try another one."
            : "Phone number already exists. Please try another one.",
      });
    }

    // Hash the password (assume you have a `hashPassword` utility)
    const hashedPassword = await hashPassword(password);

    const otp = await saveOTP(email);
    await sendOTPEmail(email, otp);

    // Create the user
    const user = await prisma.guest.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        status: "INACTIVE",
      },
    });

    const { password: _, ...users } = user;

    // Log the successful user registration
    await prisma.guestLog.create({
      data: {
        category: "CREATE", // Category could be "CREATE" for user creation
        description: `Guest registered successfully. Email: ${email}, Phone: ${phone}`,
        performedBy: user.id,
      },
    });



    return res.status(201).json({
      message:
        "User registered successfully. Please check your email to verify your account.",
      ...users,
    });
  } catch (error) {

    // Handle specific Prisma error codes
    if (error.code === "P2002") {
      return res.status(400).json({
        error:
          "A user with this email or phone already exists. Please try a different one.",
      });
    }

    // Additional handling for validation or other errors
    if (error.message.includes("validation")) {
      return res
        .status(422)
        .json({ error: "Validation failed", details: error.message });
    }
    // Default error handler for any other unexpected issues
    return res
      .status(500)
      .json({ message: "Error registering guest", error: error.message });
  }
};

export const activeGuest = async (req,res) => {
    const { email,otp } = req.body;
      try {
        // Verify OTP
        const isOtpValid = await verifyOTP(email, otp);
        if (!isOtpValid) {
          return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // Update password in the database
        await prisma.guest.update({
          where: { email },
          data: { status: "ACTIVE" },
        });

        return res.status(200).json({ message: "Guest successfully active" });
      } catch (error) {
        return res
          .status(500)
          .json({ message: "Error active account", error: error.message });
      }

}

// Get All Guest
export const getAllGuests = async (req, res) => {
  try {
    // Fetch users from the database
   const guestdata = await prisma.guest.findMany();

    const guest = guestdata.map(({ password, image, ...guest }) => ({
      ...guest,
    }));

    // Check if no users are found
    if (!guest || guest.length === 0) {
      return res.status(404).json({ message: "No guest found" });
    }

    // Log the operation in the Log table
    await prisma.log.create({
      data: {
        category: "READ", // Category could be READ since you're retrieving data
        description: "Fetched all Guest", // Description of the action
        performedBy: req.user.id, // Assuming the user who performed the action is logged in
      },
    });
  
    // Send a success response with the list of users
    return res.status(200).json({ guest });
  } catch (error) {

    // Return an error response
    return res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};
// Get Guest by ID
export const getGuestById = async (req, res) => {
  try {
    const { id } = req.params;
    // Fetch the user by ID
    const guest = await prisma.guest.findUnique({ where: { id: id } });
    if (!guest) return res.status(404).json({ message: "Guest not found" });

    if(req.user.role !== "GUEST"){
      // Create a log entry for the READ operation, including the user's name
      await prisma.log.create({
        data: {
          category: "READ", // Category could be READ since you're retrieving data
          description: `Fetched guest with ID ${id} (${guest.firstName} ${guest.lastName})`, // Description with user's name
          performedBy: req.user.id, // The user performing the action
        },
      }); 
    }
    // Exclude password and generate image path
    const { password, ...Guest } = guest;

    // Send a success response with the user data
    res.status(200).json({ ...Guest });
  } catch (error) {
    // Log the error and return a response
    console.error(error);
    res.status(500).json({ message: "Error fetching Guest", error });
  }
};

export const sendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const otp = await saveOTP(email);
    await sendOTPEmail(email, otp);
   
    return res
      .status(200)
      .json({ message: "Please check your email to verify your account." });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error active account", error: error.message });
  }
};

export const loginGuest = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const guest = await prisma.guest.findUnique({ where: { email } });
    if (!guest) return res.status(404).json({ message: "Guest not found" });

    // Validate password
    const isPasswordValid = await comparePassword(password, guest.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid credentials" });

    if (guest.status !== "ACTIVE")
      return res
        .status(401)
        .json({ message: "Please verify your email before logging in." });

    const data = { id: guest.id, email: guest.email, role: "GUEST" };
    // Generate tokens
    const accessToken = generateAccessToken(data);
    const refreshToken = generateRefreshToken(data);

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
    await prisma.guestLog.create({
      data: {
        category: "LOGIN",
        description: `Guest ${guest.firstName} ${guest.lastName} logged in`,
        performedBy: guest.id,
      },
    });

    // Send response with userId, role, and user name
    return res.status(200).json({
      message: "Login successful",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error logging in", error });
  }
};

// Update User
export const updateGuest = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone } = req.body;

    // Find the user
    const guest = await prisma.guest.findUnique({ where: { id } });
    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }


    if (guest.id !== id) {
      return res
        .status(400)
        .json({ message: "Access Forbidden: Insufficient Role" });
    }

    // Check if email or phone already exists (excluding the current user)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }]
      },
    });

    if (existingUser) {
      return res.status(400).json({
        error:
          existingUser.email === email
            ? "Email already exists. Please try another one."
            : "Phone number already exists. Please try another one.",
      });
    }

    // Check if email or phone already exists (excluding the current user)
    const existingGuest = await prisma.guest.findFirst({
      where: {
        OR: [{ email }, { phone }],
        NOT: { id: id },
      },
    });

    if (existingGuest) {
      return res.status(400).json({
        error:
          existingGuest.email === email
            ? "Email already exists. Please try another one."
            : "Phone number already exists. Please try another one.",
      });
    }

    // Track changes before and after update
    const changes = [];
    if (guest.firstName !== firstName)
      changes.push(`First Name: ${guest.firstName} -> ${firstName}`);
    if (guest.lastName !== lastName)
      changes.push(`Last Name: ${guest.lastName} -> ${lastName}`);
    if (guest.email !== email) changes.push(`Email: ${guest.email} -> ${email}`);
    if (guest.phone !== phone) changes.push(`Phone: ${guest.phone} -> ${phone}`);

    if (guest.email !== email) {

      await prisma.guest.update({
        where: { id: id },
        data: {
          status: "INACTIVE",
        },
      });

      // Send verification email
        const otp = await saveOTP(email);
        await sendOTPEmail(email, otp);
      changes.push("Status changed to INACTIVE, otp email sent.");
    }
    // Update user in the database
    const updatedGuestData = await prisma.guest.update({
      where: { id: id },
      data: {
        firstName,
        lastName,
        email,
        phone,
      },
    });

    // Create a log entry for the update operation
    await prisma.guestLog.create({
      data: {
        category: "UPDATE", // Category for the operation
        description: `Updated guest with ID ${id}. Changes: ${changes.join(
          ", "
        )}`, // Include changes in description
        performedBy: req.user.id, // The user performing the action
      },
    });

    const { password: _, ...updatedUser } = updatedGuestData;

    // Send success response
    res.status(200).json({
      message: "Guest updated successfully",
      ...updatedUser,
    });
  } catch (error) {
    console.error("Error updating guest:", error);
    res.status(500).json({ message: "Error updating guest", error: error.message });
  }
};

// Change Password
export const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Find the user by ID
    const guest = await prisma.guest.findUnique({ where: { id: id } });
    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }

    if (guest.id !== id) {
      return res
        .status(400)
        .json({ message: "Access Forbidden: Insufficient Role" });
    }
    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Update the user's password
    const updatedGuest = await prisma.guest.update({
      where: { id: id },
      data: {
        password: hashedPassword,
      },
    });

    // Create a log entry for password change
    await prisma.guestLog.create({
      data: {
        category: "UPDATE", // Category for the operation
        description: `Changed password for Guest with ID ${id} (${guest.firstName} ${guest.lastName})`, // Description of the action
        performedBy: req.user.id, // The user performing the action
      },
    });

    // Respond with success message
    return res.status(200).json({
      message: "Password successfully updated",
      user: {
        id: updatedGuest.id,
        email: updatedGuest.email, // Include other user details as needed
      }
    });

  } catch (error) {

    // Respond with a generic error message
    return res.status(500).json({
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
    const guest = await prisma.guest.findUnique({ where: { email } });
    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }


   const otp = await saveOTP(email);
   await sendOTPEmail(email, otp);

    return res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error processing the request", error: error.message });
  }
};

// Reset Password (verify OTP and reset password)
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    // Verify OTP
    const isOtpValid = await verifyOTP(email, otp);
    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password in the database
    await prisma.guest.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return res.status(200).json({ message: "Password successfully reset" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error resetting password", error: error.message });
  }
};

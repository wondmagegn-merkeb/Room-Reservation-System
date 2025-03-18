import express from "express";
import {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  ProfileUser,
  deleteUser,
  changeStatus,
  changePassword,
  resetPassword,
  forgotPassword,
  logoutUser
} from "../controllers/userController.js";
import { upload } from "../utils/multerConfig.js"; // Import the image upload middleware
import { authorizeRoles } from "../utils/authorizeRole.js";
import { verifyEmail } from "../middlewares/emailVerification.js";

const router = express.Router();

router.post("/register", authorizeRoles(["ADMIN"]), upload.single("file"), registerUser);
router.get("/auth/verify-email", verifyEmail);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/", authorizeRoles(["ADMIN"]), getAllUsers);
router.get("/:id", authorizeRoles(["ADMIN", "ROOM_MANAGER", "RECEPTIONIST"]), getUserById);
router.put("/:id", authorizeRoles(["ADMIN", "ROOM_MANAGER", "RECEPTIONIST"]),  updateUser);
router.put("/update-profile-photo/:id", authorizeRoles(["ADMIN", "ROOM_MANAGER", "RECEPTIONIST"]), upload.single("file"), ProfileUser);
router.delete("/:id", authorizeRoles(["ADMIN"]), deleteUser);
router.patch("/:id", authorizeRoles(["ADMIN"]), changeStatus);
router.patch("/password/:id", authorizeRoles(["ADMIN", "ROOM_MANAGER", "RECEPTIONIST"]), changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;

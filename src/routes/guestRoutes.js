import express from "express";
import * as guestController from "../controllers/guestController.js";
import { authorizeRoles } from "../utils/authorizeRole.js";

const router = express.Router();

router.post("/register", guestController.registerGuest);
router.post("/active", guestController.activeGuest);
router.post("/otp", guestController.sendOtp);
router.post("/login", guestController.loginGuest);
router.get(
  "/",
  authorizeRoles(["ADMIN", "ROOM_MANAGER", "RECEPTIONIST"]),
  guestController.getAllGuests
);
router.get(
  "/:id",
  authorizeRoles(["ADMIN", "ROOM_MANAGER", "RECEPTIONIST","GUEST"]),
  guestController.getGuestById
);
router.put(
  "/:id",
  authorizeRoles(["GUEST"]),
  guestController.updateGuest
);

router.put(
  "/change-password",
  authorizeRoles(["GUEST"]),
  guestController.changePassword
);
router.put("/forgot-password", guestController.forgotPassword);
router.put("/reset-password", guestController.resetPassword);

export default router;

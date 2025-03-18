import express from "express"
import {
  createReservation,
  getAllReservations,
  getReservationById,
  updateReservationStatus,
  searchReservationsByUser,
} from "../controllers/reservationController.js";
import { authorizeRoles } from "../utils/authorizeRole.js";
import { upload } from "../utils/multerConfig.js"; // Import the image upload middleware

const router = express.Router();

router.post("/", upload.single("file"), authorizeRoles(["GUEST", "RECEPTIONIST"]), createReservation);

router.get(
  "/",
  authorizeRoles(["ADMIN", "ROOM_MANAGER", "RECEPTIONIST"]),
  getAllReservations
);

router.get(
  "/:id",
  authorizeRoles(["ADMIN", "ROOM_MANAGER", "RECEPTIONIST"]),
  getReservationById
);

router.put(
  "/",
  authorizeRoles(["GUEST", "RECEPTIONIST"]),
  updateReservationStatus
);

router.get(
  "/guest/:guestId",
  authorizeRoles(["ADMIN", "ROOM_MANAGER", "RECEPTIONIST"]),
  searchReservationsByUser
);

export default router;

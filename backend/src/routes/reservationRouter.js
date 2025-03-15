import express from "express"
import {
  createReservation,
  getAllReservations,
  getReservationById,
  updateReservationStatus,
  searchReservationsByUser,
} from "../controllers/reservationController.js";
import { authorizeRoles } from "../utils/authorizeRole.js";
const router = express.Router();

router.post("/", authorizeRoles(["GUEST", "RECEPTIONIST"]), createReservation);

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
  "/:guestId",
  authorizeRoles(["ADMIN", "ROOM_MANAGER", "RECEPTIONIST"]),
  searchReservationsByUser
);

export default router;

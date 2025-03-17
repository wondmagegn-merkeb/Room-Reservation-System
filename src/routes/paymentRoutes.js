import express from "express";
import {
  getPaymentsHandler,
  getPaymentByIdHandler,
  updatePaymentStatusAndReservation,
} from "../controllers/paymentController.js";
import { authorizeRoles } from "../utils/authorizeRole.js";
const router = express.Router();

router.get(
  "/",
  authorizeRoles(["ADMIN", "ROOM_MANAGER", "RECEPTIONIST"]),
  getPaymentsHandler
);
router.get(
  "/:id",
  authorizeRoles(["ADMIN", "ROOM_MANAGER", "RECEPTIONIST"]),
  getPaymentByIdHandler
);
router.put(
  "/:id",
  authorizeRoles(["RECEPTIONIST"]),
  updatePaymentStatusAndReservation
);

export default router;

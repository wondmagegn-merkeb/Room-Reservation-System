import express from "express";
import {
  getLogs,
  getGuestLogs,
  getLogById,
  getGuestLogById,
} from "../controllers/logController.js";
import { authorizeRoles } from "../utils/authorizeRole.js";

const router = express.Router();

// Fetch all logs
router.get("/logs", authorizeRoles(["ADMIN"]), getLogs);
router.get("/logs/:id", authorizeRoles(["ADMIN"]), getLogById);

// Fetch all guest logs
router.get("/guest-logs", authorizeRoles(["ADMIN"]), getGuestLogs);
router.get("/guest-logs/:id", authorizeRoles(["ADMIN"]), getGuestLogById);

export default router;

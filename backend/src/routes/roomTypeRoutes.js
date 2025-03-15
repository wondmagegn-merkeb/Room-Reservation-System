import express from "express";
import {
  getAllRoomTypes,
  getRoomTypeById,
  createRoomType,
  updateRoomType,
  deleteRoomType
} from "../controllers/roomTypeController.js";
import { authorizeRoles } from "../utils/authorizeRole.js";
const router = express.Router();

router.get("/",authorizeRoles(["ADMIN","ROOM_MANAGER"]), getAllRoomTypes);
router.get("/:id", authorizeRoles(["ADMIN", "ROOM_MANAGER"]), getRoomTypeById);
router.post("/", authorizeRoles(["ADMIN", "ROOM_MANAGER"]), createRoomType);
router.put("/:id",authorizeRoles(["ADMIN", "ROOM_MANAGER"]),updateRoomType);
router.delete("/:id",authorizeRoles(["ADMIN", "ROOM_MANAGER"]),deleteRoomType);

export default router;

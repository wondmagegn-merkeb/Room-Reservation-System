import express from 'express';
import * as roomController from '../controllers/roomController.js';
import { authorizeRoles } from '../utils/authorizeRole.js';
const router = express.Router();

router.post(
    '/',
    authorizeRoles(["ADMIN","ROOM_MANAGER"]),
    roomController.createRoom);
router.get(
  "/",
  authorizeRoles(["ADMIN", "ROOM_MANAGER"]),
  roomController.getAllRooms
);

router.get("/available", roomController.getAvailableRooms);

router.get(
  "/:id",
  authorizeRoles(["ADMIN", "ROOM_MANAGER"]),
  roomController.getRoomById
);   
router.put(
  "/:id",
  authorizeRoles(["ADMIN", "ROOM_MANAGER"]),
  roomController.updateRoom
);    
router.delete(
  "/:id",
  authorizeRoles(["ADMIN", "ROOM_MANAGER"]),
  roomController.deleteRoom
); 


export default router;

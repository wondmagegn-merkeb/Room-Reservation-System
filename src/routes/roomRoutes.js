import express from 'express';
import * as roomController from '../controllers/roomController.js';
import { authorizeRoles } from '../utils/authorizeRole.js';
const router = express.Router();
//authorizeRoles(["ADMIN", "ROOM_MANAGER"]),
router.post(
    '/',
    
    roomController.createRoom);
router.get(
  "/",
  authorizeRoles(["ADMIN", "ROOM_MANAGER"]),
  roomController.getAllRooms
);

router.get("/available", roomController.getAvailableRooms);

router.get(
  "/:id",
  
  roomController.getRoomById
);   
router.put(
  "/:id",
  
  roomController.updateRoom
);    
router.delete(
  "/:id",
  
  roomController.deleteRoom
); 


export default router;

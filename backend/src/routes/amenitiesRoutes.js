// routes/amenitiesRoutes.js
import express from 'express';
import { addAmenity, getAmenities, deleteAmenity } from '../controllers/amenitiesToRoomTypeController.js';
import { authorizeRoles } from "../utils/authorizeRole.js";
const router = express.Router();

// Add (connect) an amenity to a room type
router.put(
  "/add-amenity",
  authorizeRoles(["ADMIN", "ROOM_MANAGER"]),
  addAmenity
);

// Retrieve all amenities for a specific room type
router.get(
  "/:roomTypeId",
  authorizeRoles(["ADMIN", "ROOM_MANAGER"]),
  getAmenities
);

// Remove (disconnect) an amenity from a room type
router.delete(
  "/:roomTypeId/amenities/:amenityId",
  authorizeRoles(["ADMIN", "ROOM_MANAGER"]),
  deleteAmenity
);

export default router;

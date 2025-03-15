import express from "express";
import {
  createAmenityHandler,
  getAllAmenitiesHandler,
  getAmenityByIdHandler,
  updateAmenityHandler,
  deleteAmenityHandler
} from "../controllers/amenityController.js";
import { authorizeRoles } from "../utils/authorizeRole.js";
const router = express.Router();

router.post("/", authorizeRoles(["ADMIN", "ROOM_MANAGER"]), createAmenityHandler);
router.get("/", authorizeRoles(["ADMIN","ROOM_MANAGER"]), getAllAmenitiesHandler);
router.get("/:id",authorizeRoles(["ADMIN","ROOM_MANAGER"]),getAmenityByIdHandler);
router.put("/:id",authorizeRoles(["ADMIN","ROOM_MANAGER"]),updateAmenityHandler);
router.delete("/:id",authorizeRoles(["ADMIN","ROOM_MANAGER"]),deleteAmenityHandler);

export default router;

import express from 'express';
import { create, getAll, getById, update, remove } from '../controllers/roomImagesController.js';
import { upload } from '../utils/multerConfig.js';
import { authorizeRoles } from '../utils/authorizeRole.js';

const router = express.Router();

router.post(
  "/",
  authorizeRoles(["ADMIN", "ROOM_MANAGER"]),
  upload.array("image_url", 10),
  create
);
router.get("/", authorizeRoles(["ADMIN", "ROOM_MANAGER"]), getAll);
router.get("/:id", authorizeRoles(["ADMIN", "ROOM_MANAGER"]), getById);
router.patch(
  "/:id",
  authorizeRoles(["ADMIN", "ROOM_MANAGER"]),
  upload.single("image_url"),
  update
);
router.delete("/:id", authorizeRoles(["ADMIN", "ROOM_MANAGER"]), remove);

export default router;

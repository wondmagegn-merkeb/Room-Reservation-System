import {
  createRoomImage,
  getAllRoomImages,
  getRoomImageById,
  updateRoomImage,
  deleteRoomImage,
} from "../models/roomImagesModel.js";
import { UnlinkImage } from "../utils/UnlinkImage.js";
import { logOperation } from "../utils/log.js"; 

export const create = async (req, res) => {
  try {
    const { roomId } = req.body;
    // Validate inputs
    if (!roomId) {
      req.files?.map((file) => UnlinkImage(file.filename));
      return res.status(400).json({ message: "roomId is required" });
    }
    if (!req.files || req.files.length === 0) {
      req.files?.map((file) => UnlinkImage(file.filename));
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }

    // Extract images from request and assign an ID
    const images = req.files?.map((file) => ({
      roomId,
      image_url: file.filename,
    }));

    const newImage = await createRoomImage(images);
    // Log the operation
    await logOperation(
      "CREATE",
      `Added images for Room ID: ${roomId}`,
      req.user.id
    );

    res.status(201).json({ message: "Image inserted successfully" });
  } catch (error) {
    req.files?.map((file) => UnlinkImage(file.filename));
    res.status(400).json({ error: error.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const images = await getAllRoomImages();
    // Log the operation
    await logOperation("READ", "Fetched all room images", req.user.id);

    res.json(images);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const image = await getRoomImageById(req.params.id);

    // Log the operation
    await logOperation(
      "READ",
      `Fetched Room Image ID: ${req.params.id}`,
      req.user.id
    );

    res.json(image);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate inputs
    if (!id) {
      UnlinkImage(req.file?.filename);
      return res.status(400).json({ message: "Id is required" });
    }
    if (!req.file) {
      UnlinkImage(req.file?.filename);
      return res.status(400).json({ message: "Image is required" });
    }

    // Update image
    const updatedImage = await updateRoomImage(id, req.file.filename);

    // Log the operation
    await logOperation(
      "UPDATE",
      `Updated Image ID: ${id} with new file: ${req.file.filename}`,
      req.user.id
    );

    return res.status(200).json({
      message: "Image updated successfully",
      image: updatedImage,
    });
  } catch (error) {
    UnlinkImage(req.file?.filename);
    return res.status(500).json({ error: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    await deleteRoomImage(req.params.id);

    // Log the operation
    await logOperation(
      "DELETE",
      `Deleted Room Image ID: ${req.params.id}`,
      req.user.id
    );

    res.json({ message: "Room Image deleted successfully" });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

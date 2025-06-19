import * as roomTypeModel from "../models/roomTypeModel.js";
import { logOperation } from "../utils/log.js";

// ✅ Get All Room Types
export const getAllRoomTypes = async (req, res) => {
  try {
    const roomTypes = await roomTypeModel.getAllRoomTypes();

    // Log the operation
    await logOperation("READ", "Fetched all room types", req.user.id);

    res.status(200).json(roomTypes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching room types", error: error.message });
  }
};

// ✅ Get Room Type by ID with Proper Handling
export const getRoomTypeById = async (req, res) => {
  try {
    const roomType = await roomTypeModel.getRoomTypeById(req.params.id);

    if (!roomType) {
      return res.status(404).json({ message: "Room type not found" });
    }

    // Log the operation
    await logOperation(
      "READ",
      `Fetched Room Type by ID: ${req.params.id}`,
      req.user.id
    );

    res.status(200).json(roomType);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching room type", error: error.message });
  }
};

// ✅ Create Room Type with Unique Constraint Handling
export const createRoomType = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Room type name is required" });
    }

     const roomTypeWithSameName = await roomTypeModel.getRoomTypeByName(name);
     if (roomTypeWithSameName) {
       return res.status(400).json({ error: "Room type name must be unique" });
     }
    
    const userId = req.user.id; 
    const newRoomType = await roomTypeModel.createRoomType({
      name,
      description,
      userId
    });

    // Log the operation
    await logOperation(
      "CREATE",
      `Created Room Type: ${name}, Description: ${description}`,
      req.user.id
    );

    res
      .status(201)
      .json({ message: "Room type created successfully", data: newRoomType });
  } catch (error) {
    if (error.message.includes("Unique constraint failed")) {
      return res.status(400).json({ message: "Room type name must be unique" });
    }
    res
      .status(500)
      .json({ message: "Error creating room type", error: error.message });
  }
};

// ✅ Update Room Type with ID Check
export const updateRoomType = async (req, res) => {
  try {
    const { name, description } = req.body;
    const roomTypeId = req.params.id;

    if (!name) {
      return res.status(400).json({ message: "Room type name is required" });
    }

    // Fetch the current room type before updating
    const existingRoomType = await roomTypeModel.getRoomTypeById(roomTypeId);
    if (!existingRoomType) {
      return res.status(404).json({ message: "Room type not found" });
    }

    const roomTypeWithSameName = await roomTypeModel.getRoomTypeByName(name);
    if (roomTypeWithSameName && roomTypeWithSameName.id !== roomTypeId) {
      return res.status(400).json({ error: "Room type name must be unique" });
    }

    // Update the room type
    const updatedRoomType = await roomTypeModel.updateRoomType(roomTypeId, {
      name,
      description,
    });

    // Log the operation
    await logOperation(
      "UPDATE",
      `Updated Room Type - ID: ${roomTypeId}. Changes: ${JSON.stringify({
        old: existingRoomType,
        new: updatedRoomType,
      })}`,
      req.user.id
    );

    res.status(200).json({
      message: "Room type updated successfully",
      data: updatedRoomType,
    });
  } catch (error) {
    if (error.message.includes("Record to update not found")) {
      return res.status(404).json({ message: "Room type not found" });
    }
    if (error.message.includes("Unique constraint failed")) {
      return res.status(400).json({ message: "Room type name must be unique" });
    }
    res
      .status(500)
      .json({ message: "Error updating room type", error: error.message });
  }
};

// ✅ Delete Room Type with Proper Handling
export const deleteRoomType = async (req, res) => {
  try {
    const roomTypeId = req.params.id;

    // Fetch the room type before deletion
    const roomType = await roomTypeModel.getRoomTypeById(roomTypeId);
    if (!roomType) {
      return res.status(404).json({ message: "Room type not found" });
    }

    // Delete the room type
    await roomTypeModel.deleteRoomType(roomTypeId);

    // Log the operation
    await logOperation(
      "DELETE",
      `Deleted Room Type - ID: ${roomTypeId}, Name: ${roomType.name}, Description: ${roomType.description}`,
      req.user.id
    );

    res.status(200).json({ message: "Room type deleted successfully" });
  } catch (error) {
    if (error.message.includes("Record to delete does not exist")) {
      return res.status(404).json({ message: "Room type not found" });
    }
    res
      .status(500)
      .json({ message: "Error deleting room type", error: error.message });
  }
};

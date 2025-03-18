import {
    addAmenityToRoomType,
    getAmenitiesFromRoomType,
    deleteAmenityFromRoomType,
} from '../models/amenitiesToRoomTypeModel.js';
import { logOperation } from "../utils/log.js";

/**
 * Controller to connect an existing Amenity to a RoomType.
 */
export const addAmenity = async (req, res) => {
  try {
    const { roomTypeId, amenityId } = req.body;
    const updatedRoomType = await addAmenityToRoomType({ roomTypeId, amenityId });

    // Log the operation (add amenity to room type)
    await logOperation(
      "CREATE",
      `Connected Amenity ID ${amenityId} to RoomType ID ${roomTypeId}`,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: `Amenity with ID ${amenityId} successfully connected to RoomType ID ${roomTypeId}.`,
      data: updatedRoomType,
    });
  } catch (error) {
    console.error('Error connecting Amenity to RoomType:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while connecting the amenity. Please try again later.',
    });
  }
};

/**
 * Controller to retrieve all amenities for a given RoomType.
 */
export const getAmenities = async (req, res) => {
  try {
    const { roomTypeId } = req.params;
    const roomType = await getAmenitiesFromRoomType(roomTypeId);
    if (!roomType) {
      return res.status(404).json({
        success: false,
        message: `RoomType with ID ${roomTypeId} not found.`
      });
    }

    // Log the operation (fetch amenities for room type)
    await logOperation(
      "READ",
      `Fetched amenities for RoomType ID ${roomTypeId}`,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: `Amenities retrieved successfully for RoomType ID ${roomTypeId}.`,
      amenities: roomType.amenities,
    });
  } catch (error) {
    console.error('Error fetching amenities for RoomType:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching amenities for the room type. Please try again later.',
    });
  }
};

/**
 * Controller to disconnect an Amenity from a RoomType.
 */
export const deleteAmenity = async (req, res) => {
  try {
    const { roomTypeId, amenityId } = req.params;
    const updatedRoomType = await deleteAmenityFromRoomType({ roomTypeId, amenityId });

    // Log the operation (remove amenity from room type)
    await logOperation(
      "DELETE",
      `Disconnected Amenity ID ${amenityId} from RoomType ID ${roomTypeId}`,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: `Amenity with ID ${amenityId} successfully disconnected from RoomType ID ${roomTypeId}.`,
      data: updatedRoomType,
    });
  } catch (error) {
    console.error('Error disconnecting Amenity from RoomType:', error);
    res.status(500).json({
      success: false,
      error: 'Error disconnecting amenity from the room type. Please try again later.',
    });
  }
};

// models/amenitiesToRoomTypeModel.js
import {prisma} from '../prismaClient.js';

/**
 * Connects an existing Amenity to an existing RoomType.
 *
 * @param {Object} params
 * @param {number} params.roomTypeId - The ID of the RoomType.
 * @param {number} params.amenityId - The ID of the Amenity.
 * @returns {Promise<Object>} The updated RoomType with its amenities.
 */
export const addAmenityToRoomType = async ({ roomTypeId, amenityId }) => {
  const updatedRoomType = await prisma.roomType.update({
    where: { id:roomTypeId},
    data: {
      amenities: {
        connect: { id:amenityId},
      },
    },
    include: { amenities: true },
  });
  return updatedRoomType;
};

/**
 * Retrieves a RoomType along with all of its associated amenities.
 *
 * @param {number} roomTypeId - The ID of the RoomType.
 * @returns {Promise<Object|null>} The RoomType object (including amenities) or null if not found.
 */
export const getAmenitiesFromRoomType = async (roomTypeId) => {
  const roomType = await prisma.roomType.findUnique({
    where: { id: roomTypeId},
    include: { amenities: true },
  });
  return roomType;
};

/**
 * Disconnects an Amenity from a RoomType.
 *
 * @param {Object} params
 * @param {number} params.roomTypeId - The ID of the RoomType.
 * @param {number} params.amenityId - The ID of the Amenity to remove.
 * @returns {Promise<Object>} The updated RoomType with its amenities.
 */
export const deleteAmenityFromRoomType = async ({ roomTypeId, amenityId }) => {
  const updatedRoomType = await prisma.roomType.update({
    where: { id:roomTypeId },
    data: {
      amenities: {
        disconnect: { id:amenityId},
      },
    },
    include: { amenities: true },
  });
  return updatedRoomType;
};

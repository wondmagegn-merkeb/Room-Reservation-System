import { prisma } from "../prismaClient.js"; // Prisma client import


export const createRoom = async (roomData, userId) => {
  const { room_number, room_type_id, price } = roomData;

  try {
    // Check if the room type exists
    const roomType = await prisma.roomType.findUnique({
      where: { id: room_type_id },
    });

    if (!roomType) {
      throw new Error("Room type not found");
    }

    // Check if the room number already exists
    const existingRoom = await prisma.room.findUnique({
      where: { room_number },
    });

    if (existingRoom) {
      throw new Error("Room number already exists");
    }

    // Create a new room
    const newRoom = await prisma.room.create({
      data: {
        room_number,
        price,
        roomType: {
          connect: { id: room_type_id },
        },
        user: {
          connect: { id: userId }, // Linking the user
        },
      },
    });

    return newRoom;
  } catch (error) {
    console.error("Error creating room:", error.message);
    throw error;
  }
};

export const getAllRooms = async () => {
  return prisma.room.findMany({
    include: {
      roomType: {
        include: {
          amenities: true, // Include amenities inside roomType
        },
      },
      RoomImags: true,
    },
  });
};

// Get Room by ID
export const getRoomById = async (roomId) => {
  return prisma.room.findUnique({
    where: { id: roomId },
    include: {
      roomType: {
        include: {
          amenities: true, // Include amenities inside roomType
        },
      },
      RoomImags: true,
    },
  });
};

// Update Room
export const updateRoom = async (roomId, roomData) => {
  const { room_number, room_type_id, price, roomStatus } = roomData;
  // Check if the room number already exists
  const existingRoom = await prisma.room.findUnique({
    where: { room_number },
  });

  if (existingRoom && existingRoom.id !==roomId) {
    throw new Error("Room number already exists");
  }

  // Check if the room exists
  const room = await prisma.room.findUnique({
    where: { id: roomId }, // No need to parse to an integer if the id is already a UUID
  });

  if (!room) {
    throw new Error("Room not found");
  }

  return prisma.room.update({
    where: { id: roomId },
    data: { room_number, room_type_id, price, roomStatus },
  });
};
  

// Delete Room
export const deleteRoom = async (roomId) => {
  const room = await prisma.room.findUnique({
    where: { id:roomId},
  });

  if (!room) {
    throw new Error("Room not found");
  }

  return prisma.room.delete({
    where: { id:roomId },
  });
};

export const getAvailableRooms = async () => {
  return await prisma.room.findMany({
    where: { roomStatus: "AVAILABLE" }, // Fetch only available rooms
    select: {
      id: true,
      room_number: true, // Select room number
      price: true, // Select room status
      roomType: {
        select: {
          name: true,
          amenities: {
            select: {
              name: true, // Only include necessary amenities fields
            },
          },
        },
      },
      RoomImags: {
        select: {
          image_url: true, // Only include image URL
        },
      },
      reservations: {
        select: {
          checkInDate: true,
          checkOutDate: true,
        },
      },
    },
  });
};


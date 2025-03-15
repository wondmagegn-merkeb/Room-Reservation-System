import { prisma } from "../prismaClient.js";
export const createReservation = async (data) => {
  const result = await prisma.$transaction(async (prisma) => {
    try {
      // Check if the room exists and is available
      const room = await prisma.room.findUnique({ where: { id: data.roomId } });
      if (!room || room.is_available === false) {
        throw new Error("Room is not available");
      }

      // Check if a guest with the provided email already exists
      let guest = await prisma.guest.findUnique({
        where: { email: data.phone },
      });
        
      if (!guest) {
        // If guest doesn't exist, create a new guest
        guest = await prisma.guest.create({
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
          },
        });
      }

      // Check for overlapping reservations in the room
      const overlappingReservation = await prisma.reservation.findFirst({
        where: {
          roomId: data.roomId,
          OR: [
            {
              checkInDate: { lte: data.checkInDate },
              checkOutDate: { gte: data.checkInDate },
            },
            {
              checkInDate: { lte: data.checkOutDate },
              checkOutDate: { gte: data.checkOutDate },
            },
          ],
        },
      });

      if (overlappingReservation) {
        throw new Error("Room is already reserved for the selected dates");
      }

      // Create a new reservation for the guest
      const reservation = await prisma.reservation.create({
        data: {
          roomId: data.roomId,
          guestid: guest.id, // Correct field name
          checkInDate: data.checkInDate,
          checkOutDate: data.checkOutDate,
        },
      });
      // Return the created reservation
      return reservation;
    } catch (error) {
      throw new Error(error.message);
    }
  });

  return result;
};
export const getAllReservation = async () => {
  try {
    const reservations = await prisma.reservation.findMany();
    return reservations;
  } catch (error) {
    throw new Error(error.message);
  }
};

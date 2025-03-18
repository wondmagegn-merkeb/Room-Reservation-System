import { prisma } from "../prismaClient.js";
// Create a new reservation
export const createReservation = async (req, res) => {
  try {
    const {
      checkInDate,
      checkOutDate,
      roomId,
      guestId,
      paymentId,
      paymentStatus,
      amount,
    } = req.body;

    // Validate required fields
    if (
      !checkInDate ||
      !checkOutDate ||
      !roomId ||
      !guestId ||
      !paymentId ||
      !paymentStatus ||
      !amount
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Get today's date without time component
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Convert input dates to Date objects
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Validate check-in date is not in the past
    if (checkIn < today) {
      return res
        .status(400)
        .json({ error: "Check-in date cannot be in the past." });
    }

    // Validate check-in date is before check-out date
    if (checkIn > checkOut) {
      return res
        .status(400)
        .json({ error: "Check-in date must be before check-out date." });
    }

    // Fetch room price from the database
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: { price: true },
    });

    if (!room) {
      return res.status(400).json({ error: "Room not found." });
    }

    // Calculate the number of days between check-in and check-out
    const reservationDays = Math.ceil(
      (checkOut - checkIn) / (1000 * 3600 * 24)
    ); // in days
    if (reservationDays <= 0) {
      return res
        .status(400)
        .json({ error: "Check-out date must be after check-in date." });
    }

    // Calculate the total amount based on room price and the number of days
    const roomPrice = room.price;
    const totalAmount = roomPrice * reservationDays;
    console.log(totalAmount);

    // Validate if the provided amount matches the calculated total amount
    if (amount !== totalAmount) {
      return res.status(400).json({
        error: "The amount does not match the calculated room price.",
      });
    }

    const existingReservations = await prisma.reservation.findMany({
      where: {
        roomId: roomId,
        checkOutDate: { gte: today }, // Consider reservations that extend beyond today
        status: { not: "CHECKED_OUT" }, // Exclude only CHECKED_OUT reservations
      },
      select: {
        checkInDate: true,
        checkOutDate: true,
      },
    });

    // Extract and store dates in an array
    const reservedDates = existingReservations.map((reservation) => ({
      checkInDate: reservation.checkInDate.toISOString().split("T")[0], // Convert to YYYY-MM-DD format
      checkOutDate: reservation.checkOutDate.toISOString().split("T")[0],
    }));

    // Get all reserved dates for the room
    const allReservedDates = existingReservations.flatMap((reservation) =>
      listAllDates(reservation.checkInDate, reservation.checkOutDate)
    );

    // New reservation request
    const newReservDates = listAllDates(checkInDate, checkOutDate);

    // Check if any new reservation date exists in reserved dates
    const hasConflict = newReservDates.some((date) =>
      allReservedDates.includes(date)
    );

    if (hasConflict) {
      return res.status(400).json({
        message: "Room is already reserved for the selected dates.",
      });
    }
    const image = req.file?.filename || "";

    // Create the reservation
    const reservation = await prisma.reservation.create({
      data: {
        checkInDate: checkIn,
        checkOutDate: checkOut,
        roomId,
        guestId,
      },
    });

    // Create the payment record
    const payment = await prisma.payment.create({
      data: {
        reservationId: reservation.id,
        paymentId: paymentId,
        amount: totalAmount,
        image: image,
        status: paymentStatus, // e.g., "PENDING", "COMPLETED"
        transactionDate: new Date(), // Current date and time
      },
    });

    return res.status(201).json({
      message: "Room reserved successfully with payment!",
      reservation,
      payment,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


// Function to list all dates between check-in and check-out
const listAllDates = (checkInDate, checkOutDate) => {
  let dates = [];
  let currentDate = new Date(checkInDate);

  while (currentDate <= new Date(checkOutDate)) {
    dates.push(new Date(currentDate).toISOString().split("T")[0]); // Format: YYYY-MM-DD
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

// Get all reservations
export const getAllReservations = async (req, res) => {
  try {
    const reservations = await prisma.reservation.findMany({
      include: { room: true, guest: true, payments: true },
    });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single reservation by ID
export const getReservationById = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { room: true, guest: true, payments: true },
    });
    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const updateReservationStatus = async (req, res) => {
  try {
    const { reservationId, newStatus } = req.body;

    // Validate required fields
    if (!reservationId || !newStatus) {
      return res
        .status(400)
        .json({ error: "Reservation ID and status are required." });
    }

    // Validate that the new status is one of the valid statuses
    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "CHECKED_IN",
      "CHECKED_OUT",
      "CANCELLED",
    ];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ error: "Invalid status provided." });
    }

    // Find the reservation by ID
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found." });
    }

    // Update the reservation status
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: newStatus },
    });

    return res.status(200).json({
      message: "Reservation status updated successfully.",
      updatedReservation,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const searchReservationsByUser = async (req, res) => {
  try {
    const { guestId } = req.parms;
    // Validate that guestId is provided
    if (!guestId) {
      return res.status(400).json({ error: "Guest ID is required." });
    }

    // Find all reservations by guestId
    const reservations = await prisma.reservation.findMany({
      where: {
        guestId: guestId, // Filter reservations by guestId
      },
      select: {
        id: true,
        checkInDate: true,
        checkOutDate: true,
        status: true,
        roomId: true,
        guestId: true,
      },
    });

    // If no reservations are found
    if (reservations.length === 0) {
      return res
        .status(404)
        .json({ message: "No reservations found for this guest." });
    }

    return res.status(200).json({ reservations });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

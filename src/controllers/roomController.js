import * as roomModel from "../models/roomModel.js";
import { logOperation } from "../utils/log.js";

// ✅ Create Room
export const createRoom = async (req, res) => {
  try {
    const newRoom = await roomModel.createRoom(req.body,req.user.id);

    // Log the operation
    await logOperation(
      "CREATE",
      `Created Room: ${newRoom.room_number}`,
      req.user.id
    );

    res.status(201).json(newRoom);
  } catch (error) {
    if (error.message === "Room type not found") {
      return res.status(404).json({ message: "Room type not found" });
    } else if (error.message === "Room number already exists") {
      return res.status(400).json({ message: "Room number already exists" });
    }
    res
      .status(500)
      .json({ message: "Error creating room", error: error.message });
  }
};

// ✅ Get All Rooms
export const getAllRooms = async (req, res) => {
  try {
    const rooms = await roomModel.getAllRooms();

    // Log the operation
    await logOperation("READ", "Fetched all rooms", req.user.id);

    res.status(200).json(rooms);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching rooms", error: error.message });
  }
};

// ✅ Get Room by ID
export const getRoomById = async (req, res) => {
  try {
    const room = await roomModel.getRoomById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Log the operation
    await logOperation(
      "READ",
      `Fetched Room by ID: ${req.params.id}`,
      req.user.id
    );

    res.status(200).json(room);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching room", error: error.message });
  }
};

// ✅ Update Room
export const updateRoom = async (req, res) => {
  try {
    const updatedRoom = await roomModel.updateRoom(req.params.id, req.body);

    // Log the operation
    await logOperation(
      "UPDATE",
      `Updated Room ID: ${req.params.id}`,
      req.user.id
    );

    res.status(200).json(updatedRoom);
  } catch (error) {
    if (error.message === "Room not found") {
      return res.status(404).json({ message: "Room not found" });
    } else if (error.message === "Room number already exists") {
      return res.status(400).json({ message: "Room number already exists" });
    }
    res
      .status(500)
      .json({ message: "Error updating room", error: error.message });
  }
};

// ✅ Delete Room
export const deleteRoom = async (req, res) => {
  try {
    const roomId = req.params.id;

    // Fetch the room before deleting
    const room = await roomModel.getRoomById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    await roomModel.deleteRoom(roomId);

    // Log the operation
    await logOperation(
      "DELETE",
      `Deleted Room ID: ${roomId}, Number: ${room.room_number}`,
      req.user.id
    );

    res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting room", error: error.message });
  }
};

// ✅ Update Room Type
export const updateRoomType = async (req, res) => {
  const roomNumber = req.params.roomNumber;
  const { room_type_id } = req.body;

  try {
    const updatedRoom = await roomModel.updateRoomType(
      roomNumber,
      room_type_id
    );

    // Log the operation
    await logOperation(
      "UPDATE",
      `Updated Room Type - Room: ${roomNumber}, New Type ID: ${room_type_id}`,
      req.user.id
    );

    return res.status(200).json(updatedRoom);
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error updating room type", error: error.message });
  }
};

// ✅ Update Room Price
export const updateRoomPrice = async (req, res) => {
  const roomNumber = req.params.roomNumber;
  const { price } = req.body;

  try {
    const updatedRoom = await roomModel.updateRoomPrice(roomNumber, price);

    // Log the operation
    await logOperation(
      "UPDATE",
      `Updated Room Price - Room: ${roomNumber}, New Price: ${price}`,
      req.user.id
    );

    return res.status(200).json(updatedRoom);
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error updating room price", error: error.message });
  }
};

// ✅ Update Room Availability
export const updateRoomAvailability = async (req, res) => {
  const roomNumber = req.params.roomNumber;
  const { is_available } = req.body;

  try {
    const updatedRoom = await roomModel.updateRoomAvailability(
      roomNumber,
      is_available
    );

    // Log the operation
    await logOperation(
      "UPDATE",
      `Updated Room Availability - Room: ${roomNumber}, Available: ${is_available}`,
      req.user.id
    );

    return res.status(200).json(updatedRoom);
  } catch (error) {
    return res
      .status(400)
      .json({
        message: "Error updating room availability",
        error: error.message,
      });
  }
};
// ✅ Get Only Available Rooms
export const getAvailableRooms = async (req, res) => {
  try {
    // Fetch only available rooms
    const availableRooms = await roomModel.getAvailableRooms(); // Ensure the model has this function

    // Process rooms and add reserved dates for each room
    const roomsWithReservedDates = availableRooms.map((room) => {
      const reservedDates = room.reservations.flatMap((reservation) =>
        listAllDates(reservation.checkInDate, reservation.checkOutDate)
      );
      const {reservations ,...roomData} = room;
      return {
        ...roomData,
        reservedDates, // Add reserved dates for this room
      };
    });

    // Prepare the final response data
    const data = {
      availableRooms: roomsWithReservedDates,
    };

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching available rooms", error: error.message });
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

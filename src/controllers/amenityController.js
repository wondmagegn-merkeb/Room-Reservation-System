import {
  createAmenity,
  getAllAmenities,
  getAmenityById,
  updateAmenity,
  deleteAmenity,
  getAmenityByName,
} from "../models/amenityModel.js";
import { logOperation } from "../utils/log.js";

export const createAmenityHandler = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if an amenity with the same name already exists
    const existingAmenity = await getAmenityByName(name);
    if (existingAmenity) {
      return res.status(400).json({ success: false, error: "Amenity name must be unique" });
    }

    // Proceed with creating the amenity
    const data = {
      ...req.body,
      userId: req.user.id,
    };
    const amenity = await createAmenity(data);

    // Log the operation (create amenity)
    await logOperation("CREATE", `Created Amenity: ${name}, Description: ${description}`, req.user.id);

    res.status(201).json({ success: true, message: "Amenity added successfully.", data: amenity });
  } catch (error) {
    console.error("Error creating amenity:", error);
    res.status(500).json({ success: false, error: "Internal server error", details: error.message });
  }
};

export const getAllAmenitiesHandler = async (req, res) => {
  try {
    const amenities = await getAllAmenities();
    await logOperation("READ", "Fetched all amenities", req.user.id);

    res.json({ success: true, data: amenities });
  } catch (error) {
    console.error("Error fetching all amenities:", error);
    res.status(500).json({ success: false, error: "Internal server error", details: error.message });
  }
};

export const getAmenityByIdHandler = async (req, res) => {
  try {
    const amenity = await getAmenityById(req.params.id);
    if (!amenity) {
      return res.status(404).json({ success: false, error: "Amenity not found" });
    }

    // Log the operation (fetch single amenity by ID)
    await logOperation("READ", `Fetched Amenity by ID: ${req.params.id}`, req.user.id);

    res.json({ success: true, data: amenity });
  } catch (error) {
    console.error("Error fetching amenity by ID:", error);
    res.status(500).json({ success: false, error: "Internal server error", details: error.message });
  }
};

export const updateAmenityHandler = async (req, res) => {
  try {
    const amenityId = req.params.id;
    const { name } = req.body;

    // Fetch the current details of the amenity before updating
    const existingAmenity = await getAmenityById(amenityId);
    if (!existingAmenity) {
      return res.status(404).json({ success: false, error: "Amenity not found" });
    }

    // Check if the new amenity name already exists (and not the current amenity)
    const amenityWithSameName = await getAmenityByName(name);
    if (amenityWithSameName && amenityWithSameName.id !== amenityId) {
      return res.status(400).json({ success: false, error: "Amenity name must be unique" });
    }

    // Proceed with updating the amenity
    const updatedAmenity = await updateAmenity(amenityId, req.body);

    // Log the operation (update amenity)
    await logOperation("UPDATE", `Updated Amenity - ID: ${amenityId}. Changes: ${JSON.stringify({ old: existingAmenity, new: updatedAmenity })}`, req.user.id);

    res.json({ success: true, message: "Amenity updated successfully.", data: updatedAmenity });
  } catch (error) {
    console.error("Error updating amenity:", error);
    res.status(500).json({ success: false, error: "Internal server error", details: error.message });
  }
};

export const deleteAmenityHandler = async (req, res) => {
  try {
    const amenityId = req.params.id;

    // Fetch the amenity details before deletion
    const amenity = await getAmenityById(amenityId);
    if (!amenity) {
      return res.status(404).json({ success: false, error: "Amenity not found" });
    }

    // Delete the amenity
    await deleteAmenity(amenityId);

    // Log the operation (delete amenity)
    await logOperation("DELETE", `Deleted Amenity - ID: ${amenity.id}, Name: ${amenity.name}, Description: ${amenity.description}`, req.user.id);

    res.json({ success: true, message: "Amenity deleted successfully" });
  } catch (error) {
    console.error("Error deleting amenity:", error);
    res.status(500).json({ success: false, error: "Internal server error", details: error.message });
  }
};

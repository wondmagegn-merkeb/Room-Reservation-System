import { prisma } from "../prismaClient.js";

// Create Amenity
export const createAmenity = async (data) => {
    console.log(data);

  return await prisma.amenity.create({ data });
};

// Get All Amenities (without roomType relation)
export const getAllAmenities = async () => {
  return await prisma.amenity.findMany();
};

// Get Amenity by ID (without roomType relation)
export const getAmenityById = async (id) => {
  return await prisma.amenity.findUnique({ where: { id } });
};

// Get Amenity by ID (without roomType relation)
export const getAmenityByName = async (name) => {
  return await prisma.amenity.findFirst({
    where: { name },
  });
};


// Update Amenity
export const updateAmenity = async (id, data) => {
  return await prisma.amenity.update({ where: { id }, data });
};

// Delete Amenity
export const deleteAmenity = async (id) => {
  return await prisma.amenity.delete({ where: { id } });
};

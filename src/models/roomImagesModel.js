// roomImagesModel.js (Model Layer)
import { prisma } from '../prismaClient.js';
import { UnlinkImage } from '../utils/UnlinkImage.js';

export const createRoomImage = async (images) => {
  try {
    const result = await prisma.roomImages.createMany({
      data: images,
    });

    return result;
  } catch (error) {
    console.error(error); // Log the actual error for better debugging.
    throw new Error(`Error creating Room Image: ${error.message}`);
  }
};

export const getAllRoomImages = async () => {
  return await prisma.roomImages.findMany();
};

export const getRoomImageById = async (id) => {
  const image = await prisma.roomImages.findUnique({ where: { id } });
  if (!image) throw new Error('Room Image not found');
  return image;
};

export const updateRoomImage = async (id, image_url) => {
  try {
    // Find the existing record
    const existingImage = await prisma.roomImages.findUnique({
      where: { id },
    });

    if (!existingImage) {
      throw new Error("Image not found");
    }

    // Delete the old image file (optional, only if replacing files)
    if (existingImage.image_url) {
      UnlinkImage(existingImage.image_url);
    }

    // Update the image
    const updatedImage = await prisma.roomImages.update({
      where: { id },
      data: { image_url },
    });

    return updatedImage;
  } catch (error) {
    console.error("Error updating image:", error);
    throw new Error("Failed to update room image");
  }
};


export const deleteRoomImage = async (id) => {
  try {
        // Find the existing record
        const existingImage = await prisma.roomImages.findUnique({
          where: { id },
        });
    
        if (!existingImage) {
          throw new Error("Image not found");
        }
    
        // Delete the old image file (optional, only if replacing files)
        if (existingImage.image_url) {
          UnlinkImage(existingImage.image_url);
        }
    
    return await prisma.roomImages.delete({ where: { id } });
  } catch (error) {
    throw new Error('Room Image not found or deletion failed');
  }
};
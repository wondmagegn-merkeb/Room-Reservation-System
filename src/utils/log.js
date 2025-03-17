import { prisma } from "../prismaClient.js";

// Helper function to log operations
export const logOperation = async (category, description, performedBy) => {
  await prisma.log.create({
    data: {
      category,
      description,
      performedBy,
    },
  });
};

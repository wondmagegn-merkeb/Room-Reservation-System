import { prisma } from "../prismaClient.js";

export const getAllPayments = async () => {
  try {
    return await prisma.payment.findMany();
  } catch (error) {
    throw new Error("Error fetching payments: " + error.message);
  }
};

export const getPaymentById = async (id) => {
  try {
    return await prisma.payment.findUnique({ where: { id } });
  } catch (error) {
    throw new Error("Error fetching payment: " + error.message);
  }
};



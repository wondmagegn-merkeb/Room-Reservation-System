import {prisma} from "../prismaClient.js"
export const getAllRoomTypes = async () => {
  return await prisma.roomType.findMany(
);
};

export const getRoomTypeById = async (id) => {
  return await prisma.roomType.findUnique({
    where: {id}
  });
};

export const getRoomTypeByName = async (name) => {
  return await prisma.roomType.findFirst({
    where: { name },
  });
};

export const createRoomType = async (data) => {
  return await prisma.roomType.create({ data });
};

export const updateRoomType = async (id, data) => {
  return await prisma.roomType.update({
    where: {id},
    data,
  });
};

export const deleteRoomType = async (id) => {
  return await prisma.roomType.delete({
    where: { id },
  });
};

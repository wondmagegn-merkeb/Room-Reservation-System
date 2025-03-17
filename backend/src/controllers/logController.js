import { prisma } from "../prismaClient.js";

// Get all logs
export const getLogs = async (req, res) => {
  try {
    const logs = await prisma.log.findMany({});
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch logs" });
  }
};

// Get log by ID
export const getLogById = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await prisma.log.findUnique({
      where: { id },
      include: { userId: true },
    });

    if (!log) return res.status(404).json({ error: "Log not found" });

    res.json(log);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch log" });
  }
};

// Get all guest logs
export const getGuestLogs = async (req, res) => {
  try {
    const guestLogs = await prisma.guestLog.findMany({});
    res.json(guestLogs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch guest logs" });
  }
};

// Get guest log by ID
export const getGuestLogById = async (req, res) => {
  try {
    const { id } = req.params;
    const guestLog = await prisma.guestLog.findUnique({
      where: { id },
      include: { userId: true },
    });

    if (!guestLog) return res.status(404).json({ error: "Guest log not found" });

    res.json(guestLog);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch guest log" });
  }
};
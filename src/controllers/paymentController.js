import {
  getAllPayments,
  getPaymentById,
} from "../models/paymentModel.js";
import { prisma } from "../prismaClient.js"; // Prisma client import

export const getPaymentsHandler = async (req, res) => {
  try {
    const payments = await getAllPayments();
    
    res.status(200).json({
      success: true,
      message: "Payments retrieved successfully",
      data: payments,
    });
  } catch (error) {
    console.error("Error fetching payments:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getPaymentByIdHandler = async (req, res) => {
  try {
    const payment = await getPaymentById(req.params.id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: "Payment not found",
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Payment retrieved successfully",
      data: payment,
    });
  } catch (error) {
    console.error("Error fetching payment:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updatePaymentStatusAndReservation = async (
  paymentId,
  paymentStatus,
  req
) => {
  try {
    // Validate that paymentStatus is provided and valid
    if (!paymentStatus) {
      throw new Error("Payment status is required to update the payment.");
    }
    
    const validPaymentStatuses = [
      "PENDING",
      "PAID",
      "FAILED",
    ];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      throw new Error("Invalid payment status.");
    }

    // Find the payment by ID to get the associated reservation ID
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: {
        id: true,
        reservationId: true, // Get the reservationId associated with this payment
      },
    });

    if (!payment) {
      throw new Error("Payment not found.");
    }

    // Set reservation status based on the payment status
    let reservationStatus = null;

    if (paymentStatus === "PAID") {
      reservationStatus = "CONFIRMED"; // Set reservation status to CONFIRMED if payment is completed
    } else if (paymentStatus === "FAILED") {
      reservationStatus = "CANCELLED"; // Set reservation status to CANCELLED if payment is cancelled
    }

    // Update the payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: { status: paymentStatus },
    });

    // If the reservationStatus needs to be updated, do so
    if (reservationStatus) {
      await prisma.reservation.update({
        where: { id: payment.reservationId },
        data: { status: reservationStatus },
      });
    }

    // Log the operation in the Log table for updating payment status
    await prisma.log.create({
      data: {
        category: "UPDATE", // Category could be UPDATE since you're updating data
        description: `Updated payment status for payment ID ${paymentId} to ${paymentStatus}`, // Description of the action
        performedBy: req.user.id, // Assuming the user who performed the action is logged in
      },
    });

    return {
      success: true,
      message: `Payment status and reservation status updated successfully.`,
      updatedPayment,
      reservationStatus: reservationStatus || "No status change",
    };
  } catch (error) {
    console.error("Error updating payment and reservation status:", error.message);
    throw new Error(
      "Error updating payment and reservation status: " + error.message
    );
  }
};

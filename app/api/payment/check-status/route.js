import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api";
import { getStudent } from "@/lib/auth";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function giveAccess(payment) {
  if (payment.testId) {
    await prisma.testPurchase.upsert({
      where: {
        studentId_testId: {
          studentId: payment.studentId,
          testId: payment.testId,
        },
      },
      update: {},
      create: {
        studentId: payment.studentId, // ← from PAYMENT, not caller
        testId: payment.testId,
        amountPaid: payment.amount,
        orderId: payment.razorpayOrderId,
      },
    });
  }
  if (payment.crashCourseId) {
    await prisma.crashCourseEnrollment.upsert({
      where: {
        studentId_crashCourseId: {
          studentId: payment.studentId,
          crashCourseId: payment.crashCourseId,
        },
      },
      update: {},
      create: {
        studentId: payment.studentId,
        crashCourseId: payment.crashCourseId,
      },
    });
  }
}

export async function POST(request) {
  try {
    const student = await getStudent();
    if (!student) return errorResponse("Login required", 401);

    const { orderId } = await request.json();
    if (!orderId) return errorResponse("orderId required");

    // Find payment owned by current student
    const payment = await prisma.payment.findFirst({
      where: {
        razorpayOrderId: orderId,
        studentId: student.id, // ← ownership check
      },
    });

    if (!payment) return errorResponse("Payment not found", 404);

    // Already processed — just return status
    if (payment.status === "SUCCESS")
      return successResponse({ status: "SUCCESS" });
    if (payment.status === "FAILED")
      return successResponse({ status: "FAILED" });

    // Check Razorpay directly for stuck PENDING payments
    try {
      const order = await razorpay.orders.fetch(orderId);
      if (order.status === "paid") {
        const updated = await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "SUCCESS" },
        });
        await giveAccess(updated);
        return successResponse({ status: "SUCCESS" });
      }
    } catch (e) {
      console.error("Razorpay fetch failed:", e);
    }

    return successResponse({ status: payment.status || "PENDING" });
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to check status", 500);
  }
}

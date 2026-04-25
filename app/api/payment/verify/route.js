import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api";
import { getStudent } from "@/lib/auth";
import crypto from "crypto";

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
        studentId: payment.studentId,
        testId: payment.testId,
        amountPaid: payment.amount,
        paymentId: payment.razorpayPaymentId,
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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await request.json();
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return errorResponse("Missing payment details");
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error("RAZORPAY_KEY_SECRET not set");
      return errorResponse("Server misconfigured", 500);
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return errorResponse("Invalid payment signature");
    }

    // Find payment owned by current student, still pending
    const payment = await prisma.payment.findFirst({
      where: {
        razorpayOrderId: razorpay_order_id,
        studentId: student.id,
        status: "PENDING",
      },
    });
    if (!payment)
      return errorResponse("Payment not found or already processed", 404);

    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCESS",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
    });

    await giveAccess(updated);
    return successResponse({ status: "SUCCESS" });
  } catch (error) {
    console.error(error);
    return errorResponse("Payment verification failed", 500);
  }
}

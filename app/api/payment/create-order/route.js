import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api";
import { getStudent } from "@/lib/auth";
import { decodeTest, decodeCourse } from "@/lib/hashid"; // ← add
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  try {
    const student = await getStudent();
    if (!student) return errorResponse("Login required", 401);

    const { testId, courseId } = await request.json();
    if (!testId && !courseId)
      return errorResponse("testId or courseId required");
    if (testId && courseId)
      return errorResponse("Provide either testId or courseId, not both");

    let amount = 0;
    let description = "";
    let testIdInt = null;
    let courseIdInt = null;

    if (testId) {
      testIdInt = decodeTest(testId); // ← was parseInt
      if (!testIdInt) return errorResponse("Invalid test"); // ← invalid hash

      // Check if already purchased
      const existingPurchase = await prisma.testPurchase.findUnique({
        where: {
          studentId_testId: { studentId: student.id, testId: testIdInt },
        },
      });
      if (existingPurchase) return errorResponse("You already own this test");

      const test = await prisma.test.findUnique({ where: { id: testIdInt } });
      if (!test) return errorResponse("Test not found");
      amount = Number(test.price) * 100;
      description = test.title;
    }

    if (courseId) {
      courseIdInt = decodeCourse(courseId); // ← was parseInt
      if (!courseIdInt) return errorResponse("Invalid course");

      const existingEnrollment = await prisma.crashCourseEnrollment.findUnique({
        where: {
          studentId_crashCourseId: {
            studentId: student.id,
            crashCourseId: courseIdInt,
          },
        },
      });
      if (existingEnrollment)
        return errorResponse("You already have this course");

      const course = await prisma.crashCourse.findUnique({
        where: { id: courseIdInt },
      });
      if (!course) return errorResponse("Course not found");
      amount = Number(course.price) * 100;
      description = course.title;
    }

    if (amount === 0)
      return errorResponse("This item is free — no payment needed");

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    // Save pending payment in DB (use decoded ints)
    await prisma.payment.create({
      data: {
        studentId: student.id,
        testId: testIdInt, // ← was parseInt(testId)
        crashCourseId: courseIdInt, // ← was parseInt(courseId)
        razorpayOrderId: order.id,
        amount: amount / 100,
        currency: "INR",
        status: "PENDING",
      },
    });

    return successResponse({
      orderId: order.id,
      amount,
      currency: "INR",
      description,
    });
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to create order", 500);
  }
}

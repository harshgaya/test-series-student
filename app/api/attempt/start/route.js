import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api";
import { getStudent } from "@/lib/auth";
import { decodeTest, encodeAttempt } from "@/lib/hashid"; // ← add

export async function POST(request) {
  try {
    const student = await getStudent();
    if (!student)
      return errorResponse("Please login to attempt this test", 401);

    const { testId } = await request.json();
    if (!testId) return errorResponse("testId required");

    const testIdInt = decodeTest(testId); // ← was parseInt
    if (!testIdInt) return errorResponse("Invalid test ID"); // ← null check replaces isNaN

    const test = await prisma.test.findUnique({
      where: { id: testIdInt },
      include: {
        testQuestions: {
          orderBy: { orderIndex: "asc" },
          include: {
            question: {
              include: {
                options: {
                  orderBy: { orderIndex: "asc" },
                  select: {
                    id: true,
                    label: true,
                    optionText: true,
                    optionImageUrl: true,
                  },
                },
                subject: { select: { id: true, name: true } },
                chapter: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    if (!test) return errorResponse("Test not found", 404);
    if (test.status !== "PUBLISHED")
      return errorResponse("This test is not available", 403);

    // Check access — free test or purchased or free access
    if (Number(test.price) > 0 && !student.freeAccess) {
      const purchase = await prisma.testPurchase.findUnique({
        where: {
          studentId_testId: { studentId: student.id, testId: testIdInt },
        },
      });
      if (!purchase)
        return errorResponse("Please purchase this test first", 403);
    }

    // Resume existing IN_PROGRESS attempt
    const existing = await prisma.testAttempt.findFirst({
      where: {
        studentId: student.id,
        testId: testIdInt,
        status: "IN_PROGRESS",
      },
      include: { answers: true },
    });

    if (existing) {
      return successResponse({
        attempt: { ...existing, id: encodeAttempt(existing.id) }, // ← encode
        questions: test.testQuestions.map((tq) => tq.question),
        durationMins: test.durationMins,
        marksCorrect: test.marksCorrect,
        negativeMarking: Number(test.negativeMarking),
        resumed: true,
      });
    }

    // Count previous attempts
    const prevCount = await prisma.testAttempt.count({
      where: { studentId: student.id, testId: testIdInt },
    });

    const attempt = await prisma.testAttempt.create({
      data: {
        studentId: student.id,
        testId: testIdInt,
        attemptNumber: prevCount + 1,
        totalMarks: test.totalMarks,
        status: "IN_PROGRESS",
      },
    });

    return successResponse({
      attempt: { ...attempt, id: encodeAttempt(attempt.id) }, // ← encode
      questions: test.testQuestions.map((tq) => tq.question),
      durationMins: test.durationMins,
      marksCorrect: test.marksCorrect,
      negativeMarking: Number(test.negativeMarking),
      resumed: false,
    });
  } catch (error) {
    console.error("Attempt start error:", error);
    return errorResponse("Failed to start test. Please try again.", 500);
  }
}

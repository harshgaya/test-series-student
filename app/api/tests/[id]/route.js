import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api";
import { getStudent } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const student = await getStudent();

    const test = await prisma.test.findUnique({
      where: { id },
      include: {
        exam: { select: { id: true, name: true, slug: true } },
        subject: { select: { id: true, name: true } },
        chapter: { select: { id: true, name: true } },
        _count: { select: { testQuestions: true, attempts: true } },
      },
    });
    if (!test) return errorResponse("Test not found", 404);

    // Check if student has purchased
    let purchased = false;
    let attempts = [];
    if (student) {
      if (Number(test.price) === 0) {
        purchased = true;
      } else {
        const purchase = await prisma.testPurchase.findUnique({
          where: { studentId_testId: { studentId: student.id, testId: id } },
        });
        purchased = !!purchase;
      }
      attempts = await prisma.testAttempt.findMany({
        where: { studentId: student.id, testId: id, status: "SUBMITTED" },
        orderBy: { submittedAt: "desc" },
        select: {
          id: true,
          score: true,
          submittedAt: true,
          rank: true,
          totalMarks: true,
        },
      });
    }

    // Leaderboard top 10
    const leaderboard = await prisma.testAttempt.findMany({
      where: { testId: id, status: "SUBMITTED" },
      orderBy: { score: "desc" },
      take: 10,
      include: { student: { select: { name: true } } },
    });

    // Stats
    const stats = await prisma.testAttempt.aggregate({
      where: { testId: id, status: "SUBMITTED" },
      _avg: { score: true },
      _max: { score: true },
      _count: { id: true },
    });

    return successResponse({ test, purchased, attempts, leaderboard, stats });
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to fetch test", 500);
  }
}

import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api";
import { getStudent } from "@/lib/auth";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get("testId");
    const student = await getStudent();

    if (!testId) return errorResponse("testId required");
    const testIdInt = parseInt(testId);
    if (isNaN(testIdInt)) return errorResponse("Invalid testId");

    const top = await prisma.testAttempt.findMany({
      where: { testId: testIdInt, status: "SUBMITTED" },
      orderBy: { score: "desc" },
      take: 10,
      include: { student: { select: { id: true, name: true } } },
    });

    const entries = top.map((a, i) => ({
      rank: i + 1,
      studentId: a.student?.id,
      name: a.student?.name || "Anonymous",
      score: Number(a.score),
      totalMarks: a.totalMarks,
    }));

    // Compute live rank for current student
    let myRank = null;
    if (student) {
      const myBest = await prisma.testAttempt.findFirst({
        where: {
          studentId: student.id,
          testId: testIdInt,
          status: "SUBMITTED",
        },
        orderBy: { score: "desc" },
      });

      if (myBest) {
        const higherCount = await prisma.testAttempt.count({
          where: {
            testId: testIdInt,
            status: "SUBMITTED",
            score: { gt: myBest.score },
          },
        });
        const totalCount = await prisma.testAttempt.count({
          where: { testId: testIdInt, status: "SUBMITTED" },
        });

        myRank = {
          rank: higherCount + 1,
          score: Number(myBest.score),
          totalMarks: myBest.totalMarks,
          total: totalCount,
        };
      }
    }

    return successResponse({ leaderboard: entries, myRank });
  } catch (error) {
    console.error(error);
    return errorResponse("Failed", 500);
  }
}

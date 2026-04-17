import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api";
import { getStudent } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const student = await getStudent();
    if (!student) return errorResponse("Login required", 401);

    const { id: idParam } = await params;
    const attemptId = parseInt(idParam);
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: {
        test: {
          include: {
            exam: { select: { name: true } },
            testQuestions: {
              orderBy: { orderIndex: "asc" },
              include: {
                question: {
                  include: {
                    options: { orderBy: { orderIndex: "asc" } },
                    subject: { select: { name: true } },
                    chapter: { select: { name: true } },
                  },
                },
              },
            },
          },
        },
        answers: true,
      },
    });

    if (!attempt || attempt.studentId !== student.id)
      return errorResponse("Not found", 404);

    // Subject wise breakdown
    const subjectMap = {};
    for (const tq of attempt.test.testQuestions) {
      const q = tq.question;
      const subject = q.subject?.name || "Unknown";
      const answer = attempt.answers.find((a) => a.questionId === q.id);
      if (!subjectMap[subject])
        subjectMap[subject] = {
          correct: 0,
          wrong: 0,
          skipped: 0,
          total: 0,
          marks: 0,
        };
      subjectMap[subject].total++;
      if (
        !answer ||
        (!answer.selectedOption &&
          !answer.integerAnswer &&
          !answer.selectedOptions?.length)
      ) {
        subjectMap[subject].skipped++;
      } else if (answer.isCorrect) {
        subjectMap[subject].correct++;
        subjectMap[subject].marks += attempt.test.marksCorrect;
      } else {
        subjectMap[subject].wrong++;
        subjectMap[subject].marks += Number(attempt.test.negativeMarking);
      }
    }

    // Leaderboard
    const leaderboard = await prisma.testAttempt.findMany({
      where: { testId: attempt.testId, status: "SUBMITTED" },
      orderBy: { score: "desc" },
      take: 10,
      include: { student: { select: { name: true } } },
    });

    return successResponse({
      attempt,
      subjectBreakdown: subjectMap,
      leaderboard,
    });
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to fetch result", 500);
  }
}

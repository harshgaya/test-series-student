import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api";
import { getStudent } from "@/lib/auth";
import { decodeAttempt, encodeAttempt, encodeTest } from "@/lib/hashid"; // ← add

export async function GET(request, { params }) {
  try {
    const student = await getStudent();
    if (!student) return errorResponse("Login required", 401);

    const { id: idParam } = await params;
    const attemptId = decodeAttempt(idParam); // ← was parseInt
    if (!attemptId) return errorResponse("Not found", 404); // ← null check

    const attempt = await prisma.testAttempt.findFirst({
      where: {
        id: attemptId,
        studentId: student.id,
      },
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

    if (!attempt) return errorResponse("Not found", 404);

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
      include: { student: { select: { id: true, name: true } } },
    });

    // Encode IDs before sending to client
    const encodedAttempt = {
      // ← encode block
      ...attempt,
      id: encodeAttempt(attempt.id),
      test: attempt.test
        ? { ...attempt.test, id: encodeTest(attempt.test.id) }
        : null,
    };
    const encodedLeaderboard = leaderboard.map((l) => ({
      ...l,
      id: encodeAttempt(l.id),
    }));

    return successResponse({
      attempt: encodedAttempt,
      subjectBreakdown: subjectMap,
      leaderboard: encodedLeaderboard,
    });
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to fetch result", 500);
  }
}

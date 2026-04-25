import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api";
import { getStudent } from "@/lib/auth";
import { decodeAttempt } from "@/lib/hashid"; // ← add

export async function POST(request) {
  try {
    const student = await getStudent();
    if (!student) return errorResponse("Login required", 401);

    const {
      attemptId,
      questionId,
      selectedOption,
      selectedOptions,
      integerAnswer,
      isMarked,
      timeSpentSecs,
    } = await request.json();

    const attemptIdInt = decodeAttempt(attemptId); // ← decode
    if (!attemptIdInt) return errorResponse("Invalid attempt", 400);

    const attempt = await prisma.testAttempt.findFirst({
      where: { id: attemptIdInt, studentId: student.id }, // ← ownership in query
    });
    if (!attempt) return errorResponse("Invalid attempt", 403);
    if (attempt.status !== "IN_PROGRESS")
      return errorResponse("Attempt already submitted");

    await prisma.attemptAnswer.upsert({
      where: {
        attemptId_questionId: {
          attemptId: attemptIdInt,
          questionId: parseInt(questionId),
        },
      },
      update: {
        selectedOption: selectedOption || null,
        selectedOptions: selectedOptions || [],
        integerAnswer: integerAnswer !== undefined ? integerAnswer : null,
        isMarked: isMarked || false,
        timeSpentSecs: timeSpentSecs || 0,
        answeredAt: new Date(),
      },
      create: {
        attemptId: attemptIdInt,
        questionId: parseInt(questionId),
        selectedOption: selectedOption || null,
        selectedOptions: selectedOptions || [],
        integerAnswer: integerAnswer !== undefined ? integerAnswer : null,
        isMarked: isMarked || false,
        timeSpentSecs: timeSpentSecs || 0,
      },
    });

    return successResponse({ saved: true });
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to save answer", 500);
  }
}

// import { prisma } from "@/lib/prisma";
// import { successResponse, errorResponse } from "@/lib/api";
// import { getStudent } from "@/lib/auth";
// import { decodeAttempt } from "@/lib/hashid"; // ← add

// export async function POST(request) {
//   try {
//     const student = await getStudent();
//     if (!student) return errorResponse("Login required", 401);

//     const {
//       attemptId,
//       questionId,
//       selectedOption,
//       selectedOptions,
//       integerAnswer,
//       isMarked,
//       timeSpentSecs,
//     } = await request.json();

//     const attemptIdInt = decodeAttempt(attemptId); // ← decode
//     if (!attemptIdInt) return errorResponse("Invalid attempt", 400);

//     const attempt = await prisma.testAttempt.findFirst({
//       where: { id: attemptIdInt, studentId: student.id }, // ← ownership in query
//     });
//     if (!attempt) return errorResponse("Invalid attempt", 403);
//     if (attempt.status !== "IN_PROGRESS")
//       return errorResponse("Attempt already submitted");

//     await prisma.attemptAnswer.upsert({
//       where: {
//         attemptId_questionId: {
//           attemptId: attemptIdInt,
//           questionId: parseInt(questionId),
//         },
//       },
//       update: {
//         selectedOption: selectedOption || null,
//         selectedOptions: selectedOptions || [],
//         integerAnswer: integerAnswer !== undefined ? integerAnswer : null,
//         isMarked: isMarked || false,
//         timeSpentSecs: timeSpentSecs || 0,
//         answeredAt: new Date(),
//       },
//       create: {
//         attemptId: attemptIdInt,
//         questionId: parseInt(questionId),
//         selectedOption: selectedOption || null,
//         selectedOptions: selectedOptions || [],
//         integerAnswer: integerAnswer !== undefined ? integerAnswer : null,
//         isMarked: isMarked || false,
//         timeSpentSecs: timeSpentSecs || 0,
//       },
//     });

//     return successResponse({ saved: true });
//   } catch (error) {
//     console.error(error);
//     return errorResponse("Failed to save answer", 500);
//   }
// }
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api";
import { getStudent } from "@/lib/auth";
import { decodeAttempt } from "@/lib/hashid";

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

    const attemptIdInt = decodeAttempt(attemptId);
    if (!attemptIdInt) return errorResponse("Invalid attempt", 400);

    const qid = parseInt(questionId);
    if (isNaN(qid)) return errorResponse("Invalid question", 400);

    const attempt = await prisma.testAttempt.findFirst({
      where: { id: attemptIdInt, studentId: student.id },
    });
    if (!attempt) return errorResponse("Invalid attempt", 403);
    if (attempt.status !== "IN_PROGRESS")
      return errorResponse("Attempt already submitted");

    const data = {
      selectedOption: selectedOption || null,
      selectedOptions: selectedOptions || [],
      integerAnswer: integerAnswer !== undefined ? integerAnswer : null,
      isMarked: isMarked || false,
      timeSpentSecs: timeSpentSecs || 0,
    };

    const existing = await prisma.attemptAnswer.findFirst({
      where: { attemptId: attemptIdInt, questionId: qid },
      select: { id: true },
    });

    if (existing) {
      await prisma.attemptAnswer.update({
        where: { id: existing.id },
        data: { ...data, answeredAt: new Date() },
      });
    } else {
      await prisma.attemptAnswer.create({
        data: {
          attemptId: attemptIdInt,
          questionId: qid,
          ...data,
        },
      });
    }

    return successResponse({ saved: true });
  } catch (error) {
    console.error("save-answer error:", error);
    return errorResponse("Failed to save answer", 500);
  }
}

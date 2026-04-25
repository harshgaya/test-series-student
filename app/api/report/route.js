import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api";
import { getStudent } from "@/lib/auth";

const VALID_TYPES = ["wrong_answer", "typo", "unclear", "image_issue", "other"];

export async function POST(request) {
  try {
    const student = await getStudent();
    if (!student) return errorResponse("Login required", 401);

    const { questionId, reportType, description } = await request.json();

    // Validation
    if (!questionId) return errorResponse("questionId required");
    if (!reportType || !VALID_TYPES.includes(reportType)) {
      return errorResponse("Invalid reportType");
    }
    if (description && description.length > 1000) {
      return errorResponse("Description too long (max 1000 chars)");
    }

    const questionIdInt = parseInt(questionId);
    if (isNaN(questionIdInt)) return errorResponse("Invalid questionId");

    // Prevent duplicate pending reports for the same question
    const existing = await prisma.questionReport.findFirst({
      where: {
        questionId: questionIdInt,
        studentId: student.id,
        status: "pending",
      },
    });
    if (existing)
      return errorResponse(
        "You already reported this question — admin is reviewing",
      );

    await prisma.questionReport.create({
      data: {
        questionId: questionIdInt,
        studentId: student.id,
        reportType,
        description: description || null,
        status: "pending",
      },
    });

    return successResponse({ reported: true });
  } catch (error) {
    console.error(error);
    return errorResponse("Failed", 500);
  }
}

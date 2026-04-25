import { getStudent } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api";

export async function GET() {
  const student = await getStudent();
  if (!student) return errorResponse("Not authenticated", 401);
  return successResponse({ student });
}

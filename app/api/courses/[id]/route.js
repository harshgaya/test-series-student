import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api";
import { getStudent } from "@/lib/auth";
import { decodeCourse, encodeCourse, encodeTest } from "@/lib/hashid"; // ← add

export async function GET(request, { params }) {
  try {
    const { id: idParam } = await params; // ← await params
    const id = decodeCourse(idParam); // ← was parseInt
    if (!id) return errorResponse("Course not found", 404);

    const student = await getStudent();

    const course = await prisma.crashCourse.findUnique({
      where: { id },
      include: {
        exam: { select: { id: true, name: true } },
        _count: { select: { enrollments: true } },
        courseTests: {
          orderBy: { dayNumber: "asc" },
          include: {
            test: {
              select: {
                id: true,
                title: true,
                testType: true,
                durationMins: true,
                totalMarks: true,
                _count: { select: { testQuestions: true } },
              },
            },
          },
        },
      },
    });
    if (!course) return errorResponse("Course not found", 404);

    let enrolled = false;
    let currentDay = 1;
    let completedDays = [];

    if (student) {
      const enrollment = await prisma.crashCourseEnrollment.findUnique({
        where: {
          studentId_crashCourseId: { studentId: student.id, crashCourseId: id },
        },
      });
      enrolled = !!enrollment;
      currentDay = enrollment?.currentDay || 1;

      if (enrolled) {
        const testIds = course.courseTests
          .filter((ct) => ct.testId)
          .map((ct) => ct.testId);
        const attempts = await prisma.testAttempt.findMany({
          where: {
            studentId: student.id,
            testId: { in: testIds },
            status: "SUBMITTED",
          },
          select: { testId: true },
        });
        completedDays = course.courseTests
          .filter((ct) => attempts.some((a) => a.testId === ct.testId))
          .map((ct) => ct.dayNumber);
      }
    }

    // Encode IDs before sending to client
    const encodedCourse = {
      // ← encode block
      ...course,
      id: encodeCourse(course.id),
      courseTests: course.courseTests.map((ct) => ({
        ...ct,
        test: ct.test ? { ...ct.test, id: encodeTest(ct.test.id) } : null,
      })),
    };

    return successResponse({
      course: encodedCourse, // ← encoded
      enrolled,
      currentDay,
      completedDays,
    });
  } catch (error) {
    console.error(error);
    return errorResponse("Failed to fetch course", 500);
  }
}

import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api'
import { getStudent } from '@/lib/auth'

export async function GET() {
  try {
    const student = await getStudent()
    if (!student) return errorResponse('Login required', 401)
    const enrollments = await prisma.crashCourseEnrollment.findMany({
      where:   { studentId: student.id },
      orderBy: { enrolledAt: 'desc' },
      include: { crashCourse: { include: { exam: { select: { name: true } }, _count: { select: { courseTests: true } } } } },
    })
    return successResponse(enrollments)
  } catch { return errorResponse('Failed', 500) }
}

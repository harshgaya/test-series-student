import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api'
import { getStudent } from '@/lib/auth'

export async function GET() {
  try {
    const student = await getStudent()
    if (!student) return errorResponse('Login required', 401)
    const attempts = await prisma.testAttempt.findMany({
      where:   { studentId: student.id, status: 'SUBMITTED' },
      orderBy: { submittedAt: 'desc' },
      include: { test: { select: { id:true, title:true, testType:true, totalMarks:true, exam:{ select:{ name:true } } } } },
    })
    return successResponse(attempts)
  } catch { return errorResponse('Failed', 500) }
}

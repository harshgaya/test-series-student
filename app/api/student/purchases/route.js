import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api'
import { getStudent } from '@/lib/auth'

export async function GET() {
  try {
    const student = await getStudent()
    if (!student) return errorResponse('Login required', 401)
    const purchases = await prisma.testPurchase.findMany({
      where:   { studentId: student.id },
      orderBy: { purchasedAt: 'desc' },
      include: { test: { select: { id: true, title: true, testType: true, durationMins: true, totalMarks: true } } },
    })
    return successResponse(purchases)
  } catch { return errorResponse('Failed', 500) }
}

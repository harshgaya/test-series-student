import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api'
import { getStudent } from '@/lib/auth'

export async function POST(request) {
  try {
    const student = await getStudent()
    if (!student) return errorResponse('Login required', 401)
    const { questionId, reportType, description } = await request.json()
    await prisma.questionReport.create({
      data: { questionId: parseInt(questionId), studentId: student.id, reportType, description, status: 'pending' },
    })
    return successResponse({ reported: true })
  } catch { return errorResponse('Failed', 500) }
}

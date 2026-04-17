import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const examId = searchParams.get('examId')
    const where  = { isActive: true }
    if (examId) where.examId = parseInt(examId)
    const subjects = await prisma.subject.findMany({ where, orderBy: { orderIndex: 'asc' } })
    return successResponse(subjects)
  } catch { return errorResponse('Failed', 500) }
}

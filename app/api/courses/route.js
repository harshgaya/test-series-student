import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const examId = searchParams.get('examId')
    const free   = searchParams.get('free')
    const search = searchParams.get('search')

    const where = { isActive: true }
    if (examId) where.examId = parseInt(examId)
    if (free === 'true') where.price = 0
    if (search) where.title = { contains: search, mode: 'insensitive' }

    const courses = await prisma.crashCourse.findMany({
      where, orderBy: { createdAt: 'desc' },
      include: {
        exam:   { select: { id: true, name: true } },
        _count: { select: { enrollments: true } },
      },
    })
    return successResponse(courses)
  } catch (error) {
    console.error(error)
    return errorResponse('Failed to fetch courses', 500)
  }
}

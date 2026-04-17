import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const subjectId  = searchParams.get('subjectId')
    const chapterId  = searchParams.get('chapterId')
    const difficulty = searchParams.get('difficulty')
    const type       = searchParams.get('type')
    const page       = parseInt(searchParams.get('page') || '1')
    const limit      = parseInt(searchParams.get('limit') || '20')
    const skip       = (page - 1) * limit

    const where = { isActive: true }
    if (subjectId)  where.subjectId    = parseInt(subjectId)
    if (chapterId)  where.chapterId    = parseInt(chapterId)
    if (difficulty) where.difficulty   = difficulty
    if (type)       where.questionType = type

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: {
          options: { orderBy: { orderIndex: 'asc' } },
          subject: { select: { name: true } },
          chapter: { select: { name: true } },
        },
      }),
      prisma.question.count({ where }),
    ])

    return successResponse({ questions, total, page, totalPages: Math.ceil(total / limit) })
  } catch { return errorResponse('Failed', 500) }
}

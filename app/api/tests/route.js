import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const examId    = searchParams.get('examId')
    const subjectId = searchParams.get('subjectId')
    const type      = searchParams.get('type')
    const free      = searchParams.get('free')
    const search    = searchParams.get('search')
    const sort      = searchParams.get('sort') || 'popular'
    const page      = parseInt(searchParams.get('page') || '1')
    const limit     = parseInt(searchParams.get('limit') || '20')
    const skip      = (page - 1) * limit

    const where = { status: 'PUBLISHED' }
    if (examId)    where.examId    = parseInt(examId)
    if (subjectId) where.subjectId = parseInt(subjectId)
    if (type)      where.testType  = type
    if (free === 'true') where.price = { lte: 0 }
    if (search)    where.title = { contains: search, mode: 'insensitive' }

    const orderBy = sort === 'popular'    ? { attemptCount: 'desc' }
                  : sort === 'latest'     ? { createdAt: 'desc' }
                  : sort === 'price-low'  ? { price: 'asc' }
                  : sort === 'price-high' ? { price: 'desc' }
                  : { createdAt: 'desc' }

    const [tests, total] = await Promise.all([
      prisma.test.findMany({
        where, orderBy, skip, take: limit,
        include: {
          exam:    { select: { id: true, name: true, slug: true } },
          subject: { select: { id: true, name: true } },
          chapter: { select: { id: true, name: true } },
          _count:  { select: { testQuestions: true, attempts: true } },
        },
      }),
      prisma.test.count({ where }),
    ])

    return successResponse({ tests, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error(error)
    return errorResponse('Failed to fetch tests', 500)
  }
}

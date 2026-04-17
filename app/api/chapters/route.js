import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const subjectId = searchParams.get('subjectId')
    const where     = { isActive: true }
    if (subjectId) where.subjectId = parseInt(subjectId)
    const chapters = await prisma.chapter.findMany({ where, orderBy: { orderIndex: 'asc' } })
    return successResponse(chapters)
  } catch { return errorResponse('Failed', 500) }
}

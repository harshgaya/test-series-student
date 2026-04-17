import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET() {
  try {
    const exams = await prisma.exam.findMany({
      where:   { isActive: true },
      orderBy: { orderIndex: 'asc' },
      select:  { id: true, name: true, slug: true, track: true, description: true },
    })
    return successResponse(exams)
  } catch { return errorResponse('Failed to fetch exams', 500) }
}

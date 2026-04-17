import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      where:   { isActive: true, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
      orderBy: { createdAt: 'desc' },
      take:    5,
    })
    return successResponse(announcements)
  } catch { return errorResponse('Failed', 500) }
}

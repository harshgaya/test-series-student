import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api'
import { getStudent } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getStudent()
    if (!session) return errorResponse('Login required', 401)
    const student = await prisma.student.findUnique({
      where:   { id: session.id },
      include: { targetExam: { select: { name: true } } },
    })
    return successResponse(student)
  } catch { return errorResponse('Failed', 500) }
}

export async function PUT(request) {
  try {
    const session = await getStudent()
    if (!session) return errorResponse('Login required', 401)
    const { name, targetExamId, targetYear, avatarUrl } = await request.json()
    const student = await prisma.student.update({
      where: { id: session.id },
      data:  { name, targetExamId: targetExamId ? parseInt(targetExamId) : null, targetYear, avatarUrl },
    })
    return successResponse(student)
  } catch { return errorResponse('Failed', 500) }
}

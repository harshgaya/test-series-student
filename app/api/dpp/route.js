import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api'
import { getStudent } from '@/lib/auth'

export async function GET() {
  try {
    const student = await getStudent()
    if (!student) return errorResponse('Login required', 401)

    // Get student weak chapters based on past attempts
    const answers = await prisma.attemptAnswer.findMany({
      where:   { attempt: { studentId: student.id, status: 'SUBMITTED' } },
      include: { question: { select: { chapterId: true } } },
      take:    200,
    })

    const chapterStats = {}
    for (const a of answers) {
      const ch = a.question?.chapterId
      if (!ch) continue
      if (!chapterStats[ch]) chapterStats[ch] = { correct: 0, total: 0 }
      chapterStats[ch].total++
      if (a.isCorrect) chapterStats[ch].correct++
    }

    const weakChapters = Object.entries(chapterStats)
      .filter(([_, s]) => s.total >= 3)
      .sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))
      .slice(0, 3)
      .map(([id]) => parseInt(id))

    const where = weakChapters.length > 0
      ? { chapterId: { in: weakChapters }, isActive: true }
      : { examId: student.targetExamId || undefined, isActive: true }

    const questions = await prisma.question.findMany({
      where,
      take:    10,
      orderBy: { createdAt: 'desc' },
      include: { options: { orderBy: { orderIndex: 'asc' } }, subject: { select: { name: true } }, chapter: { select: { name: true } } },
    })

    return successResponse(questions)
  } catch { return errorResponse('Failed', 500) }
}

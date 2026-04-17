import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api'
import { getStudent } from '@/lib/auth'

export async function POST(request) {
  try {
    const student = await getStudent()
    if (!student) return errorResponse('Login required', 401)

    const { source, subjectId, chapterId, count, difficulty, shuffle } = await request.json()

    let questionIds = []

    if (source === 'scratch') {
      const where = { isActive: true }
      if (subjectId) where.subjectId = parseInt(subjectId)
      if (chapterId) where.chapterId = parseInt(chapterId)
      if (difficulty) where.difficulty = difficulty
      const questions = await prisma.question.findMany({ where, take: count || 20, select: { id: true } })
      questionIds = questions.map(q => q.id)
    }

    if (source === 'bookmarks') {
      const key  = `bookmarks_${student.id}`
      const data = await prisma.setting.findUnique({ where: { key } })
      questionIds = data ? JSON.parse(data.value) : []
    }

    if (source === 'wrong') {
      const answers = await prisma.attemptAnswer.findMany({
        where:   { attempt: { studentId: student.id, status: 'SUBMITTED' }, isCorrect: false },
        select:  { questionId: true },
        take:    count || 20,
      })
      questionIds = [...new Set(answers.map(a => a.questionId))]
    }

    if (source === 'weak') {
      const answers = await prisma.attemptAnswer.findMany({
        where:   { attempt: { studentId: student.id, status: 'SUBMITTED' } },
        include: { question: { select: { chapterId: true } } },
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
        .sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))
        .slice(0, 3).map(([id]) => parseInt(id))
      const questions = await prisma.question.findMany({
        where: { chapterId: { in: weakChapters }, isActive: true },
        take:  count || 20, select: { id: true },
      })
      questionIds = questions.map(q => q.id)
    }

    if (shuffle) questionIds = questionIds.sort(() => Math.random() - 0.5)

    return successResponse({ questionIds, total: questionIds.length })
  } catch { return errorResponse('Failed', 500) }
}

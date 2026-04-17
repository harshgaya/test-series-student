import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api'
import { getStudent } from '@/lib/auth'

export async function GET() {
  try {
    const student = await getStudent()
    if (!student) return errorResponse('Login required', 401)

    const attempts = await prisma.testAttempt.findMany({
      where:   { studentId: student.id, status: 'SUBMITTED' },
      orderBy: { submittedAt: 'asc' },
      include: {
        test:    { select: { totalMarks:true, title:true } },
        answers: { include: { question: { select: { subjectId:true, chapterId:true, subject:{ select:{ name:true } }, chapter:{ select:{ name:true } } } } } },
      },
    })

    // Score trend
    const scoreTrend = attempts.slice(-10).map(a => ({
      date:  a.submittedAt,
      score: Number(a.score),
      total: a.totalMarks,
      pct:   a.totalMarks > 0 ? Math.round((Number(a.score)/a.totalMarks)*100) : 0,
    }))

    // Subject accuracy
    const subjectMap = {}
    const chapterMap = {}
    let totalCorrect = 0, totalAnswered = 0

    for (const attempt of attempts) {
      for (const answer of attempt.answers) {
        const sub = answer.question?.subject?.name
        const ch  = answer.question?.chapter?.name
        if (sub) {
          if (!subjectMap[sub]) subjectMap[sub] = { correct:0, total:0 }
          subjectMap[sub].total++
          if (answer.isCorrect) { subjectMap[sub].correct++; totalCorrect++ }
          if (answer.selectedOption || answer.integerAnswer || answer.selectedOptions?.length) totalAnswered++
        }
        if (ch) {
          if (!chapterMap[ch]) chapterMap[ch] = { correct:0, total:0, subject: sub }
          chapterMap[ch].total++
          if (answer.isCorrect) chapterMap[ch].correct++
        }
      }
    }

    const subjectStats = Object.entries(subjectMap).map(([name,s]) => ({ name, ...s, accuracy: s.total>0?Math.round((s.correct/s.total)*100):0 }))
    const chapterStats = Object.entries(chapterMap).map(([name,s]) => ({ name, ...s, accuracy: s.total>0?Math.round((s.correct/s.total)*100):0 }))
    const weakChapters = chapterStats.filter(c=>c.total>=3).sort((a,b)=>a.accuracy-b.accuracy).slice(0,5)

    return successResponse({ scoreTrend, subjectStats, chapterStats, weakChapters, totalAttempts: attempts.length, totalCorrect, totalAnswered })
  } catch (e) { console.error(e); return errorResponse('Failed', 500) }
}

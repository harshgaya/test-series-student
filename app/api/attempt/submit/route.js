import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api'
import { getStudent } from '@/lib/auth'

export async function POST(request) {
  try {
    const student = await getStudent()
    if (!student) return errorResponse('Login required', 401)

    const { attemptId, timeTakenSecs, tabSwitchCount, autoSubmitted } = await request.json()

    const attempt = await prisma.testAttempt.findUnique({
      where:   { id: parseInt(attemptId) },
      include: {
        answers: true,
        test:    { include: { testQuestions: { include: { question: { include: { options: true } } } } } },
      },
    })

    if (!attempt || attempt.studentId !== student.id) return errorResponse('Invalid attempt', 403)
    if (attempt.status !== 'IN_PROGRESS') return errorResponse('Already submitted')

    const marksCorrect  = attempt.test.marksCorrect
    const negMarking    = Number(attempt.test.negativeMarking)
    let score           = 0
    let correctCount    = 0
    let wrongCount      = 0
    let skippedCount    = 0

    // Grade each answer
    const answerUpdates = []
    for (const tq of attempt.test.testQuestions) {
      const q      = tq.question
      const answer = attempt.answers.find(a => a.questionId === q.id)

      if (!answer || (!answer.selectedOption && !answer.integerAnswer && answer.selectedOptions?.length === 0)) {
        skippedCount++
        continue
      }

      let isCorrect = false
      if (q.questionType === 'MCQ') {
        const correctOpt = q.options.find(o => o.isCorrect)
        isCorrect = correctOpt?.label === answer.selectedOption
      } else if (q.questionType === 'INTEGER') {
        isCorrect = Number(q.integerAnswer) === Number(answer.integerAnswer)
      } else if (q.questionType === 'MULTI_CORRECT') {
        const correctLabels = q.options.filter(o => o.isCorrect).map(o => o.label).sort()
        const selected      = (answer.selectedOptions || []).sort()
        isCorrect = JSON.stringify(correctLabels) === JSON.stringify(selected)
      }

      const marks = isCorrect ? marksCorrect : (answer.selectedOption || answer.integerAnswer || answer.selectedOptions?.length) ? negMarking : 0
      score += marks
      if (isCorrect) correctCount++
      else if (marks < 0) wrongCount++
      else skippedCount++

      answerUpdates.push(prisma.attemptAnswer.update({
        where: { id: answer.id },
        data:  { isCorrect, marksAwarded: marks },
      }))
    }

    await Promise.all(answerUpdates)

    // Count total attempts for rank calculation
    const totalAttempts = await prisma.testAttempt.count({
      where: { testId: attempt.testId, status: 'SUBMITTED' },
    })

    const rank = await prisma.testAttempt.count({
      where: { testId: attempt.testId, status: 'SUBMITTED', score: { gt: score } },
    }) + 1

    const percentile = totalAttempts > 0 ? ((totalAttempts - rank + 1) / totalAttempts) * 100 : 100

    const updated = await prisma.testAttempt.update({
      where: { id: attempt.id },
      data:  {
        status:        'SUBMITTED',
        submittedAt:   new Date(),
        timeTakenSecs: timeTakenSecs || null,
        score:         Math.max(0, score),
        correctCount,
        wrongCount,
        skippedCount,
        rank,
        percentile,
        totalAttempted: totalAttempts + 1,
      },
    })

    // Update test attempt count
    await prisma.test.update({ where: { id: attempt.testId }, data: { attemptCount: { increment: 1 } } })

    return successResponse({ attemptId: attempt.id, score: Math.max(0, score), rank, percentile })
  } catch (error) {
    console.error(error)
    return errorResponse('Failed to submit', 500)
  }
}

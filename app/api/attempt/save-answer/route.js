import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api'
import { getStudent } from '@/lib/auth'

export async function POST(request) {
  try {
    const student = await getStudent()
    if (!student) return errorResponse('Login required', 401)

    const { attemptId, questionId, selectedOption, selectedOptions, integerAnswer, isMarked, timeSpentSecs } = await request.json()

    const attempt = await prisma.testAttempt.findUnique({ where: { id: parseInt(attemptId) } })
    if (!attempt || attempt.studentId !== student.id) return errorResponse('Invalid attempt', 403)
    if (attempt.status !== 'IN_PROGRESS') return errorResponse('Attempt already submitted')

    await prisma.attemptAnswer.upsert({
      where:  { attemptId_questionId: { attemptId: parseInt(attemptId), questionId: parseInt(questionId) } },
      update: {
        selectedOption:  selectedOption  || null,
        selectedOptions: selectedOptions || [],
        integerAnswer:   integerAnswer   !== undefined ? integerAnswer : null,
        isMarked:        isMarked        || false,
        timeSpentSecs:   timeSpentSecs   || 0,
        answeredAt:      new Date(),
      },
      create: {
        attemptId:       parseInt(attemptId),
        questionId:      parseInt(questionId),
        selectedOption:  selectedOption  || null,
        selectedOptions: selectedOptions || [],
        integerAnswer:   integerAnswer   !== undefined ? integerAnswer : null,
        isMarked:        isMarked        || false,
        timeSpentSecs:   timeSpentSecs   || 0,
      },
    })

    return successResponse({ saved: true })
  } catch (error) {
    console.error(error)
    return errorResponse('Failed to save answer', 500)
  }
}

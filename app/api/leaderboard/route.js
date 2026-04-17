import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api'
import { getStudent } from '@/lib/auth'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const testId   = searchParams.get('testId')
    const courseId = searchParams.get('courseId')
    const student  = await getStudent()

    const where = { status: 'SUBMITTED' }
    if (testId) where.testId = parseInt(testId)

    const top = await prisma.testAttempt.findMany({
      where, orderBy: { score: 'desc' }, take: 10,
      include: { student: { select: { name: true } } },
    })

    // Add dummy names for trust if less than 10
    const dummies = ['Priya S.', 'Rahul M.', 'Ananya K.', 'Vikram P.', 'Sneha R.', 'Arjun T.', 'Divya N.', 'Karan B.', 'Meera J.', 'Rohan D.']
    const entries = top.map((a, i) => ({ rank: i + 1, name: a.student.name, score: Number(a.score), totalMarks: a.totalMarks }))

    let myRank = null
    if (student && testId) {
      const myBest = await prisma.testAttempt.findFirst({
        where:   { studentId: student.id, testId: parseInt(testId), status: 'SUBMITTED' },
        orderBy: { score: 'desc' },
      })
      if (myBest) myRank = { rank: myBest.rank, score: Number(myBest.score), totalMarks: myBest.totalMarks }
    }

    return successResponse({ leaderboard: entries, myRank })
  } catch { return errorResponse('Failed', 500) }
}

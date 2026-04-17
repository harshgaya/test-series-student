import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api'
import { getStudent } from '@/lib/auth'

export async function GET() {
  try {
    const student = await getStudent()
    if (!student) return errorResponse('Login required', 401)
    // Using Setting model as a simple KV store for bookmarks
    const key  = `bookmarks_${student.id}`
    const data = await prisma.setting.findUnique({ where: { key } })
    const bookmarkIds = data ? JSON.parse(data.value) : []
    if (!bookmarkIds.length) return successResponse([])
    const questions = await prisma.question.findMany({
      where:   { id: { in: bookmarkIds } },
      include: { subject: { select: { name: true } }, chapter: { select: { name: true } }, options: { orderBy: { orderIndex: 'asc' } } },
    })
    return successResponse(questions)
  } catch { return errorResponse('Failed', 500) }
}

export async function POST(request) {
  try {
    const student = await getStudent()
    if (!student) return errorResponse('Login required', 401)
    const { questionId, note } = await request.json()
    const key  = `bookmarks_${student.id}`
    const data = await prisma.setting.findUnique({ where: { key } })
    const ids  = data ? JSON.parse(data.value) : []
    if (!ids.includes(parseInt(questionId))) ids.push(parseInt(questionId))
    await prisma.setting.upsert({ where: { key }, update: { value: JSON.stringify(ids) }, create: { key, value: JSON.stringify(ids) } })
    return successResponse({ bookmarked: true })
  } catch { return errorResponse('Failed', 500) }
}

export async function DELETE(request) {
  try {
    const student = await getStudent()
    if (!student) return errorResponse('Login required', 401)
    const { questionId } = await request.json()
    const key  = `bookmarks_${student.id}`
    const data = await prisma.setting.findUnique({ where: { key } })
    const ids  = data ? JSON.parse(data.value).filter(id => id !== parseInt(questionId)) : []
    await prisma.setting.upsert({ where: { key }, update: { value: JSON.stringify(ids) }, create: { key, value: JSON.stringify(ids) } })
    return successResponse({ removed: true })
  } catch { return errorResponse('Failed', 500) }
}

import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'
import { COOKIE_NAME } from '@/lib/constants'
import { cookies } from 'next/headers'

export async function POST(request) {
  try {
    const { phone, name, targetExam, targetYear } = await request.json()

    if (!phone || !name) return errorResponse('Phone and name required')

    // Check not already exists
    const existing = await prisma.student.findUnique({ where: { phone } })
    if (existing) return errorResponse('Student already registered')

    const student = await prisma.student.create({
      data: {
        phone,
        name:          name.trim(),
        targetExamId:  targetExam ? parseInt(targetExam) : null,
        targetYear:    targetYear || 2026,
        lastLoginAt:   new Date(),
      },
    })

    const token = await signToken({ id: student.id, phone: student.phone, name: student.name })
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, path: '/',
    })

    return successResponse({ student: { id: student.id, name: student.name, phone: student.phone } }, 201)
  } catch (error) {
    console.error(error)
    return errorResponse('Registration failed', 500)
  }
}

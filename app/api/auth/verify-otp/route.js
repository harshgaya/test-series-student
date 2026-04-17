import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'
import { COOKIE_NAME, OTP_HARDCODED } from '@/lib/constants'
import { cookies } from 'next/headers'

export async function POST(request) {
  try {
    const { phone, otp } = await request.json()

    if (!phone || !otp) return errorResponse('Phone and OTP required')

    // Hardcoded OTP check
    if (otp !== OTP_HARDCODED) return errorResponse('Invalid OTP')

    // Check if student exists
    const existing = await prisma.student.findUnique({ where: { phone } })

    if (existing) {
      // Existing student — issue token
      const token = await signToken({ id: existing.id, phone: existing.phone, name: existing.name })
      const cookieStore = await cookies()
      cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true, secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, path: '/',
      })
      await prisma.student.update({ where: { id: existing.id }, data: { lastLoginAt: new Date() } })
      return successResponse({ newStudent: false, student: { id: existing.id, name: existing.name, phone: existing.phone, targetExamId: existing.targetExamId } })
    }

    // New student
    return successResponse({ newStudent: true })
  } catch (error) {
    console.error(error)
    return errorResponse('Verification failed', 500)
  }
}

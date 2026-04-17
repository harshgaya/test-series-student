import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api'
import { getStudent } from '@/lib/auth'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })

export async function POST(request) {
  try {
    const student = await getStudent()
    if (!student) return errorResponse('Login required', 401)

    const { orderId } = await request.json()
    const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: orderId } })

    if (payment?.status === 'SUCCESS') return successResponse({ status: 'SUCCESS' })

    // Check Razorpay directly
    try {
      const order = await razorpay.orders.fetch(orderId)
      if (order.status === 'paid') {
        const updated = await prisma.payment.update({
          where: { razorpayOrderId: orderId },
          data:  { status: 'SUCCESS' },
        })
        if (updated.testId) {
          await prisma.testPurchase.upsert({
            where:  { studentId_testId: { studentId: student.id, testId: updated.testId } },
            update: {},
            create: { studentId: student.id, testId: updated.testId, amountPaid: updated.amount, orderId },
          })
        }
        if (updated.crashCourseId) {
          await prisma.crashCourseEnrollment.upsert({
            where:  { studentId_crashCourseId: { studentId: student.id, crashCourseId: updated.crashCourseId } },
            update: {},
            create: { studentId: student.id, crashCourseId: updated.crashCourseId },
          })
        }
        return successResponse({ status: 'SUCCESS' })
      }
    } catch {}

    return successResponse({ status: payment?.status || 'PENDING' })
  } catch (error) {
    console.error(error)
    return errorResponse('Failed to check status', 500)
  }
}

import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api'
import { getStudent } from '@/lib/auth'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

export async function POST(request) {
  try {
    const student = await getStudent()
    if (!student) return errorResponse('Login required', 401)

    const { testId, courseId } = await request.json()
    if (!testId && !courseId) return errorResponse('testId or courseId required')

    let amount = 0
    let description = ''

    if (testId) {
      const test = await prisma.test.findUnique({ where: { id: parseInt(testId) } })
      if (!test) return errorResponse('Test not found')
      amount      = Number(test.price) * 100  // paise
      description = test.title
    }

    if (courseId) {
      const course = await prisma.crashCourse.findUnique({ where: { id: parseInt(courseId) } })
      if (!course) return errorResponse('Course not found')
      amount      = Number(course.price) * 100
      description = course.title
    }

    if (amount === 0) return errorResponse('This item is free — no payment needed')

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt:  `rcpt_${Date.now()}`,
    })

    // Save pending payment in DB
    await prisma.payment.create({
      data: {
        studentId:       student.id,
        testId:          testId   ? parseInt(testId)   : null,
        crashCourseId:   courseId ? parseInt(courseId) : null,
        razorpayOrderId: order.id,
        amount:          amount / 100,
        currency:        'INR',
        status:          'PENDING',
      },
    })

    return successResponse({ orderId: order.id, amount, currency: 'INR', description })
  } catch (error) {
    console.error(error)
    return errorResponse('Failed to create order', 500)
  }
}

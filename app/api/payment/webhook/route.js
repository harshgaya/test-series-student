import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

async function giveAccess(payment) {
  if (payment.testId) {
    await prisma.testPurchase.upsert({
      where:  { studentId_testId: { studentId: payment.studentId, testId: payment.testId } },
      update: {},
      create: { studentId: payment.studentId, testId: payment.testId, amountPaid: payment.amount, paymentId: payment.razorpayPaymentId, orderId: payment.razorpayOrderId },
    })
  }
  if (payment.crashCourseId) {
    await prisma.crashCourseEnrollment.upsert({
      where:  { studentId_crashCourseId: { studentId: payment.studentId, crashCourseId: payment.crashCourseId } },
      update: {},
      create: { studentId: payment.studentId, crashCourseId: payment.crashCourseId },
    })
  }
}

export async function POST(request) {
  try {
    const body      = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex')

    if (signature !== expected) return Response.json({ error: 'Invalid signature' }, { status: 400 })

    const event = JSON.parse(body)
    if (event.event === 'payment.captured') {
      const orderId = event.payload.payment.entity.order_id
      const payId   = event.payload.payment.entity.id
      const payment = await prisma.payment.update({
        where: { razorpayOrderId: orderId },
        data:  { status: 'SUCCESS', razorpayPaymentId: payId },
      })
      await giveAccess(payment)
    }

    return Response.json({ received: true })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Webhook failed' }, { status: 500 })
  }
}

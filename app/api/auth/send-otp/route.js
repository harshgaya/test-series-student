import { successResponse, errorResponse } from '@/lib/api'

export async function POST(request) {
  try {
    const { phone } = await request.json()
    if (!phone || phone.length < 10) return errorResponse('Invalid phone number')
    // Hardcoded OTP for now — no SMS sent
    // Later: integrate MSG91/Fast2SMS here
    return successResponse({ message: 'OTP sent successfully' })
  } catch { return errorResponse('Failed to send OTP', 500) }
}

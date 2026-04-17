import { successResponse } from '@/lib/api'
import { COOKIE_NAME } from '@/lib/constants'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, '', { maxAge: 0, path: '/' })
  return successResponse({ loggedOut: true })
}

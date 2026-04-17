import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { COOKIE_NAME } from './constants'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'iitneet_secret_key_change_in_production')

export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch { return null }
}

export async function getStudent() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null
    return await verifyToken(token)
  } catch { return null }
}

// lib/jwt.js — NEW file, middleware-safe
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
console.log(
  "[JWT] secret defined?",
  !!process.env.JWT_SECRET,
  "length:",
  process.env.JWT_SECRET?.length,
);

export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

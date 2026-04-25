// lib/auth.js
import { cookies } from "next/headers";
import { COOKIE_NAME } from "./constants";
import { prisma } from "./prisma";
import { verifyToken } from "./jwt";

export async function getStudent() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload?.sub) return null;
  return prisma.student.findUnique({
    where: { id: Number(payload.sub) },
    select: { id: true, name: true, phone: true, targetExamId: true },
  });
}

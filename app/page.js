import { prisma } from "@/lib/prisma";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

async function getData() {
  try {
    const [exams, featuredTests, featuredCourses, announcements] =
      await Promise.all([
        prisma.exam.findMany({
          where: { isActive: true },
          orderBy: { orderIndex: "asc" },
        }),
        prisma.test.findMany({
          where: { status: "PUBLISHED" },
          orderBy: { attemptCount: "desc" },
          take: 6,
          include: {
            exam: { select: { id: true, name: true, slug: true } },
            _count: { select: { testQuestions: true, attempts: true } },
          },
        }),
        prisma.crashCourse.findMany({
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
          take: 4,
          include: {
            exam: { select: { id: true, name: true } },
            _count: { select: { enrollments: true } },
          },
        }),
        prisma.announcement.findMany({
          where: {
            isActive: true,
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
          orderBy: { createdAt: "desc" },
          take: 3,
        }),
      ]);
    return { exams, featuredTests, featuredCourses, announcements };
  } catch {
    return {
      exams: [],
      featuredTests: [],
      featuredCourses: [],
      announcements: [],
    };
  }
}

export default async function HomePage() {
  const data = await getData();
  return <HomeClient {...data} />;
}

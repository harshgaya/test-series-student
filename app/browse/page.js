import { prisma } from '@/lib/prisma'
import BrowseClient from './BrowseClient'
export const dynamic = 'force-dynamic'

async function getData() {
  try {
    const [exams, subjects, tests, courses] = await Promise.all([
      prisma.exam.findMany({ where: { isActive: true }, orderBy: { orderIndex: 'asc' } }),
      prisma.subject.findMany({ where: { isActive: true }, orderBy: { orderIndex: 'asc' } }),
      prisma.test.findMany({
        where:   { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        include: {
          exam:   { select: { id: true, name: true, slug: true } },
          subject: { select: { id: true, name: true } },
          _count: { select: { testQuestions: true, attempts: true } },
        },
      }),
      prisma.crashCourse.findMany({
        where:   { isActive: true },
        orderBy: { createdAt: 'desc' },
        include: {
          exam:   { select: { id: true, name: true } },
          _count: { select: { enrollments: true } },
        },
      }),
    ])
    return { exams, subjects, tests, courses }
  } catch {
    return { exams: [], subjects: [], tests: [], courses: [] }
  }
}

export default async function BrowsePage() {
  const data = await getData()
  return <BrowseClient {...data} />
}

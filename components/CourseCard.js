"use client";
import Link from "next/link";
import {
  MdCalendarToday,
  MdPeople,
  MdArrowForward,
  MdPlayCircle,
} from "react-icons/md";
import { EXAM_COLORS, DEFAULT_EXAM_COLOR } from "@/lib/constants";

export default function CourseCard({ course }) {
  const isFree = Number(course.price) === 0;
  const examColor = EXAM_COLORS[course.exam?.name] || DEFAULT_EXAM_COLOR;
  const enrolled = course._count?.enrollments || 0;
  const isPopular = enrolled > 500;

  return (
    <Link href={`/course/${course.id}`} className="group block no-underline">
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg">
        {/* Banner */}
        <div
          className="relative flex items-center justify-between overflow-hidden px-5 py-5"
          style={{
            background: `linear-gradient(135deg, ${examColor.text}e0, #0891B2c0)`,
          }}
        >
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute right-5 -bottom-8 h-20 w-20 rounded-full bg-white/8" />

          <div className="relative">
            {course.exam?.name && (
              <p className="mb-1 text-[11px] font-semibold text-white/70">
                {course.exam.name}
              </p>
            )}
            <p className="text-4xl font-extrabold leading-none text-white">
              {course.durationDays}
            </p>
            <p className="mt-0.5 text-[12px] font-medium text-white/80">
              Day Course
            </p>
          </div>

          <MdPlayCircle
            size={40}
            className="relative flex-shrink-0 text-white/25 transition group-hover:text-white/40"
          />
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-4">
          {/* Badges */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {isFree ? (
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                FREE
              </span>
            ) : (
              <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-bold text-orange-600 ring-1 ring-orange-200">
                ₹{Number(course.price)}
              </span>
            )}
            {isPopular && (
              <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-600 ring-1 ring-rose-200">
                🔥 Popular
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-snug text-slate-800 flex-1">
            {course.title}
          </h3>

          {/* Description */}
          {course.description && (
            <p className="mb-3 line-clamp-2 text-[12px] leading-relaxed text-slate-400">
              {course.description}
            </p>
          )}

          {/* Meta row */}
          <div className="mb-4 flex flex-wrap gap-3">
            <span className="flex items-center gap-1 text-[12px] text-slate-400">
              <MdCalendarToday size={13} /> {course.durationDays} days
            </span>
            {enrolled > 0 && (
              <span className="flex items-center gap-1 text-[12px] text-slate-400">
                <MdPeople size={13} /> {enrolled.toLocaleString("en-IN")}{" "}
                enrolled
              </span>
            )}
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between rounded-xl border border-teal-100 bg-teal-50 px-4 py-2.5 transition group-hover:bg-teal-100">
            <span className="text-sm font-semibold text-teal-700">
              {isFree ? "Enroll Free" : `Enroll ₹${Number(course.price)}`}
            </span>
            <MdArrowForward
              size={16}
              className="text-teal-600 transition group-hover:translate-x-0.5"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

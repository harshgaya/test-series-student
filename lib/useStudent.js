"use client";
import { useState, useEffect } from "react";

let cachedStudent = null;
let cachePromise = null;

export function useStudent() {
  const [student, setStudent] = useState(cachedStudent);
  const [loading, setLoading] = useState(!cachedStudent);

  useEffect(() => {
    if (cachedStudent) return;

    if (!cachePromise) {
      cachePromise = fetch("/api/me")
        .then((r) => r.json())
        .then((d) => {
          cachedStudent = d.success ? d.data.student : null;
          return cachedStudent;
        })
        .catch(() => null);
    }

    cachePromise.then((s) => {
      setStudent(s);
      setLoading(false);
    });
  }, []);

  return { student, loading };
}

// Call after login/register
export function setStudentCache(student) {
  cachedStudent = student;
  cachePromise = Promise.resolve(student);
}

// Call after logout
export function clearStudentCache() {
  cachedStudent = null;
  cachePromise = null;
}

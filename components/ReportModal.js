"use client";
import { useState } from "react";
import { MdClose, MdFlag } from "react-icons/md";
import toast from "react-hot-toast";

const REPORT_TYPES = [
  { value: "wrong_answer", label: "Wrong answer marked", emoji: "❌" },
  { value: "typo", label: "Question has typo", emoji: "✏️" },
  { value: "image_issue", label: "Image not loading", emoji: "🖼️" },
  { value: "unclear", label: "Unclear question", emoji: "❓" },
  { value: "other", label: "Other issue", emoji: "💬" },
];

export default function ReportModal({ questionId, onClose }) {
  const [type, setType] = useState("");
  const [description, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!type) {
      toast.error("Select a report type");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, reportType: type, description }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success("Report submitted. Thank you!");
        onClose?.();
      } else toast.error(d.error || "Failed to submit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50">
              <MdFlag size={16} className="text-red-500" />
            </div>
            <p className="text-[15px] font-bold text-slate-900">
              Report Question
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <MdClose size={18} />
          </button>
        </div>

        <div className="p-5">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-slate-400">
            What is the issue?
          </p>

          {/* Report type options */}
          <div className="mb-4 space-y-2">
            {REPORT_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-2.5 text-left text-sm transition-all ${
                  type === t.value
                    ? "border-red-400 bg-red-50 font-semibold text-red-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span className="text-base">{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Details textarea */}
          <textarea
            placeholder="Additional details (optional)"
            value={description}
            onChange={(e) => setDesc(e.target.value)}
            rows={3}
            className="mb-4 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
          />

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !type}
              className={`flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition ${
                !type || loading
                  ? "cursor-not-allowed bg-slate-200 text-slate-400"
                  : "bg-red-500 hover:bg-red-600 shadow-sm shadow-red-500/25"
              }`}
            >
              {loading ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

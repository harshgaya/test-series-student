"use client";
import { useState } from "react";
import { MdClose, MdFlag } from "react-icons/md";
import toast from "react-hot-toast";

const REPORT_TYPES = [
  { value: "wrong_answer", label: "Wrong answer marked" },
  { value: "typo", label: "Question has typo" },
  { value: "image_issue", label: "Image not loading" },
  { value: "unclear", label: "Unclear question" },
  { value: "other", label: "Other" },
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
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          width: "100%",
          maxWidth: 400,
          overflow: "hidden",
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid #E5E7EB",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <MdFlag style={{ color: "#DC2626", fontSize: 20 }} />
            <p style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>
              Report Question
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 22,
              color: "#9CA3AF",
              display: "flex",
              padding: 4,
            }}
          >
            <MdClose />
          </button>
        </div>

        <div style={{ padding: 20 }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#6B7280",
              marginBottom: 12,
            }}
          >
            What is the issue?
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginBottom: 16,
            }}
          >
            {REPORT_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                style={{
                  textAlign: "left",
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: `2px solid ${type === t.value ? "#DC2626" : "#E5E7EB"}`,
                  background: type === t.value ? "#FEF2F2" : "white",
                  color: type === t.value ? "#DC2626" : "#374151",
                  fontSize: 14,
                  fontWeight: type === t.value ? 600 : 400,
                  cursor: "pointer",
                  fontFamily: "Poppins, sans-serif",
                  transition: "all 0.15s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <textarea
            placeholder="Additional details (optional)"
            value={description}
            onChange={(e) => setDesc(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              minHeight: 80,
              border: "1.5px solid #E5E7EB",
              borderRadius: 8,
              fontFamily: "Poppins, sans-serif",
              fontSize: 14,
              color: "#111827",
              resize: "vertical",
              outline: "none",
              marginBottom: 16,
            }}
          />

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: 11,
                borderRadius: 99,
                border: "2px solid #0D9488",
                background: "white",
                color: "#0D9488",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !type}
              style={{
                flex: 1,
                padding: 11,
                borderRadius: 99,
                border: "none",
                background: !type ? "#F3F4F6" : "#DC2626",
                color: !type ? "#9CA3AF" : "white",
                fontSize: 14,
                fontWeight: 600,
                cursor: !type ? "not-allowed" : "pointer",
                fontFamily: "Poppins, sans-serif",
                transition: "all 0.15s",
              }}
            >
              {loading ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

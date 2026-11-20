"use client"
import { FC, useState } from "react"
import Modal from "@/components/seondary/modal"
import { usePostWagerReportMutation } from "../../../api-feature/apiSlice"
import toast from "react-hot-toast";
import { Inter } from "next/font/google";

const interfont = Inter({
    variable: "--",
    subsets: ["latin"]
});

const CATEGORIES = [
    { value: "cheating",   label: "Cheating" },
    { value: "harassment", label: "Harassment" },
    { value: "bug",        label: "Bug / Technical Issue" },
    { value: "other",      label: "Other" },
]

type Props = {
    isOpen: boolean
    onClose: () => void
}

const ReportModal: FC<Props> = ({ isOpen, onClose }) => {
    const [subject, setSubject] = useState("")
    const [description, setDescription] = useState("")
    const [category, setCategory] = useState("other")
    const [submitted, setSubmitted] = useState(false)
    const [postReport, { isLoading }] = usePostWagerReportMutation()

    const handleSubmit = async () => {
        if (!subject.trim() || !description.trim()) return
        try {
            await postReport({ subject: subject.trim(), description: description.trim(), category }).unwrap()
            setSubmitted(true)
        } catch {
            toast.error("Failed to submit report. Please try again.")
        }
    }

    const handleClose = () => {
        setSubject("")
        setDescription("")
        setCategory("other")
        setSubmitted(false)
        onClose()
    }

    const canSubmit = subject.trim().length > 0 && description.trim().length > 0 && !isLoading

    return (
        <Modal isOpen={isOpen} onClose={handleClose} closeOnClickOutside>
            <div className={interfont.className} style={{ width: "100%", maxWidth: "24rem", margin: "0 auto", marginTop: 20 }}>
                {submitted ? (
                    <div style={{ textAlign: "center", padding: "1rem 0" }}>
                        <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✅</p>
                        <h2 style={{ color: "#4ade80", fontWeight: 700, marginBottom: "0.5rem" }}>
                            Report Submitted
                        </h2>
                        <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
                            Thanks for letting us know. You can track its status on your incidents page.
                        </p>
                        <button
                            onClick={handleClose}
                            style={{
                                padding: "0.6rem 1.5rem",
                                borderRadius: "0.3rem",
                                background: "rgba(0,255,225,0.1)",
                                border: "1px solid #00ffe1",
                                color: "#00ffe1",
                                // fontFamily: "'Press Start 2P', cursive",
                                fontSize: "1em",
                                cursor: "pointer",
                            }}
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <>
                        <h2 style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.25rem" }}>
                            Submit a Report
                        </h2>
                        <p style={{ color: "#64748b", fontSize: "0.8rem", marginBottom: "1.25rem" }}>
                            Report cheating, harassment, bugs, or any other issue.
                        </p>

                        {/* Category */}
                        <label style={{ display: "block", color: "#94a3b8", fontSize: "0.75rem", marginBottom: "0.4rem" }}>
                            Category
                        </label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1rem" }}>
                            {CATEGORIES.map((c) => (
                                <button
                                    key={c.value}
                                    onClick={() => setCategory(c.value)}
                                    style={{
                                        padding: "0.3rem 0.75rem",
                                        borderRadius: "0.3rem",
                                        fontSize: "0.75rem",
                                        cursor: "pointer",
                                        background: category === c.value ? "rgba(0,255,225,0.12)" : "rgba(255,255,255,0.03)",
                                        border: `1px solid ${category === c.value ? "#00ffe1" : "#334155"}`,
                                        color: category === c.value ? "#00ffe1" : "#64748b",
                                        transition: "all 0.15s ease",
                                    }}
                                >
                                    {c.label}
                                </button>
                            ))}
                        </div>

                        {/* Subject */}
                        <label style={{ display: "block", color: "#94a3b8", fontSize: "0.75rem", marginBottom: "0.4rem" }}>
                            Subject
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Brief summary of the issue"
                            maxLength={120}
                            style={{
                                width: "100%",
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(0,255,225,0.25)",
                                borderRadius: "0.4rem",
                                color: "#f1f5f9",
                                padding: "0.55rem 0.75rem",
                                fontSize: "0.85rem",
                                outline: "none",
                                boxSizing: "border-box",
                                marginBottom: "0.9rem",
                            }}
                        />

                        {/* Description */}
                        <label style={{ display: "block", color: "#94a3b8", fontSize: "0.75rem", marginBottom: "0.4rem" }}>
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the issue in detail…"
                            maxLength={1000}
                            rows={4}
                            style={{
                                width: "100%",
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(0,255,225,0.25)",
                                borderRadius: "0.4rem",
                                color: "#f1f5f9",
                                padding: "0.6rem 0.75rem",
                                fontSize: "0.85rem",
                                resize: "vertical",
                                outline: "none",
                                boxSizing: "border-box",
                            }}
                        />
                        <p style={{ color: "#475569", fontSize: "0.7rem", textAlign: "right", marginBottom: "1rem" }}>
                            {description.length}/1000
                        </p>

                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                                onClick={handleClose}
                                style={{
                                    flex: 1,
                                    padding: "0.65rem",
                                    borderRadius: "0.3rem",
                                    background: "transparent",
                                    border: "1px solid #334155",
                                    color: "#64748b",
                                    fontSize: "0.8rem",
                                    cursor: "pointer",
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!canSubmit}
                                style={{
                                    flex: 2,
                                    padding: "0.65rem",
                                    borderRadius: "0.3rem",
                                    background: canSubmit ? "rgba(255,45,110,0.12)" : "rgba(255,45,110,0.05)",
                                    border: "1px solid #ff2d6e",
                                    color: canSubmit ? "#ff2d6e" : "#7f1d3c",
                                    fontSize: "0.8rem",
                                    cursor: canSubmit ? "pointer" : "not-allowed",
                                    letterSpacing: "0.04em",
                                }}
                            >
                                {isLoading ? "Submitting…" : "Submit Report"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    )
}

export default ReportModal

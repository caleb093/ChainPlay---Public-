"use client"
import { FC, useState } from "react"
import Modal from "@/components/seondary/modal"
import { usePostWagerDisputeMutation } from "../../../api-feature/apiSlice"
import toast from "react-hot-toast"
import {Inter} from "next/font/google";
import { twMerge } from "tailwind-merge";

const interfont = Inter({
    variable: "--",
    subsets: ["latin"]
});

type Props = {
    isOpen: boolean
    onClose: () => void
    matchId: string
    className?: string
}

const DisputeMatchModal: FC<Props> = ({ isOpen, onClose, matchId, className }) => {
    const [reason, setReason] = useState("")
    const [submitted, setSubmitted] = useState(false)
    const [postDispute, { isLoading }] = usePostWagerDisputeMutation()

    const handleSubmit = async () => {
        const trimmed = reason.trim()
        if (!trimmed) return
        try {
            await postDispute({ matchId, reason: trimmed }).unwrap()
            setSubmitted(true)
        } catch (err: unknown) {
            const code = (err as { data?: { error?: string } })?.data?.error
            if (code === "DUPLICATE_DISPUTE") {
                toast.error("You already filed a dispute for this match.")
            } else if (code === "NOT_A_PARTICIPANT") {
                toast.error("You were not a participant in this match.")
            } else {
                toast.error("Failed to submit dispute. Please try again.")
            }
        }
    }

    const handleClose = () => {
        setReason("")
        setSubmitted(false)
        onClose()
    }

    if (!isOpen) return null

    return (
        // <Modal isOpen={isOpen} onClose={handleClose} closeOnClickOutside>
            <div className={twMerge(`${interfont.className} fixed bg-black/90 top-2 rounded-lg h-full w-[95%] flex flex-col px-5 overflow-auto justify-center ${className}`)} style={{  }}>
                {submitted ? (
                    <div style={{ textAlign: "center", padding: "1rem 0" }}>
                        <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✅</p>
                        <h2 style={{ color: "#4ade80", fontWeight: 700, marginBottom: "0.5rem" }}>
                            Dispute Submitted
                        </h2>
                        <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
                            Our team will review your report. You can track its status on your incidents page.
                        </p>
                        <button
                            onClick={handleClose}
                            style={{
                                padding: "0.6rem 1.5rem",
                                borderRadius: "0.3rem",
                                background: "rgba(0,255,225,0.1)",
                                border: "1px solid #00ffe1",
                                color: "#00ffe1",
                                fontFamily: "'Press Start 2P', cursive",
                                fontSize: "0.65rem",
                                cursor: "pointer",
                            }}
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <>
                        <h2 style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.25rem" }}>
                            Report Match Issue
                        </h2>
                        <p style={{ color: "#64748b", fontSize: "0.8rem", marginBottom: "1.25rem" }}>
                            Describe what went wrong during this match.
                        </p>

                        <label style={{ display: "block", textAlign: "left", color: "#94a3b8", fontSize: "0.75rem", marginBottom: "0.4rem" }}>
                            Reason
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g. Opponent never moved and I was charged"
                            maxLength={500}
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
                            {reason.length}/500
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
                                disabled={isLoading || !reason.trim()}
                                style={{
                                    flex: 2,
                                    padding: "0.65rem",
                                    borderRadius: "0.3rem",
                                    background: isLoading || !reason.trim() ? "rgba(255,45,110,0.05)" : "rgba(255,45,110,0.12)",
                                    border: "1px solid #ff2d6e",
                                    color: isLoading || !reason.trim() ? "#7f1d3c" : "#ff2d6e",
                                    // fontFamily: "'Press Start 2P', cursive",
                                    fontSize: "0.8rem",
                                    cursor: isLoading || !reason.trim() ? "not-allowed" : "pointer",
                                    letterSpacing: "0.04em",
                                }}
                            >
                                {isLoading ? "Submitting…" : "Submit Dispute"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        // </Modal>
    )
}

export default DisputeMatchModal

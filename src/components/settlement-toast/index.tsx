"use client"
import { FC, useEffect, useRef, useState } from "react"

export type SettlementStatus = {
    matchId: string
    stage: "settling" | "confirmed" | "persisting" | "complete" | "error"
    detail: string | null
    timestamp: number
}

type NonErrorStage = "settling" | "confirmed" | "persisting" | "complete"

const ORDERED_STAGES: { key: NonErrorStage; label: string }[] = [
    { key: "settling",   label: "Submitting to Solana"  },
    { key: "confirmed",  label: "Verified on-chain"     },
    { key: "persisting", label: "Saving match results"  },
    { key: "complete",   label: "Settlement complete"   },
]

interface SettlementToastProps {
    data: SettlementStatus | null
}

const SettlementToast: FC<SettlementToastProps> = ({ data }) => {
    const [visible, setVisible]               = useState(false)
    const [completedStages, setCompletedStages] = useState<Set<NonErrorStage>>(new Set())
    const [activeStage, setActiveStage]       = useState<SettlementStatus["stage"] | null>(null)
    const [errorDetail, setErrorDetail]       = useState<string | null>(null)
    const dismissTimerRef = useRef<NodeJS.Timeout | null>(null)
    const lastMatchIdRef  = useRef<string | null>(null)

    useEffect(() => {
        if (!data) return

        const { stage, detail, matchId } = data

        // Reset accumulated state when a new match settlement begins
        if (matchId !== lastMatchIdRef.current) {
            lastMatchIdRef.current = matchId
            setCompletedStages(new Set())
            setErrorDetail(null)
            if (dismissTimerRef.current) {
                clearTimeout(dismissTimerRef.current)
                dismissTimerRef.current = null
            }
        }

        // Cancel any pending auto-dismiss when new stage arrives
        if (dismissTimerRef.current) {
            clearTimeout(dismissTimerRef.current)
            dismissTimerRef.current = null
        }

        setVisible(true)
        setActiveStage(stage)

        if (stage === "error") {
            setErrorDetail(detail)
            // Completed stages remain as-is — whatever was done before the error
            return
        }

        setErrorDetail(null)

        const currentIdx = ORDERED_STAGES.findIndex(s => s.key === stage)

        if (stage === "complete") {
            // Mark every stage done and schedule auto-dismiss
            setCompletedStages(new Set(ORDERED_STAGES.map(s => s.key)))
            dismissTimerRef.current = setTimeout(() => setVisible(false), 4000)
        } else if (currentIdx > 0) {
            // Mark all preceding stages as completed
            setCompletedStages(
                new Set(ORDERED_STAGES.slice(0, currentIdx).map(s => s.key) as NonErrorStage[])
            )
        } else {
            setCompletedStages(new Set())
        }
    }, [data])

    useEffect(() => {
        return () => {
            if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
        }
    }, [])

    if (!visible) return null

    const isError   = activeStage === "error"
    const isDone    = activeStage === "complete" && !isError
    const headerLabel = isError ? "SETTLEMENT FAILED" : isDone ? "SETTLEMENT COMPLETE" : "SETTLING MATCH"
    const accentColor = isError ? "#ff2d6e" : "#00ffe1"
    const accentAlpha = isError ? "rgba(255,45,110," : "rgba(0,255,225,"

    return (
        <div
            style={{
                position:       "fixed",
                top:            "1rem",
                left:           "1rem",
                zIndex:         9990,
                minWidth:       "230px",
                maxWidth:       "290px",
                background:     "rgba(7, 7, 28, 0.96)",
                border:         `1px solid ${accentAlpha}0.35)`,
                borderRadius:   "0.75rem",
                boxShadow:      `0 0 18px ${accentAlpha}0.2), 0 0 36px rgba(120,0,255,0.12)`,
                backdropFilter: "blur(14px)",
                overflow:       "hidden",
            }}
        >
            {/* ── Header ─────────────────────────────────────────── */}
            <div
                style={{
                    padding:      "0.6rem 0.9rem",
                    borderBottom: `1px solid ${accentAlpha}0.15)`,
                    background:   `${accentAlpha}0.06)`,
                    display:      "flex",
                    alignItems:   "center",
                    gap:          "0.45rem",
                }}
            >
                {/* Pulse dot */}
                {!isError && !isDone && (
                    <span
                        style={{
                            display:         "inline-block",
                            width:           "6px",
                            height:          "6px",
                            borderRadius:    "50%",
                            background:      accentColor,
                            boxShadow:       `0 0 6px ${accentColor}`,
                            flexShrink:      0,
                            animation:       "settlement-pulse 1.2s ease-in-out infinite",
                        }}
                    />
                )}
                <span
                    style={{
                        fontSize:    "0.55rem",
                        fontFamily:  "'Press Start 2P', cursive",
                        color:       accentColor,
                        textShadow:  `0 0 8px ${accentColor}`,
                        letterSpacing: "0.04em",
                        lineHeight:  1.4,
                    }}
                >
                    {headerLabel}
                </span>
            </div>

            {/* ── Stage rows ─────────────────────────────────────── */}
            <div style={{ padding: "0.7rem 0.9rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {ORDERED_STAGES.map(({ key, label }) => {
                    const stageDone   = completedStages.has(key)
                    const stageActive = activeStage === key && !isError
                    const stagePending = !stageDone && !stageActive

                    return (
                        <div key={key} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                            {/* Indicator — fixed-width box so labels stay aligned */}
                            <div style={{ width: "18px", height: "18px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {stageDone ? (
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <circle cx="7" cy="7" r="7" fill="rgba(0,255,100,0.12)" />
                                        <path d="M3.5 7L6 9.5L10.5 5" stroke="#00e676" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ) : stageActive ? (
                                    <div
                                        className="animate-spin"
                                        style={{
                                            width:        "14px",
                                            height:       "14px",
                                            border:       "2px solid rgba(0,255,225,0.18)",
                                            borderTop:    "2px solid #00ffe1",
                                            borderRadius: "50%",
                                        }}
                                    />
                                ) : (
                                    <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "rgba(148,163,184,0.25)" }} />
                                )}
                            </div>

                            {/* Label */}
                            <span
                                style={{
                                    fontSize:     "0.72rem",
                                    color:        stageDone   ? "#00e676"
                                                : stageActive ? "#e2e8f0"
                                                :               "rgba(148,163,184,0.4)",
                                    fontWeight:   stageActive ? 600 : 400,
                                    letterSpacing: "0.01em",
                                    transition:   "color 0.3s ease",
                                }}
                            >
                                {label}
                            </span>
                        </div>
                    )
                })}

                {/* ── Error row (only when stage === "error") ──────── */}
                {isError && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", marginTop: "0.2rem", paddingTop: "0.35rem", borderTop: "1px solid rgba(255,45,110,0.18)" }}>
                        <div style={{ width: "18px", height: "18px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: "1px" }}>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <circle cx="7" cy="7" r="7" fill="rgba(255,45,110,0.15)" />
                                <path d="M4.5 4.5L9.5 9.5M9.5 4.5L4.5 9.5" stroke="#ff2d6e" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div>
                            <span style={{ fontSize: "0.72rem", color: "#ff2d6e", fontWeight: 600, textShadow: "0 0 6px rgba(255,45,110,0.5)" }}>
                                Failed
                            </span>
                            {errorDetail && (
                                <p style={{ fontSize: "0.65rem", color: "rgba(255,120,150,0.85)", margin: "0.2rem 0 0", lineHeight: 1.45 }}>
                                    {errorDetail}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Injected keyframe for the pulse dot */}
            <style>{`
                @keyframes settlement-pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50%       { opacity: 0.4; transform: scale(0.75); }
                }
            `}</style>
        </div>
    )
}

export default SettlementToast

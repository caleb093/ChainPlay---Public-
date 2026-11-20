"use client"
import HomeLayout from "@/components/layouts/home-layout"
import ProtectLayout from "@/components/layouts/protect-layout"
import IncidentStatusBadge from "@/components/seondary/IncidentStatusBadge"
import { useLazyGetWagerIncidentsQuery } from "../../../api-feature/apiSlice"
import { IIncident, IDisputeDetails, IReportDetails, ISettlementDetails, IncidentStatus } from "../../../api-feature/types"
import { useEffect, useState } from "react"
import Link from "next/link"
import Loading from "@/components/seondary/Loading"

const STATUS_FILTERS: { label: string; value: string }[] = [
    { label: "All",           value: "" },
    { label: "Open",          value: "open" },
    { label: "Investigating", value: "investigating" },
    { label: "Resolved",      value: "resolved" },
    { label: "Dismissed",     value: "dismissed" },
]

const EXPLORER = "https://solscan.io/tx"

const CATEGORY_META: Record<string, { label: string; bg: string; color: string; border: string }> = {
    settlement: { label: "Settlement", bg: "rgba(251,191,36,0.1)",  color: "#fbbf24", border: "rgba(251,191,36,0.3)" },
    dispute:    { label: "Dispute",    bg: "rgba(239,68,68,0.1)",   color: "#f87171", border: "rgba(239,68,68,0.3)" },
    report:     { label: "Report",     bg: "rgba(139,92,246,0.1)",  color: "#a78bfa", border: "rgba(139,92,246,0.3)" },
}

function TxLink({ sig }: { sig: string }) {
    return (
        <a
            href={`${EXPLORER}/${sig}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#00ffe1", fontSize: "0.75rem", textDecoration: "underline", textUnderlineOffset: "3px", wordBreak: "break-all" }}
        >
            {sig.slice(0, 12)}…{sig.slice(-6)} ↗
        </a>
    )
}

// ── Detail modal ─────────────────────────────────────────────────────────────

function IncidentDetailModal({ incident, onClose }: { incident: IIncident; onClose: () => void }) {
    const cat = CATEGORY_META[incident.category] ?? CATEGORY_META.report
    const isSettlement = incident.category === "settlement"
    const isDispute    = incident.category === "dispute"
    const isReport     = incident.category === "report"

    const settlementDetails = isSettlement ? (incident.details as ISettlementDetails) : null
    const disputeDetails    = isDispute    ? (incident.details as IDisputeDetails)    : null
    const reportDetails     = isReport     ? (incident.details as IReportDetails)     : null

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed", inset: 0, zIndex: 9999,
                background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
                display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    width: "100%", maxWidth: "480px",
                    background: "#0a0a12",
                    border: "1px solid rgba(0,255,225,0.15)",
                    borderRadius: "1rem",
                    padding: "1.5rem",
                    color: "#a1a1aa",
                    maxHeight: "90vh",
                    overflowY: "auto",
                }}
            >
            
                {/* Status + date row */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                    <IncidentStatusBadge status={incident.status as IncidentStatus} />
                    <span style={{ color: "#334155", fontSize: "0.7rem" }}>
                        Filed {new Date(incident.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    {incident.updatedAt !== incident.createdAt && (
                        <span style={{ color: "#1e293b", fontSize: "0.7rem" }}>
                            · Updated {new Date(incident.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                    )}
                </div>

                {/* Incident ID */}
                <Row label="Incident ID">
                    <span style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#475569" }}>{incident.id}</span>
                </Row>

                {/* Match ID */}
                {incident.matchId && (
                    <Row label="Match ID">
                        <span style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#64748b" }}>{incident.matchId}</span>
                    </Row>
                )}

                <div style={{ borderTop: "1px solid #0f172a", margin: "1rem 0" }} />

                {/* ── Settlement details ── */}
                {isSettlement && settlementDetails && (
                    <>
                        {settlementDetails.txSignature ? (
                            <Row label="Transaction"><TxLink sig={settlementDetails.txSignature} /></Row>
                        ) : (
                            <Row label="Transaction"><span style={{ color: "#334155", fontSize: "0.75rem" }}>No signature recorded</span></Row>
                        )}
                    </>
                )}

                {/* ── Dispute details ── */}
                {isDispute && disputeDetails && (
                    <>
                        {disputeDetails.reportedBy && (
                            <Row label="Reported by">
                                <span style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#64748b" }}>
                                    {disputeDetails.reportedBy}
                                </span>
                            </Row>
                        )}
                        <Row label="Reason">
                            <p style={{ color: "#94a3b8", fontSize: "0.8rem", lineHeight: 1.5, margin: 0 }}>{disputeDetails.reason}</p>
                        </Row>
                        {disputeDetails.txSignature && (
                            <Row label="Transaction"><TxLink sig={disputeDetails.txSignature} /></Row>
                        )}
                    </>
                )}

                {/* ── Report details ── */}
                {isReport && reportDetails && (
                    <>
                        {reportDetails.category && (
                            <Row label="Category">
                                <span style={{ color: "#94a3b8", fontSize: "0.78rem", textTransform: "capitalize" }}>{reportDetails.category}</span>
                            </Row>
                        )}
                        <Row label="Description">
                            <p style={{ color: "#94a3b8", fontSize: "0.8rem", lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>
                                {reportDetails.description}
                            </p>
               
            </div>
        </div>
    )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.65rem", alignItems: "flex-start" }}>
            <span style={{ color: "#334155", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", minWidth: "88px", flexShrink: 0, paddingTop: "0.1rem" }}>
                {label}
            </span>
            <div style={{ flex: 1 }}>{children}</div>
        </div>
    )
}

// ── List card ─────────────────────────────────────────────────────────────────

function IncidentCard({ incident, onClick }: { incident: IIncident; onClick: () => void }) {
    const cat = CATEGORY_META[incident.category] ?? CATEGORY_META.report
    const isDispute    = incident.category === "dispute"
    const isReport     = incident.category === "report"

    const disputeDetails = isDispute ? (incident.details as IDisputeDetails) : null
    const reportDetails  = isReport  ? (incident.details as IReportDetails)  : null

    return (
        <button
            onClick={onClick}
            style={{
                width: "100%", textAlign: "left",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(0,255,225,0.1)",
                borderRadius: "0.75rem",
                padding: "1rem 1.25rem",
                cursor: "pointer",
                transition: "border-color 0.2s, background 0.2s",
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,255,225,0.25)"
                ;(e.currentTarget as HTMLButtonElement).style.background = "rgba(0,255,225,0.03)"
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,255,225,0.1)"
                ;(e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.02)"
            }}
        >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <span
                        style={{
                            display: "inline-block", padding: "0.1rem 0.5rem", borderRadius: "0.25rem",
                            fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                            marginBottom: "0.4rem",
                            background: cat.bg, color: cat.color, border: `1px solid ${cat.border}`,
                        }}
                    >
                        {cat.label}
                    </span>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.4rem", flexShrink: 0 }}>
                    <IncidentStatusBadge status={incident.status as IncidentStatus} />
                    <p style={{ color: "#334155", fontSize: "0.65rem" }}>
                        {new Date(incident.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                    <p style={{ color: "#1e293b", fontSize: "0.6rem" }}>View details →</p>
                </div>
            </div>
        </button>
    )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function IncidentsPage() {
    const [statusFilter, setStatusFilter] = useState("")
    const [page, setPage] = useState(1)
    const [selected, setSelected] = useState<IIncident | null>(null)
    const [triggerFetch, { data, isLoading, isFetching, isError }] = useLazyGetWagerIncidentsQuery()

    useEffect(() => {
        triggerFetch({ status: statusFilter || undefined, page, limit: 20 })
    }, [statusFilter, page, triggerFetch])

    const handleFilterChange = (val: string) => {
        setPage(1)
        setStatusFilter(val)
    }

    const incidents = data?.incidents ?? []
    const totalPages = data?.pages ?? 1

    return (
        <HomeLayout>
            <ProtectLayout>
                <div className="fixed h-full inset-0 grid-bg opacity-20 z-[2]" />
               
                            <div style={{
                                textAlign: "center", padding: "4rem 1rem",
                                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,255,225,0.08)",
                                borderRadius: "1rem", color: "#334155",
                            }}>
                                <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📭</p>
                                <p style={{ fontSize: "0.9rem" }}>No incidents found</p>
                                {statusFilter && (
                                    <button
                                        onClick={() => handleFilterChange("")}
                                        style={{ marginTop: "0.75rem", background: "none", border: "none", color: "#00ffe1", fontSize: "0.8rem", cursor: "pointer", textDecoration: "underline" }}
                                    >
                                        Clear filter
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {incidents.map((incident) => (
                                    <IncidentCard key={incident.id} incident={incident} onClick={() => setSelected(incident)} />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.75rem", marginTop: "2rem" }}>
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page <= 1}
                                    style={{ padding: "0.4rem 0.9rem", borderRadius: "0.3rem", background: "transparent", border: "1px solid #1e293b", color: page <= 1 ? "#1e293b" : "#64748b", cursor: page <= 1 ? "not-allowed" : "pointer", fontSize: "0.8rem" }}
                                >
                                    ← Prev
                                </button>
                                <span style={{ color: "#475569", fontSize: "0.8rem" }}>{page} / {totalPages}</span>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page >= totalPages}
                                    style={{ padding: "0.4rem 0.9rem", borderRadius: "0.3rem", background: "transparent", border: "1px solid #1e293b", color: page >= totalPages ? "#1e293b" : "#64748b", cursor: page >= totalPages ? "not-allowed" : "pointer", fontSize: "0.8rem" }}
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {selected && <IncidentDetailModal incident={selected} onClose={() => setSelected(null)} />}
            </ProtectLayout>
        </HomeLayout>
    )
}

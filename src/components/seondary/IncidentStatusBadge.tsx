import { IncidentStatus } from "../../../api-feature/types"

const config: Record<IncidentStatus, { label: string; color: string; bg: string; border: string }> = {
    open:          { label: "Open",          color: "#facc15", bg: "rgba(250,204,21,0.1)",  border: "rgba(250,204,21,0.4)" },
    investigating: { label: "Investigating", color: "#60a5fa", bg: "rgba(96,165,250,0.1)",  border: "rgba(96,165,250,0.4)" },
    resolved:      { label: "Resolved",      color: "#4ade80", bg: "rgba(74,222,128,0.1)",  border: "rgba(74,222,128,0.4)" },
    dismissed:     { label: "Dismissed",     color: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.4)" },
}

export default function IncidentStatusBadge({ status }: { status: IncidentStatus }) {
    const { label, color, bg, border } = config[status] ?? config.open
    return (
        <span
            style={{
                display: "inline-block",
                padding: "0.15rem 0.6rem",
                borderRadius: "0.3rem",
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color,
                background: bg,
                border: `1px solid ${border}`,
            }}
        >
            {label}
        </span>
    )
}

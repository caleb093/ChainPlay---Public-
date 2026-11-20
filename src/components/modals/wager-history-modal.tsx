"use client"
import { Inter } from "next/font/google"
import { useContext } from "react";
import { appContext } from "@/contexts/appContext";
import Image from "next/image";
import { useGetWagerStatsQuery } from "../../../api-feature/apiSlice";
import { ApiType, IWagerStats, IMatchHistoryEntry } from "../../../api-feature/types";
import { User2 } from "lucide-react";

interface WagerHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    gameId: string;
}

const interfont = Inter({ variable: "--", subsets: ["latin"] });

interface wagerStatsApiType extends ApiType {
    data: { data: IWagerStats; success: boolean }
}

export default function WagerHistoryModal({ isOpen, onClose, gameId }: WagerHistoryModalProps) {
    const { data } = useGetWagerStatsQuery<wagerStatsApiType>({ gameId }, { skip: !isOpen })
    const wagerStats = data?.data

    const { userProfile } = useContext(appContext)
    const username = userProfile?.username || "User";
    const walletAddress = userProfile?.walletAddress || "—";

    if (!isOpen) return null;

    const truncateAddress = (addr: string) =>
        addr ? `${addr.slice(0, 4)}...${addr.slice(-4)}` : "—";

    const timeAgo = (date: Date | string): string => {
        const ms = Date.now() - new Date(date).getTime()
        const s = Math.floor(ms / 1000)
        if (s < 60) return `${s}s ago`
        const m = Math.floor(s / 60)
        if (m < 60) return `${m}m ago`
        const h = Math.floor(m / 60)
        if (h < 24) return `${h}h ago`
        return `${Math.floor(h / 24)}d ago`
    }

    const getResultMeta = (match: IMatchHistoryEntry): { label: string; color: string } => {
        switch (match.result) {
            case "win":            return { label: "WIN",       color: "#03fc07" }
            case "loss":           return { label: "LOSS",      color: "#fc0303" }
            case "mutual_forfeit": return { label: "DRAW",      color: "rgba(255,255,255,0.35)" }
            case "forfeit":
                return match.forfeitedBy === "player"
                    ? { label: "FORFEIT",   color: "#fc0303" }
                    : { label: "OPP. QUIT", color: "#03fc07" }
            default:               return { label: "—",         color: "rgba(255,255,255,0.35)" }
        }
    }

    const neonBorder = "1px solid rgba(0,255,225,0.25)";
    const glassCard = { background: "rgba(255,255,255,0.04)", border: neonBorder };

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center ${interfont.className}`}
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
            onMouseDown={onClose}
        >
            <div
                className="relative w-[92%] max-w-[420px] flex flex-col gap-5 p-6 rounded-xl overflow-y-auto"
                style={{
                    background: "#0d0d1f",
                    border: "1px solid rgba(0,255,225,0.35)",
                    boxShadow: "0 0 40px rgba(0,255,225,0.08), 0 0 80px rgba(192,64,255,0.06)",
                    maxHeight: "90vh",
                }}
                onMouseDown={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <p className="text-[20px] font-black tracking-[0.1em] uppercase"
                        style={{ color: "#00ffe1", textShadow: "0 0 8px #00ffe1" }}>
                        History
                    </p>
                    <button
                        onClick={onClose}
                        className="text-[1.2em] font-black cursor-pointer transition-all hover:opacity-60"
                        style={{ color: "#ff2d6e", textShadow: "0 0 8px #ff2d6e" }}>
                        ✕
                    </button>
                </div>

                {/* Divider */}
                <div className="w-full h-px" style={{
                    background: "linear-gradient(90deg, transparent, #00ffe1, #c040ff, transparent)"
                }} />

                {/* Avatar + Identity */}
                <div className="flex items-center gap-4">
                    <div className="shrink-0 w-[64px] h-[64px] rounded-full overflow-hidden"
                        style={{ background: "#333", border: "2px solid rgba(0,255,225,0.4)" }}>
                        {userProfile?.avatar
                            ? <Image src={userProfile.avatar} alt={username} width={64} height={64} />
                            : <User2 className="w-20 h-20" />
                        }
                    </div>
                    <div className="flex flex-col gap-2">
                        <p className="font-black text-[1.3em] tracking-widest text-left" style={{ color: "#fff" }}>
                            {username}
                        </p>
                        <div className="flex items-center gap-2 -mt-1">
                            <p className="text-[0.8em] tracking-wider truncate text-[#00ffe1]">
                                {truncateAddress(walletAddress)}
                            </p>
                            <button
                                onClick={() => navigator.clipboard.writeText(walletAddress)}
                                title="Copy address"
                                className="text-[10px] cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                                style={{ color: "#00ffe1", background: "none", border: "none" }}>
                                ⧉
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: "Games Played", value: (wagerStats?.totalWins ?? 0) + (wagerStats?.totalLosses ?? 0), color: "#00ffe1" },
                        { label: "Wins",          value: wagerStats?.totalWins ?? 0,   color: "#03fc07" },
                        { label: "Losses",        value: wagerStats?.totalLosses ?? 0, color: "#fc0303" },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="flex flex-col items-center gap-1 py-4" style={glassCard}>
                            <p className="text-[1.5em] font-bold leading-none" style={{ color }}>{value}</p>
                            <p className="text-[11px] tracking-widest text-center"
                                style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
                        </div>
                    ))}
                </div>

                {/* Total Won */}
                <div className="flex flex-col text-left gap-3 px-4 py-3" style={glassCard}>
                    <p className="text-[12px] font-black tracking-widest uppercase"
                        style={{ color: "rgba(255,255,255,0.4)" }}>Total Amount Won</p>
                    <p className="text-[1.5em] font-black leading-none flex items-center gap-1"
                        style={{ color: "#03fc07" }}>
                        {wagerStats?.totalAmountWon ?? 0}
                        <span className="text-[0.7em] text-cyan-500">PLAY</span>
                    </p>
                </div>

                {/* Recent Matches */}
                {wagerStats?.recentMatches && wagerStats.recentMatches.length > 0 && (
                    <div>
                        <p className="text-[11px] font-black tracking-widest uppercase mb-2"
                            style={{ color: "rgba(255,255,255,0.35)" }}>
                            Recent Matches
                        </p>
                        <div
                            className="flex flex-col overflow-y-auto"
                            style={{ maxHeight: 220, scrollbarWidth: "thin", scrollbarColor: "rgba(0,255,225,0.15) transparent" }}
                        >
                            {wagerStats.recentMatches.map((match) => {
                                const { label, color } = getResultMeta(match)
                                return (
                                    <div key={match.matchId}
                                        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 10 }}>
                                        <div className="flex justify-between items-center gap-3 pt-2.5">
                                            <div>
                                                <p className="text-[13px] font-semibold text-white truncate leading-tight">
                                                    You vs{" "}
                                                    <span style={{ color: "#00ffe1" }}>
                                                        {match.opponentUsername || truncateAddress(match.opponentAddress)}
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0 flex items-center gap-1">
                                                <span className="text-[13px] font-bold leading-tight" style={{ color }}>
                                                    {match.amountWagered}
                                                </span>
                                                <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.28)" }}>
                                                    PLAY
                                                </span>
                                                <span
                                                    className="text-[9px] ml-2 font-black tracking-widest px-2 py-[3px] rounded shrink-0"
                                                    style={{
                                                        background: `${color}18`,
                                                        border: `1px solid ${color}55`,
                                                        color,
                                                        minWidth: 58,
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {label}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.28)" }}>
                                                {timeAgo(match.playedAt)}
                                            </span>
                                            <span
                                                className="text-[9px] font-bold px-1.5 py-[1px] rounded"
                                                style={{
                                                    background: "rgba(192,64,255,0.1)",
                                                    border: "1px solid rgba(192,64,255,0.3)",
                                                    color: "#c040ff",
                                                }}
                                            >
                                                {match.gameType.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Footer scan line */}
                <div className="w-full h-px" style={{
                    background: "linear-gradient(90deg, transparent, #ff2d6e, transparent)"
                }} />
                <p className="text-[9px] font-mono text-center tracking-widest"
                    style={{ color: "rgba(255,255,255,0.2)" }}>
                    // CHAINPLAY · ON-CHAIN RECORD
                </p>
            </div>
        </div>
    );
}
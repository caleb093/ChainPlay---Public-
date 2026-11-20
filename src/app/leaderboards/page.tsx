"use client"

export const dynamic = "force-dynamic";

import HomeLayout from "@/components/layouts/home-layout";
import Loading from "@/components/seondary/Loading";
import { useGetWagerArcadeLeaderboardQuery } from "../../../api-feature/apiSlice";
import { IWagerLeaderboardPlayer } from "../../../api-feature/types";
import Image from "next/image";

const RANK_STYLES: Record<number, { color: string; glow: string; medal: string; rowBg: string; border: string }> = {
    1: { color: "#ffd700", glow: "0 0 14px rgba(255,215,0,0.6)",   medal: "🥇", rowBg: "rgba(255,215,0,0.05)",   border: "rgba(255,215,0,0.25)" },
    2: { color: "#c0c0c0", glow: "0 0 10px rgba(192,192,192,0.5)", medal: "🥈", rowBg: "rgba(192,192,192,0.04)", border: "rgba(192,192,192,0.2)" },
    3: { color: "#cd7f32", glow: "0 0 10px rgba(205,127,50,0.5)",  medal: "🥉", rowBg: "rgba(205,127,50,0.05)",  border: "rgba(205,127,50,0.2)" },
};

function PlayerAvatar({ player, size, borderColor }: { player: IWagerLeaderboardPlayer; size: number; borderColor: string }) {
    return player.avatar ? (
        <Image src={player.avatar} alt={player.username} width={size} height={size}
            className="rounded-full object-cover shrink-0"
            style={{ border: `1px solid ${borderColor}` }} />
    ) : (
        <div style={{
            width: size, height: size, borderRadius: "50%", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: size * 0.36, fontWeight: 900,
            background: "rgba(192,64,255,0.15)",
            border: `1px solid ${borderColor}`,
            color: borderColor,
        }}>
            {player.username?.slice(0, 1).toUpperCase()}
        </div>
    );
}

function PlayerRow({ player }: { player: IWagerLeaderboardPlayer }) {
    const isTop3 = player.rank <= 3;
    const s = isTop3 ? RANK_STYLES[player.rank] : null;

    const cardBase = {
        borderRadius: "0.4rem",
        background: isTop3 ? s!.rowBg : "rgba(255,255,255,0.02)",
        border: `1px solid ${isTop3 ? s!.border : "rgba(255,255,255,0.05)"}`,
        boxShadow: isTop3 ? s!.glow : "none",
        marginBottom: "6px",
    };

    const rankColor  = isTop3 ? s!.color : "rgba(255,255,255,0.25)";
    const rankGlow   = isTop3 ? s!.glow  : "none";
    const nameColor  = isTop3 ? s!.color : "#f1f5f9";
    const wonColor   = isTop3 ? s!.color : "#ffd700";
    const wonGlow    = isTop3 ? s!.glow  : "0 0 6px rgba(255,215,0,0.35)";
    const avBorder   = isTop3 ? s!.color : "rgba(255,255,255,0.1)";

    return (
        <div>
            {/* ── Mobile card (< sm) ── */}
            <div className="sm:hidden" style={{ ...cardBase, padding: "0.55rem 0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "1rem", fontWeight: 900, flexShrink: 0, width: "1.6rem",
                        color: rankColor, textShadow: rankGlow }}>
                        {isTop3 ? s!.medal : player.rank}
                    </span>
                    <PlayerAvatar player={player} size={26} borderColor={avBorder} />
                    <span style={{ flex: 1, fontSize: "0.82rem", fontWeight: 700, overflow: "hidden",
                        textOverflow: "ellipsis", whiteSpace: "nowrap", color: nameColor, textShadow: rankGlow }}>
                        {player.username}
                    </span>
                    <span style={{ fontSize: "0.8rem", fontWeight: 900, whiteSpace: "nowrap", flexShrink: 0,
                        color: wonColor, textShadow: wonGlow }}>
                        {player.totalWon.toLocaleString("en-US", { maximumFractionDigits: 1 })}
                        <span style={{ fontSize: "0.6rem", opacity: 0.6 }}> PLAY</span>
                    </span>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem",
                    paddingLeft: "3.1rem", fontSize: "0.68rem" }}>
                    <span style={{ color: "#00ffe1" }}>W {player.wins}</span>
                    <span style={{ color: "#ff2d6e" }}>L {player.losses}</span>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>{player.winRate.toFixed(0)}%</span>
                </div>
            </div>

            {/* ── Desktop row (≥ sm) ── */}
            <div className="hidden sm:grid" style={{
                ...cardBase, padding: "0.65rem 1rem", alignItems: "center",
                gridTemplateColumns: "2.5rem 1fr 4.5rem 4.5rem 5rem 7rem",
            }}>
                <span style={{ fontSize: "0.9rem", fontWeight: 900, color: rankColor, textShadow: rankGlow }}>
                    {isTop3 ? s!.medal : player.rank}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 0 }}>
                    <PlayerAvatar player={player} size={28} borderColor={avBorder} />
                    <span style={{ fontSize: "0.875rem", fontWeight: 700, overflow: "hidden",
                        textOverflow: "ellipsis", whiteSpace: "nowrap", color: nameColor, textShadow: rankGlow }}>
                        {player.username}
                    </span>
                </div>
                <span style={{ textAlign: "center", fontSize: "0.85rem", fontWeight: 700, color: "#00ffe1", textShadow: "0 0 6px rgba(0,255,225,0.4)" }}>
                    {player.wins}
                </span>
                <span style={{ textAlign: "center", fontSize: "0.85rem", fontWeight: 700, color: "#ff2d6e", textShadow: "0 0 6px rgba(255,45,110,0.3)" }}>
                    {player.losses}
                </span>
                <span style={{ textAlign: "right", fontSize: "0.82rem", color: "rgba(255,255,255,0.45)" }}>
                    {player.winRate.toFixed(1)}%
                </span>
                <span style={{ textAlign: "right", fontSize: "0.85rem", fontWeight: 900, whiteSpace: "nowrap",
                    color: wonColor, textShadow: wonGlow }}>
                    {player.totalWon.toLocaleString("en-US", { maximumFractionDigits: 1 })}
                    <span style={{ fontSize: "0.65rem", opacity: 0.6 }}> PLAY</span>
                </span>
            </div>
        </div>
    );
}

export default function LeaderboardsPage() {
    const { data, isLoading, isError } = useGetWagerArcadeLeaderboardQuery();
    const players = data?.data?.players ?? [];

    return (
        <HomeLayout>
            <div className="min-h-screen pt-20 sm:pt-24 pb-16 px-3 sm:px-4 text-[#a1a1aa] relative">
                <div className="fixed h-full inset-0 grid-bg opacity-20" />

                <div className="relative z-10 max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8 sm:mb-10">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 neon-purple">
                            Arcade Leaderboard
                        </h1>
                        <p style={{ color: "#00ffe1", fontSize: "0.85rem" }}>
                            Top players across all wager games · All time
                        </p>
                    </div>

                    {/* Top 3 podium */}
                    {!isLoading && !isError && players.length >= 3 && (
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end",
                            gap: "0.75rem", marginBottom: "2rem" }}>
                            {[players[1], players[0], players[2]].map((p, i) => {
                                const podiumRank = i === 0 ? 2 : i === 1 ? 1 : 3;
                                const s = RANK_STYLES[podiumRank];
                                const isFirst = podiumRank === 1;
                                const avSize = isFirst ? 52 : 40;
                                return (
                                    <div key={p.userId} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
                                        {p.avatar ? (
                                            <Image src={p.avatar} alt={p.username} width={avSize} height={avSize}
                                                className="rounded-full object-cover"
                                                style={{ border: `2px solid ${s.color}`, boxShadow: s.glow }} />
                                        ) : (
                                            <div style={{
                                                width: avSize, height: avSize, borderRadius: "50%",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontWeight: 900, fontSize: avSize * 0.38,
                                                background: "rgba(192,64,255,0.15)", border: `2px solid ${s.color}`,
                                                boxShadow: s.glow, color: s.color,
                                            }}>{p.username.slice(0, 1).toUpperCase()}</div>
                                        )}
                                        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: s.color,
                                            textShadow: s.glow, maxWidth: "70px", textAlign: "center",
                                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {p.username}
                                        </span>
                                        <div style={{
                                            width: "4.5rem", height: isFirst ? "6.5rem" : "5rem",
                                            background: `rgba(${podiumRank === 1 ? "255,215,0" : podiumRank === 2 ? "192,192,192" : "205,127,50"},0.08)`,
                                            border: `1px solid ${s.border}`, borderRadius: "0.4rem 0.4rem 0 0",
                                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem",
                                        }}>
                                            {s.medal}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Table */}
                    <div style={{
                        background: "rgba(255,255,255,0.01)",
                        border: "1px solid rgba(0,255,225,0.08)",
                        borderRadius: "0.75rem",
                        padding: "0.75rem",
                    }}>
                        {/* Desktop-only header */}
                        {players.length > 0 && (
                            <div className="hidden sm:grid my-3" style={{
                                gridTemplateColumns: "2.5rem 1fr 4.5rem 4.5rem 5rem 7rem",
                                padding: "0 1rem 0.5rem",
                                fontSize: "0.65rem", fontWeight: 900, letterSpacing: "0.12em",
                                textTransform: "uppercase", color: "rgba(255,255,255,0.35)",
                            }}>
                                <span>#</span>
                                <span>Player</span>
                                <span style={{ textAlign: "center" }}>W</span>
                                <span style={{ textAlign: "center" }}>L</span>
                                <span style={{ textAlign: "right" }}>Win%</span>
                                <span style={{ textAlign: "right" }}>Total Won</span>
                            </div>
                        )}

                        {isLoading && (
                            <div style={{ display: "flex", justifyContent: "center", padding: "3rem 0" }}>
                                <Loading small color="white" />
                            </div>
                        )}

                        {isError && !isLoading && (
                            <p style={{ textAlign: "center", color: "#ef4444", padding: "3rem 0", fontSize: "0.9rem" }}>
                                Failed to load leaderboard. Please try again.
                            </p>
                        )}

                        {!isLoading && !isError && players.length === 0 && (
                            <div style={{ textAlign: "center", padding: "3rem 0", color: "#334155" }}>
                                <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🏆</p>
                                <p style={{ fontSize: "0.9rem" }}>No entries yet — play a wager match to get on the board!</p>
                            </div>
                        )}

                        {!isLoading && !isError && players.length > 0 && (
                            <div style={{ maxHeight: "520px", overflowY: "auto",
                                scrollbarWidth: "thin", scrollbarColor: "rgba(0,255,225,0.2) transparent" }}>
                                {players.map((p) => <PlayerRow key={p.userId} player={p} />)}
                            </div>
                        )}
                    </div>

                    {players.length > 0 && (
                        <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.65rem",
                            letterSpacing: "0.15em", textTransform: "uppercase",
                            color: "rgba(255,255,255,0.15)", fontFamily: "monospace" }}>
                            // {data?.data?.count ?? 0} players · sorted by total won
                        </p>
                    )}
                </div>
            </div>
        </HomeLayout>
    );
}

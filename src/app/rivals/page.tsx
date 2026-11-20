"use client"

export const dynamic = "force-dynamic";

import { useState } from "react";
import HomeLayout from "@/components/layouts/home-layout";
import ProtectLayout from "@/components/layouts/protect-layout";
import Loading from "@/components/seondary/Loading";
import { useGetWagerRivalriesQuery } from "../../../api-feature/apiSlice";
import { IRivalryItem } from "../../../api-feature/types";
import Image from "next/image";
import { RIVALRY_TIER_META as TIER_META } from "../../util/rivalryTierMeta";

function getWinRate(record: { wins: number; losses: number; draws: number }, totalMatches: number) {
    if (totalMatches <= 0) return 0;
    return Math.round((record.wins / totalMatches) * 100);
}

function winRateColor(rate: number) {
    return rate >= 60 ? "#22c55e" : rate >= 40 ? "#eab308" : "#ef4444";
}

function RivalCard({ rival, onClick }: { rival: IRivalryItem; onClick: () => void }) {
    const meta = TIER_META[rival.tier] ?? TIER_META.rivals;
    const winRate = getWinRate(rival.record, rival.totalMatches);
    const wrColor = winRateColor(winRate);

    return (
        <button
            onClick={onClick}
            className="relative flex flex-col items-center text-center p-4 pt-9 rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:scale-[1.03] cursor-pointer w-full overflow-hidden"
            style={{
                border: `1px solid ${meta.color}40`,
                background: `linear-gradient(160deg, ${meta.color}14 0%, rgba(8,8,22,0.9) 55%)`,
                boxShadow: `0 4px 24px rgba(0,0,0,0.35), inset 0 0 24px ${meta.color}0a`,
            }}
        >
            {!rival.isActive && (
                <span className="absolute top-2 right-2 text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded text-slate-500 border border-slate-700">
                    Dormant
                </span>
            )}

            <span
                className="absolute top-2 left-2 text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded"
                style={{ background: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}44` }}
            >
                {meta.icon} {rival.tierLabel}
            </span>

            <div className="relative mb-3">
                <svg className="absolute -inset-1.5 -rotate-90" width={68} height={68} viewBox="0 0 68 68">
                    <circle cx="34" cy="34" r="30" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                    <circle
                        cx="34" cy="34" r="30" fill="none" stroke={wrColor} strokeWidth="3"
                        strokeDasharray={`${2 * Math.PI * 30}`}
                        strokeDashoffset={`${2 * Math.PI * 30 * (1 - winRate / 100)}`}
                        strokeLinecap="round"
                        style={{ filter: `drop-shadow(0 0 4px ${wrColor})`, transition: "stroke-dashoffset 0.4s ease" }}
                    />
                </svg>
                {rival.opponent.avatar ? (
                    <Image
                        src={rival.opponent.avatar}
                        alt={rival.opponent.username}
                        width={56}
                        height={56}
                        className="rounded-full object-cover relative"
                        style={{ border: `2px solid ${meta.color}88`, boxShadow: meta.glow }}
                    />
                ) : (
                    <div
                        className="w-14 h-14 rounded-full flex items-center justify-center font-black text-xl relative"
                        style={{ background: `${meta.color}12`, border: `2px solid ${meta.color}55`, color: meta.color }}
                    >
                        {rival.opponent.username.slice(0, 1).toUpperCase()}
                    </div>
                )}
            </div>

            <p className="text-sm font-bold text-white truncate w-full mb-1" style={{ textShadow: meta.glow }}>
                {rival.opponent.username}
            </p>

            <p className="text-[11px] font-black mb-2.5" style={{ color: wrColor }}>
                {winRate}% WIN RATE
            </p>

            <div className="flex items-center gap-2.5 text-[11px] font-black mb-2.5 px-2 py-1 rounded-lg bg-black/20">
                <span style={{ color: "#22c55e" }}>{rival.record.wins}W</span>
                <span className="text-slate-700">/</span>
                <span style={{ color: "#ef4444" }}>{rival.record.losses}L</span>
                {rival.record.draws > 0 && (
                    <>
                        <span className="text-slate-700">/</span>
                        <span style={{ color: "#94a3b8" }}>{rival.record.draws}D</span>
                    </>
                )}
            </div>

            <p className="text-[10px] text-slate-500 font-mono">
                {rival.totalMatches} matches · <span className="text-cyan-400">{rival.totalWagered}</span> PLAY wagered
            </p>
        </button>
    );
}

function RivalDetailModal({ rival, onClose }: { rival: IRivalryItem; onClose: () => void }) {
    const meta = TIER_META[rival.tier] ?? TIER_META.rivals;
    const short = (addr: string) => `${addr.slice(0, 5)}…${addr.slice(-5)}`;
    const winRate = getWinRate(rival.record, rival.totalMatches);
    const wrColor = winRateColor(winRate);
    const netAmount = rival.record.amountWon - rival.record.amountLost;
    const netColor = netAmount > 0 ? "#22c55e" : netAmount < 0 ? "#ef4444" : "#94a3b8";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-sm rounded-2xl p-6 text-center"
                style={{
                    background: "rgba(8,8,22,0.98)",
                    border: `1px solid ${meta.color}55`,
                    boxShadow: `0 0 40px ${meta.color}22`,
                }}
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-4 text-slate-500 hover:text-slate-300 text-lg leading-none"
                >✕</button>

                <div className="mb-4">
                    <span
                        className="text-xs font-black tracking-[0.2em] uppercase px-3 py-1 rounded-full"
                        style={{ background: `${meta.color}14`, color: meta.color, border: `1px solid ${meta.color}44`, textShadow: meta.glow }}
                    >
                        {meta.icon} {meta.label}
                    </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between">
                    <div className="flex flex-col items-center mb-5">
                        {rival.opponent.avatar ? (
                            <Image src={rival.opponent.avatar} alt={rival.opponent.username}
                                width={72} height={72} className="rounded-full object-cover mb-3"
                                style={{ border: `2px solid ${meta.color}`, boxShadow: meta.glow }} />
                        ) : (
                            <div className="rounded-full flex items-center justify-center font-black text-2xl mb-3"
                                style={{ width: 72, height: 72, background: `${meta.color}12`, border: `2px solid ${meta.color}`, color: meta.color, boxShadow: meta.glow }}>
                                {rival.opponent.username.slice(0, 1).toUpperCase()}
                            </div>
                        )}
                        <p className="text-lg font-black text-white" style={{ textShadow: meta.glow }}>{rival.opponent.username}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{short(rival.opponent.walletAddress)}</p>
                    </div>

                    <div className="flex w-full sm:hidden h-px mb-5" style={{ background: `linear-gradient(90deg, transparent, ${meta.color}44, transparent)` }} />
                    
                    <div>
                        <div className="mb-5">
                            <p className="text-3xl font-black" style={{ color: wrColor, textShadow: `0 0 12px ${wrColor}66` }}>
                                {winRate}%
                            </p>
                            <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-2">Win Rate</p>
                            <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden max-w-[14em] mx-auto">
                                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${winRate}%`, background: wrColor, boxShadow: `0 0 8px ${wrColor}` }} />
                            </div>
                        </div>
                        
                        <div className="flex justify-center gap-8 mb-5">
                            {[
                                { label: "Wins",   value: rival.record.wins,   color: "#22c55e" },
                                { label: "Losses", value: rival.record.losses, color: "#ef4444" },
                                { label: "Draws",  value: rival.record.draws,  color: "#94a3b8" },
                            ].map(({ label, value, color }) => (
                                <div key={label} className="text-center">
                                    <p className="text-2xl font-black" style={{ color, textShadow: `0 0 8px ${color}66` }}>{value}</p>
                                    <p className="text-[10px] uppercase tracking-wider text-slate-600">{label}</p>
                                </div>
                            ))}
                        </div>        
                    </div>
                </div>

                <div className="hidden sm:flex h-px mb-5" style={{ background: `linear-gradient(90deg, transparent, ${meta.color}44, transparent)` }} />
            
                <div className="space-y-2 text-sm">
                    {[
                        { label: "Total matches", value: `${rival.totalMatches}` },
                        { label: "Total wagered", value: `${rival.totalWagered} PLAY`, color: "#0ff" },
                        { label: "Amount won",    value: `+${rival.record.amountWon} PLAY`, color: "#22c55e" },
                        { label: "Amount lost",   value: `-${rival.record.amountLost} PLAY`, color: "#ef4444" },
                        { label: "Net result",    value: `${netAmount > 0 ? "+" : ""}${netAmount} PLAY`, color: netColor, bold: true },
                        // { label: "First match",   value: new Date(rival.firstMatchAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) },
                        // { label: "Last match",    value: new Date(rival.lastMatchAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) },
                    ].map(({ label, value, color, bold }) => (
                        <div key={label} className="flex justify-between items-center">
                            <span className="text-slate-500">{label}</span>
                            <span className={bold ? "font-black" : "font-semibold"} style={color ? { color } : { color: "#e2e8f0" } }>{value}</span>
                        </div>
                    ))}
                </div>

                {!rival.isActive && (
                    <p className="mt-4 text-[10px] uppercase tracking-widest text-slate-700">Dormant rivalry</p>
                )}
            </div>
        </div>
    );
}

export default function RivalsPage() {
    const { data, isLoading, isError } = useGetWagerRivalriesQuery();
    const [selected, setSelected] = useState<IRivalryItem | null>(null);
    const rivals = data?.rivalries ?? [];

    return (
        <HomeLayout>
            <ProtectLayout>
                <div className="min-h-screen pt-20 sm:pt-24 pb-16 px-3 sm:px-4 text-[#a1a1aa] relative">
                    <div className="fixed h-full inset-0 grid-bg opacity-20" />

                    <div className="relative z-10 max-w-4xl mx-auto">
                        <div className="text-center mb-8 sm:mb-10">
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2"
                                style={{ color: "#ff2d6e", textShadow: "0 0 18px rgba(255,45,110,0.8), 0 0 40px rgba(255,45,110,0.4)" }}>
                                Rivals
                            </h1>
                            <p className="text-red-500 text-[0.85rem]" >
                                Your fiercest head-to-head opponents across the arcade.
                            </p>
                        </div>

                        {isLoading && (
                            <div className="flex justify-center py-16">
                                <Loading small color="white" />
                            </div>
                        )}

                        {isError && !isLoading && (
                            <p className="text-center text-red-500 py-16 text-sm">
                                Failed to load rivals. Please try again.
                            </p>
                        )}

                        {!isLoading && !isError && rivals.length === 0 && (
                            <div className="text-center py-16 text-slate-600">
                                <p className="text-4xl mb-3">⚔️</p>
                                <p className="text-sm">No rivals yet — play more wager matches to forge rivalries.</p>
                            </div>
                        )}

                        {!isLoading && !isError && rivals.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {rivals.map((r, i) => (
                                    <RivalCard key={i} rival={r} onClick={() => setSelected(r)} />
                                ))}
                            </div>
                        )}

                        {/* {rivals.length > 0 && (
                            <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.65rem",
                                letterSpacing: "0.15em", textTransform: "uppercase",
                                color: "rgba(255,255,255,0.15)", fontFamily: "monospace" }}>
                                // {data?.count ?? 0} rivalries
                            </p>
                        )} */}
                    </div>
                </div>

                {selected && <RivalDetailModal rival={selected} onClose={() => setSelected(null)} />}
            </ProtectLayout>
        </HomeLayout>
    );
}

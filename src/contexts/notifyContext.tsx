"use client"
import {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import { io, Socket } from "socket.io-client"
import { globalState } from "../../api-feature/apiSlice"
import { appContext } from "./appContext"
import toast from "react-hot-toast"
import AchievementUnlockedPopup from "@/components/modals/achievement-unlocked-popup"
import Link from "next/link"
// import { ChallengeInvite } from "./socketContext"
import { ChallengeInvite } from "./rcpStakingContext"
import { RIVALRY_TIER_META } from "../util/rivalryTierMeta"
import { RivalryTier } from "../../api-feature/types"

// ── Types ─────────────────────────────────────────────────────────────

export interface AchievementItem {
    id: string
    name: string
    description: string
    unlocked: boolean
    unlockedAt: string | null
}

export interface StreakData {
    current: number
    longest: number
    lastPlayedDate: string | null
}

interface AchievementsResponse {
    streak: StreakData
    stats: {
        normalGamesPlayed: number
        wagerGamesPlayed: number
        totalWagerWins: number
        consecutiveWagerWins: number
        biggestWagerWinSOL: number
        totalXPEarned: number
    }
    achievements: AchievementItem[]
}

// ── Achievement image map ──────────────────────────────────────────────
// Maps API id → public image filename (handles typos in filenames)
const ACHIEVEMENT_IMAGE: Record<string, string> = {
    rookie:       "rookie.webp",
    on_a_roll:    "on_a_roll.webp",
    committed:    "commited.webp",   // typo in existing filename
    iron_will:    "iron_will.webp",
    touch_grass:  "touch_grass.webp",
    fifty_club:   "fifty_club.webp",
    centurion:    "centurion.webp",
    the_machine:  "the_machine.webp",
    baby_steps:   "baby_steps.webp",
    high_roller:  "high_roller.webp",
    degen:        "degen.webp",
    risk_taker:   "risk_taker.webp",
    untouchable:  "untouchable.webp",
    whale:        "whale.webp",
    scholar:      "scholar.webp",
    chain_player: "chainplayer.webp",
}

export const getAchievementImage = (id: string) =>
    `/achievements/${ACHIEVEMENT_IMAGE[id] ?? `${id}.webp`}`

// ── Context shape ──────────────────────────────────────────────────────

interface NotifyContextProps {
    achievements: AchievementItem[]
    streak: StreakData | null
    achievementsLoading: boolean
    // Unseen achievement indicator (cleared when user visits /profile)
    unseenAchievementsCount: number
    clearUnseenAchievements: () => void
    // Challenges received via /notify (parallel to socketContext)
    notifyInvites: ChallengeInvite[]
    removeNotifyInvite: (matchId: string) => void
    notifyChallengeDeclined: boolean
    setNotifyChallengeDeclined: Dispatch<SetStateAction<boolean>>
}

const notifyContext = createContext<NotifyContextProps>({
    achievements: [],
    streak: null,
    achievementsLoading: false,
    unseenAchievementsCount: 0,
    clearUnseenAchievements: () => {},
    notifyInvites: [],
    removeNotifyInvite: () => {},
    notifyChallengeDeclined: false,
    setNotifyChallengeDeclined: () => {},
})

// ── Rival toast ────────────────────────────────────────────────────────

interface RivalUnlockedPayload {
    tier: RivalryTier
    tierLabel: string
    totalMatches: number
    totalWagered: number
    opponent: { walletAddress: string; username: string }
    record: { wins: number; losses: number; draws: number }
}

function showRivalToast(data: RivalUnlockedPayload) {
    const meta  = RIVALRY_TIER_META[data.tier]
    const color = meta?.color ?? "#c040ff"
    const icon  = meta?.icon  ?? "⚔️"
    const opp   = data.opponent.username
        || `${data.opponent.walletAddress.slice(0, 4)}…${data.opponent.walletAddress.slice(-4)}`

    toast.custom(
        (t) => (
            <div
                style={{
                    background: "rgba(8,8,22,0.97)",
                    border: `1px solid ${color}`,
                    boxShadow: `0 0 18px ${color}55, inset 0 0 14px ${color}0d`,
                    borderRadius: "0.875rem",
                    padding: "14px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    minWidth: "260px",
                    maxWidth: "320px",
                    opacity: t.visible ? 1 : 0,
                    transition: "opacity 0.25s ease",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span style={{ fontSize: "0.65rem", fontWeight: 900, letterSpacing: "0.18em",
                        textTransform: "uppercase", color, textShadow: `0 0 8px ${color}` }}>
                        {icon} {data.tierLabel} Unlocked
                    </span>
                    <button onClick={() => toast.dismiss(t.id)}
                        style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: "0.75rem", padding: "0 2px", lineHeight: 1 }}>
                        ✕
                    </button>
                </div>

                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#f1f5f9" }}>
                    You &amp; {opp}
                </div>

                <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.75rem" }}>
                    <span style={{ color: "#22c55e" }}>W {data.record.wins}</span>
                    <span style={{ color: "#ef4444" }}>L {data.record.losses}</span>
                    <span style={{ color: "#94a3b8" }}>D {data.record.draws}</span>
                    <span style={{ color: "#475569" }}>· {data.totalMatches} matches</span>
                </div>

                <Link
                    href="/rivals"
                    onClick={() => toast.dismiss(t.id)}
                    style={{
                        display: "block", textAlign: "center", padding: "6px 0",
                        fontSize: "0.7rem", fontWeight: 900, letterSpacing: "0.15em",
                        textTransform: "uppercase", textDecoration: "none",
                        color, border: `1px solid ${color}88`,
                        borderRadius: "0.4rem", background: `${color}10`,
                        transition: "background 0.2s", marginTop: "2px",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = `${color}22`)}
                    onMouseLeave={e => (e.currentTarget.style.background = `${color}10`)}
                >
                    View Rivals →
                </Link>
            </div>
        ),
        { duration: 10_000, id: `rival-${data.tier}-${data.opponent.walletAddress}` }
    )
}

// ── Challenge toast ────────────────────────────────────────────────────
const GAME_META: Record<string, { label: string; icon: string; color: string; path: string }> = {
    maze: { label: "Maze",             icon: "🧩", color: "#00ffe1", path: "/games/maze" },
    rpc:  { label: "Rock Paper Scissors", icon: "⚔️", color: "#ff2d6e", path: "/games/rock-paper-scissors" },
}

function showChallengeToast(data: ChallengeInvite) {
    const meta = GAME_META[data.gameType ?? "rpc"] ?? GAME_META.rpc
    const challenger = data.challengerUsername
        || `${data.challengerAddress.slice(0, 4)}…${data.challengerAddress.slice(-4)}`

    toast.custom(
        (t) => (
            <div
                style={{
                    background: "rgba(8,8,22,0.97)",
                    border: `1px solid ${meta.color}`,
                    boxShadow: `0 0 18px ${meta.color}55, inset 0 0 14px ${meta.color}0d`,
                    borderRadius: "0.875rem",
                    padding: "14px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    minWidth: "260px",
                    maxWidth: "320px",
                    opacity: t.visible ? 1 : 0,
                    transition: "opacity 0.25s ease",
                }}
            >
                {/* Header row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <span style={{
                        fontSize: "0.65rem",
                        fontWeight: 900,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: meta.color,
                        textShadow: `0 0 8px ${meta.color}`,
                    }}>
                        {meta.icon} New {meta.label} Challenge
                    </span>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: "0.75rem", padding: "0 2px", lineHeight: 1 }}
                    >
                        ✕
                    </button>
                </div>

                {/* Challenger + stake */}
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#f1f5f9" }}>
                        {challenger}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#ffd700", fontWeight: 700 }}>
                        {data.stake} PLAY
                    </span>
                </div>

                {/* Go to game button */}
                <Link
                    href={meta.path}
                    onClick={() => {
                        sessionStorage.setItem("chainplay_openChallenges", data.gameType ?? "rpc")
                        toast.dismiss(t.id)
                    }}
                    style={{
                        display: "block",
                        textAlign: "center",
                        padding: "6px 0",
                        fontSize: "0.7rem",
                        fontWeight: 900,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        textDecoration: "none",
                        color: meta.color,
                        border: `1px solid ${meta.color}88`,
                        borderRadius: "0.4rem",
                        background: `${meta.color}10`,
                        transition: "background 0.2s",
                        marginTop: "2px",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = `${meta.color}22`)}
                    onMouseLeave={e => (e.currentTarget.style.background = `${meta.color}10`)}
                >
                    Go to game →
                </Link>
            </div>
        ),
        { duration: 10_000, id: `challenge-${data.matchId}` }
    )
}

// ── Provider ───────────────────────────────────────────────────────────

function NotifyProvider({ children }: { children: ReactNode }) {
    const url = process.env.NEXT_PUBLIC_API_BASE_URL
    const { signedIn } = useContext(appContext)

    const notifySocketRef = useRef<Socket | null>(null)

    const [achievements, setAchievements] = useState<AchievementItem[]>([])
    const [streak, setStreak] = useState<StreakData | null>(null)
    const [achievementsLoading, setAchievementsLoading] = useState(false)
    const [unseenAchievementsCount, setUnseenAchievementsCount] = useState(0)
    const [notifyInvites, setNotifyInvites] = useState<ChallengeInvite[]>([])
    const [notifyChallengeDeclined, setNotifyChallengeDeclined] = useState(false)

    // Queue of achievements to show in the popup (shown one at a time)
    const [popupQueue, setPopupQueue] = useState<AchievementItem[]>([])
    const [currentPopup, setCurrentPopup] = useState<AchievementItem | null>(null)

    // Advance the popup queue
    useEffect(() => {
        if (currentPopup || popupQueue.length === 0) return
        const [next, ...rest] = popupQueue
        setCurrentPopup(next)
        setPopupQueue(rest)
    }, [popupQueue, currentPopup])

    const dismissPopup = useCallback(() => setCurrentPopup(null), [])

    const clearUnseenAchievements = useCallback(() => setUnseenAchievementsCount(0), [])

    const removeNotifyInvite = useCallback((matchId: string) => {
        setNotifyInvites(prev => prev.filter(i => i.matchId !== matchId))
    }, [])

    // ── Fetch achievements ─────────────────────────────────────────────
    const fetchAchievements = useCallback(async () => {
        if (!globalState.authorizationToken) return
        setAchievementsLoading(true)
        try {
            const res = await fetch(`${url}/api/user/achievements`, {
                headers: { Authorization: `Bearer ${globalState.authorizationToken}` },
            })
            if (!res.ok) return
            const data: AchievementsResponse = await res.json()
            setAchievements(data.achievements ?? [])
            setStreak(data.streak ?? null)
        } catch (e) {
            console.error("Failed to fetch achievements", e)
        } finally {
            setAchievementsLoading(false)
        }
    }, [url])

    // ── /notify socket lifecycle ───────────────────────────────────────
    useEffect(() => {
        if (!signedIn || !globalState.authorizationToken) return

        // Fetch achievements on sign-in
        fetchAchievements()

        const socket = io(`${url}/notify`, {
            auth: { token: globalState.authorizationToken },
        })
        notifySocketRef.current = socket

        socket.on("connect_error", (err) => {
            console.error("[notify] connect error:", err.message)
        })

        socket.on("achievement_unlocked", (data: { achievements: AchievementItem[] }) => {
            if (!data?.achievements?.length) return
            setAchievements(prev =>
                prev.map(a => {
                    const unlocked = data.achievements.find(u => u.id === a.id)
                    return unlocked ? { ...a, unlocked: true, unlockedAt: unlocked.unlockedAt } : a
                })
            )
            setUnseenAchievementsCount(c => c + data.achievements.length)
            setPopupQueue(q => [...q, ...data.achievements])
        })
        
        return () => {
            socket.disconnect()
            notifySocketRef.current = null
        }
    }, [signedIn, url, fetchAchievements])

    const value = useMemo<NotifyContextProps>(() => ({
        achievements,
        streak,
        achievementsLoading,
        unseenAchievementsCount,
        clearUnseenAchievements,
        notifyInvites,
        removeNotifyInvite,
        notifyChallengeDeclined,
        setNotifyChallengeDeclined,
    }), [achievements, streak, achievementsLoading, unseenAchievementsCount, clearUnseenAchievements, notifyInvites, removeNotifyInvite, notifyChallengeDeclined])

    return (
        <notifyContext.Provider value={value}>
            {children}
            {currentPopup && (
                <AchievementUnlockedPopup
                    achievement={currentPopup}
                    onDismiss={dismissPopup}
                />
            )}
        </notifyContext.Provider>
    )
}

export { notifyContext, NotifyProvider }
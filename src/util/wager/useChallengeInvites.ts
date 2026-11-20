import { useCallback, useState } from "react"

/**
 * Shared challenge / invite state for the wager contexts.
 *
 * Generic over the invite shape so each game can keep its own invite type; only
 * `matchId` (for dedupe/removal) and `expiresAt` are required. The actual socket
 * listeners stay in each context (they carry the game-specific `gameType` filter)
 * and call into `addInvite` / `removeInvite` / `setChallengeDeclined` here.
 */
export function useChallengeInvites<T extends { matchId: string; expiresAt: number }>() {
    const [pendingInvites, setPendingInvites] = useState<T[]>([])
    const [challengeDeclined, setChallengeDeclined] = useState(false)
    const [isInviteMatch, setIsInviteMatch] = useState(false)
    const [inviteExpiresAt, setInviteExpiresAt] = useState<number | null>(null)

    const addInvite = useCallback((invite: T) => {
        setPendingInvites(prev =>
            prev.some(i => i.matchId === invite.matchId) ? prev : [...prev, invite]
        )
    }, [])

    const removeInvite = useCallback((matchId: string) => {
        setPendingInvites(prev => prev.filter(i => i.matchId !== matchId))
    }, [])

    const clearInvites = useCallback(() => {
        setPendingInvites([])
    }, [])

    // Resets the per-session invite flags without dropping pending invites —
    // mirrors what resetMatchSession did inline in both contexts.
    const resetInviteFlags = useCallback(() => {
        setChallengeDeclined(false)
        setIsInviteMatch(false)
        setInviteExpiresAt(null)
    }, [])

    return {
        pendingInvites,
        setPendingInvites,
        addInvite,
        removeInvite,
        clearInvites,
        resetInviteFlags,
        challengeDeclined,
        setChallengeDeclined,
        isInviteMatch,
        setIsInviteMatch,
        inviteExpiresAt,
        setInviteExpiresAt,
    }
}

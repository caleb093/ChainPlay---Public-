import { useCallback, useEffect, useRef, useState } from "react"
import type { RefObject } from "react"
import type { Socket } from "socket.io-client"
import toast from "react-hot-toast"
import { useLoading } from "@/util/hooks"

type VerifyResponse = { success: boolean; error?: string; message?: string }

type RecoveryOptions = {
    /** Toast shown while the 30s create-verify is in flight. */
    createToastMsg: string
    /** Toast shown while the cancel-verify is in flight. */
    cancelToastMsg: string
    /** Toast shown while a stuck-match recovery is in flight. */
    recoveringToastMsg: string
    createTimeoutMs?: number
    cancelTimeoutMs?: number
    joinAwaitMs?: number
}

/**
 * Shared recovery-timer machinery for the wager contexts.
 *
 * Encapsulates the create / cancel / join-await timers, their race-guard refs,
 * and the match-recovery loading toast — all of which were previously duplicated
 * verbatim across rpc and maze.
 *
 * Race guards: each `mark*` helper (called from the matching socket handler) sets
 * a flag so that a post-transaction `start*` call — which can run *after* the
 * socket event when the wallet SDK promise resolves late — becomes a no-op instead
 * of arming a stale timer that would fire a spurious `verify_*` against an
 * already-live/cancelled match.
 */
export function useRecoveryTimers(
    socketRef: RefObject<Socket | null>,
    opts: RecoveryOptions,
) {
    const {
        createToastMsg,
        cancelToastMsg,
        recoveringToastMsg,
        createTimeoutMs = 20 * 1000,
        cancelTimeoutMs = 20 * 1000,
        joinAwaitMs = 20 * 1000,
    } = opts

    const createRecoveryTimerRef = useRef<NodeJS.Timeout | null>(null)
    const cancelRecoveryTimerRef = useRef<NodeJS.Timeout | null>(null)
    const joinAwaitTimerRef = useRef<NodeJS.Timeout | null>(null)

    const matchAlreadyCreatedRef = useRef(false)
    const matchAlreadyReadyRef = useRef(false)
    const matchAlreadyCancelledRef = useRef(false)

    const { loading: matchRecoveryLoading, startLoading, stopLoading } = useLoading()
    const recoveryToastIdRef = useRef<string | null>(null)

    const [awaitingMatchStart, setAwaitingMatchStart] = useState(false)

    // ── Stuck-match recovery loading ────────────────────────────────────────
    const startMatchRecoveryLoading = useCallback(() => {
        startLoading()
        recoveryToastIdRef.current = toast.loading(recoveringToastMsg) as unknown as string
    }, [startLoading, recoveringToastMsg])

    const stopMatchRecoveryLoading = useCallback(() => {
        stopLoading()
        if (recoveryToastIdRef.current) {
            toast.dismiss(recoveryToastIdRef.current)
            recoveryToastIdRef.current = null
        }
    }, [stopLoading])

    // ── Join-await (overlay + stuck-match recovery for the joining player) ──
    const stopJoinMatchAwait = useCallback(() => {
        if (joinAwaitTimerRef.current) {
            stopMatchRecoveryLoading()
            clearTimeout(joinAwaitTimerRef.current)
            joinAwaitTimerRef.current = null
        }
        setAwaitingMatchStart(false)
    }, [stopMatchRecoveryLoading])

    const startJoinMatchAwait = useCallback((invite?: boolean) => {
        if (matchAlreadyReadyRef.current) {
            matchAlreadyReadyRef.current = false
            return
        }
        if (invite) setAwaitingMatchStart(true)
        if (joinAwaitTimerRef.current) clearTimeout(joinAwaitTimerRef.current)
        joinAwaitTimerRef.current = setTimeout(() => {
            const socket = socketRef.current
            if (!socket?.connected) return
            startMatchRecoveryLoading()
            socket.emit("recover_stuck_match")
        }, joinAwaitMs)
    }, [socketRef, joinAwaitMs, startMatchRecoveryLoading])

    // ── Create recovery ─────────────────────────────────────────────────────
    const stopCreateRecoveryTimer = useCallback(() => {
        if (createRecoveryTimerRef.current) {
            clearTimeout(createRecoveryTimerRef.current)
            createRecoveryTimerRef.current = null
        }
    }, [])

    const startCreateRecoveryTimer = useCallback((txSignature: string, matchId: string) => {
        if (matchAlreadyCreatedRef.current) {
            matchAlreadyCreatedRef.current = false
            return
        }
        if (createRecoveryTimerRef.current) clearTimeout(createRecoveryTimerRef.current)
        createRecoveryTimerRef.current = setTimeout(() => {
            const socket = socketRef.current
            if (!socket?.connected) return
            const toastId = toast.loading(createToastMsg)
            socket.emit("verify_create_match", { txSignature, matchId }, (res: VerifyResponse) => {
                toast.dismiss(toastId)
                if (!res.success) {
                    toast.error(res.message ?? res.error ?? "Match creation could not be verified")
                }
            })
        }, createTimeoutMs)
    }, [socketRef, createToastMsg, createTimeoutMs])

    // ── Cancel recovery ─────────────────────────────────────────────────────
    const stopCancelRecoveryTimer = useCallback(() => {
        if (cancelRecoveryTimerRef.current) {
            clearTimeout(cancelRecoveryTimerRef.current)
            cancelRecoveryTimerRef.current = null
        }
    }, [])

    const startCancelRecoveryTimer = useCallback((txSignature: string, matchId: string) => {
        if (matchAlreadyCancelledRef.current) {
            matchAlreadyCancelledRef.current = false
            return
        }
        if (cancelRecoveryTimerRef.current) clearTimeout(cancelRecoveryTimerRef.current)
        cancelRecoveryTimerRef.current = setTimeout(() => {
            const socket = socketRef.current
            if (!socket?.connected) return
            const toastId = toast.loading(cancelToastMsg)
            socket.emit("verify_cancel_match", { txSignature, matchId }, (res: VerifyResponse) => {
                toast.dismiss(toastId)
                if (!res.success) {
                    toast.error(res.message ?? res.error ?? "Match cancellation could not be verified")
                }
            })
        }, cancelTimeoutMs)
    }, [socketRef, cancelToastMsg, cancelTimeoutMs])

    // ── Semantic guards for socket handlers ─────────────────────────────────
    const markCreated = useCallback(() => {
        matchAlreadyCreatedRef.current = true
        matchAlreadyReadyRef.current = false
        matchAlreadyCancelledRef.current = false
        stopCreateRecoveryTimer()
    }, [stopCreateRecoveryTimer])

    const markReady = useCallback(() => {
        matchAlreadyReadyRef.current = true
        matchAlreadyCreatedRef.current = false
        matchAlreadyCancelledRef.current = false
        stopCreateRecoveryTimer()
        stopJoinMatchAwait()
    }, [stopCreateRecoveryTimer, stopJoinMatchAwait])

    const markCancelled = useCallback(() => {
        matchAlreadyCancelledRef.current = true
        // The match session is over — clear create/ready guards so the next
        // match creation doesn't see a stale true from this session.
        matchAlreadyCreatedRef.current = false
        matchAlreadyReadyRef.current = false
        stopCancelRecoveryTimer()
        stopJoinMatchAwait()
    }, [stopCancelRecoveryTimer, stopJoinMatchAwait])

    // Clears every timer + guard and the join-await overlay. Used by resetMatchSession.
    const resetRecovery = useCallback(() => {
        stopCreateRecoveryTimer()
        stopCancelRecoveryTimer()
        matchAlreadyCreatedRef.current = false
        matchAlreadyReadyRef.current = false
        matchAlreadyCancelledRef.current = false
        stopJoinMatchAwait()
    }, [stopCreateRecoveryTimer, stopCancelRecoveryTimer, stopJoinMatchAwait])

    // Unmount safety net — clear any pending timers.
    useEffect(() => {
        return () => {
            if (createRecoveryTimerRef.current) clearTimeout(createRecoveryTimerRef.current)
            if (cancelRecoveryTimerRef.current) clearTimeout(cancelRecoveryTimerRef.current)
            if (joinAwaitTimerRef.current) clearTimeout(joinAwaitTimerRef.current)
        }
    }, [])

    return {
        matchRecoveryLoading,
        awaitingMatchStart,
        startMatchRecoveryLoading,
        stopMatchRecoveryLoading,
        startCreateRecoveryTimer,
        stopCreateRecoveryTimer,
        startCancelRecoveryTimer,
        stopCancelRecoveryTimer,
        startJoinMatchAwait,
        stopJoinMatchAwait,
        markCreated,
        markReady,
        markCancelled,
        resetRecovery,
    }
}

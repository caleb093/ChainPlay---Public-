"use client"
import {
    createContext,
    Dispatch,
    ReactNode,
    RefObject,
    SetStateAction,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";
import { globalState } from "../../api-feature/apiSlice";
import { appContext } from "./appContext";
import { useLoading } from "@/util/hooks";
import { startCountdown, stopCountdown } from "@/util/countdown";
import SettlementToast, { SettlementStatus } from "@/components/settlement-toast";
import NetworkContext from "./networkProvider";
import LoadingOverlay from "@/components/seondary/loadingoverlay";
import ActiveMatchWarning from "@/components/modals/active-match-warning";
import { socketMethods } from "@/util/useSocket";
import { solanaProgramContext } from "@/contexts/anchorProvider";
import { useRecoveryTimers } from "@/util/wager/useRecoveryTimers";
import { useChallengeInvites } from "@/util/wager/useChallengeInvites";
import { useSocketPing } from "@/util/wager/useSocketPing";
import { RivalryTier } from "../../api-feature/types";

// ── Types ──────────────────────────────────────────────────────────────
export type Coord = { x: number; y: number };

type MatchFilters = { gameMode?: 1, minStake?: number, maxStake?: number }

export type MazeCell = { n: boolean; s: boolean; e: boolean; w: boolean };

export type MazePlayer = {
    address: string;
    username?: string;
    position: Coord;
    moveCount?: number;
    finishedAt?: number | null;
};

export type MazeData = {
    difficulty: number;
    grid: MazeCell[][];
    startCoord: Coord;
    endCoord: Coord;
};

export type MazeMatchStatus = "open" | "locking" | "active" | "complete" | "cancelled";

export type MAZE_MATCH_TYPE = {
    matchId: string;
    amount?: number;
    stake?: number;
    gameMode?: 1;
    player1?: MazePlayer;
    player2?: MazePlayer;
    maze?: MazeData | null;
    matchEndsAt?: number;
    status?: MazeMatchStatus;
    isRivalMatch?: boolean;
    rivalTier?: RivalryTier | null;
};

export type MazeMatchListed = {
    matchId: string;
    stake: number;
    player1: string;
    username?: string;
    gameMode: 1;
};

type MazeChallengeInvite = {
    matchId: string;
    challengerAddress: string;
    challengerUsername: string;
    stake: number;
    gameMode: 1;
    expiresAt: number;
    gameType?: "rpc" | "maze";
};

export type MazeMatchCompleted = {
    reason: "normal" | "disconnect_timeout" | "timeout_no_winner";
    winner: string | null;
    player1: MazePlayer;
    player2: MazePlayer;
};

export type MazeDir = "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight";

export type MazeModalSection = "home" | "create" | "join" | "waiting";

export type RematchPrefill = {
    amount: number;
    opponentAddress: string;
    opponentUsername: string;
};

export type MazeModalRefTypes = {
    changeSection: (s: MazeModalSection) => void;
    matchCreated: (data: MAZE_MATCH_TYPE) => void;
    matchCancelled: () => void;
    matchReady: () => void;
    rematch: (data: RematchPrefill) => void;
};

export type MazeMoveResult = {
    success: boolean;
    position?: Coord;
    moveCount?: number;
    error?: string;
    throttled?: boolean;
};

// ── Context shape ──────────────────────────────────────────────────────
interface contextProps {
    socketConnLoading: boolean;
    socket: RefObject<Socket | null>;

    // Match state
    matchStatus: MazeMatchStatus;
    matchDetails: MAZE_MATCH_TYPE | null;
    setMatchDetails: Dispatch<SetStateAction<MAZE_MATCH_TYPE | null>>;
    matchCompleted: MazeMatchCompleted | null;
    setMatchCompleted: Dispatch<SetStateAction<MazeMatchCompleted | null>>;

    // PvP gameplay flag
    isPvP: boolean;
    setIsPvP: Dispatch<SetStateAction<boolean>>;

    // Modal
    modalOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    MazeModalRef: RefObject<MazeModalRefTypes | null>;

    // Lobby
    matchList: MazeMatchListed[];
    fetchAvailableMatches: () => void;

    // Invites / challenges
    pendingInvites: MazeChallengeInvite[];
    removeInvite: (matchId: string) => void;
    challengeDeclined: boolean;
    setChallengeDeclined: Dispatch<SetStateAction<boolean>>;
    isInviteMatch: boolean;
    setIsInviteMatch: Dispatch<SetStateAction<boolean>>;
    inviteExpiresAt: number | null;
    setInviteExpiresAt: Dispatch<SetStateAction<number | null>>;

    // Disconnect overlay
    opponentDisconnect: { wallet: string; endsAt: number } | null;
    setOpponentDisconnect: Dispatch<SetStateAction<{ wallet: string; endsAt: number } | null>>;
    disconnectCountdown: number;

    // Match timer (7-min total)
    matchCountdown: number;
    matchIntervalRef: RefObject<NodeJS.Timeout | null>;

    // Recovery
    matchRecoveryLoading: boolean;
    startMatchRecoveryLoading: () => void;
    startCreateRecoveryTimer: (txSignature: string, matchId: string) => void;
    stopCreateRecoveryTimer: () => void;
    startCancelRecoveryTimer: (txSignature: string, matchId: string) => void;
    awaitingMatchStart: boolean;
    startJoinMatchAwait: (invite?: boolean) => void;
    stopJoinMatchAwait: () => void;

    // Emits
    sendMove: (dir: MazeDir) => Promise<MazeMoveResult>;
    // declineChallenge: (matchId: string) => void;
    // recoverStuckMatch: () => void;

    resetMatchSession: () => void;
}

const dummySocketRef: RefObject<Socket | null> = { current: null };

const mazeWagerContext = createContext<contextProps>({
    socketConnLoading: false,
    socket: dummySocketRef,
    matchStatus: "" as MazeMatchStatus,
    matchDetails: null,
    setMatchDetails: () => {},
    matchCompleted: null,
    setMatchCompleted: () => {},
    isPvP: false,
    setIsPvP: () => {},
    modalOpen: false,
    openModal: () => {},
    closeModal: () => {},
    MazeModalRef: { current: null },
    matchList: [],
    fetchAvailableMatches: () => {},
    pendingInvites: [],
    removeInvite: () => {},
    challengeDeclined: false,
    setChallengeDeclined: () => {},
    isInviteMatch: false,
    setIsInviteMatch: () => {},
    inviteExpiresAt: null,
    setInviteExpiresAt: () => {},
    opponentDisconnect: null,
    setOpponentDisconnect: () => {},
    disconnectCountdown: 0,
    matchCountdown: 0,
    matchIntervalRef: { current: null },
    matchRecoveryLoading: false,
    startMatchRecoveryLoading: () => {},
    startCreateRecoveryTimer: () => {},
    stopCreateRecoveryTimer: () => {},
    startCancelRecoveryTimer: () => {},
    awaitingMatchStart: false,
    startJoinMatchAwait: () => {},
    stopJoinMatchAwait: () => {},
    sendMove: async () => ({ success: false }),
    // declineChallenge: () => {},
    // recoverStuckMatch: () => {},
    resetMatchSession: () => {},
});

function MazeWagerContextProvider({ children }: { children: ReactNode }) {
    const url = process.env.NEXT_PUBLIC_API_BASE_URL;
    const { walletAddress, isGuest, isArcadeLive } = useContext(appContext);
    const { setPlayBalance } = useContext(solanaProgramContext);

    const { loading: socketConnLoading, startLoading: startLoadSocketConn, stopLoading: stopLoadSocketConn } = useLoading();

    const socketRef = useRef<Socket | null>(null);
    const MazeModalRef = useRef<MazeModalRefTypes | null>(null);

    const [matchStatus, setMatchStatus] = useState<MazeMatchStatus>("" as MazeMatchStatus);
    const [matchDetails, setMatchDetails] = useState<MAZE_MATCH_TYPE | null>(null);
    const [matchCompleted, setMatchCompleted] = useState<MazeMatchCompleted | null>(null);
    const [isPvP, setIsPvP] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const openModal = useCallback(() => setModalOpen(true), []);
    const closeModal = useCallback(() => setModalOpen(false), []);

    const [matchList, setMatchList] = useState<MazeMatchListed[]>([]);

    // Challenge / invite state (shared across wager games)
    const {
        pendingInvites, addInvite, removeInvite,
        challengeDeclined, setChallengeDeclined,
        isInviteMatch, setIsInviteMatch,
        inviteExpiresAt, setInviteExpiresAt,
        resetInviteFlags,
    } = useChallengeInvites<MazeChallengeInvite>()

    const [opponentDisconnect, setOpponentDisconnect] = useState<{ wallet: string; endsAt: number } | null>(null);
    const [disconnectCountdown, setDisconnectCountdown] = useState(0);
    const disconnectIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const {getAvailableMatches} = socketMethods()

    const [matchCountdown, setMatchCountdown] = useState(0);
    const matchIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const [settlementData, setSettlementData] = useState<SettlementStatus | null>(null);
    const [activeMatchWarning, setActiveMatchWarning] = useState<string | null>(null);

    // Ping / connection quality (shared across wager games)
    const { ping, connectionQuality, registerPing } = useSocketPing()

    // Recovery timers + match-recovery loading + join-await (shared across wager games)
    const {
        matchRecoveryLoading, awaitingMatchStart,
        startMatchRecoveryLoading, stopMatchRecoveryLoading,
        startCreateRecoveryTimer, stopCreateRecoveryTimer, startCancelRecoveryTimer,
        startJoinMatchAwait, stopJoinMatchAwait,
        markCreated, markReady, markCancelled, resetRecovery,
    } = useRecoveryTimers(socketRef, {
        createToastMsg: "Match Create taking too long, syncing server…",
        cancelToastMsg: "Match Cancel taking too long, confirming cancellation…",
        recoveringToastMsg: "Already in a match. Recovering..",
    })

    // Resolve the latest walletAddress without re-running the socket setup
    const walletAddressRef = useRef<string | undefined>(walletAddress);
    useEffect(() => { walletAddressRef.current = walletAddress; }, [walletAddress]);

    // Refers to the current matchId without re-creating sendMove on every match change
    const matchIdRef = useRef<string | null>(null);
    useEffect(() => { matchIdRef.current = matchDetails?.matchId ?? null; }, [matchDetails?.matchId]);

    // Track stake so the socket handler (closed over once) can read the latest value
    const matchStakeRef = useRef<number>(0);
    useEffect(() => { matchStakeRef.current = matchDetails?.stake ?? 0; }, [matchDetails?.stake]);
    console.log(matchDetails)
        
    const sendMove = useCallback((dir: MazeDir): Promise<MazeMoveResult> => {
        return new Promise((resolve) => {
            const socket = socketRef.current;
            const matchId = matchIdRef.current;
            if (!socket || !matchId) {
                resolve({ success: false, error: "NO_MATCH" });
                return;
            }

            socket.emit("maze_move", { matchId, dir }, (res: MazeMoveResult | undefined) => {
                resolve(res ?? { success: false, error: "NO_ACK" });
            });
        });
    }, []);

    const fetchAvailableMatches = useCallback((filters?: MatchFilters) => {
        const socket = socketRef.current;
        if (!socket) return;

        getAvailableMatches(socket, "maze", filters, (data) => {
            setMatchList(data ?? [])
        })
        // socket.off("available_matches");
        // socket.once("available_matches", (data: MazeMatchListed[]) => {
        //     setMatchList(data ?? []);
        // });
        // socket.emit("maze_get_available_matches", {});
    }, []);

    const resetMatchSession = useCallback(() => {
        resetRecovery();
        MazeModalRef.current?.changeSection("home");
        setMatchDetails(null);
        setMatchCompleted(null);
        setMatchStatus("" as MazeMatchStatus);
        setSettlementData(null);
        setIsPvP(false);
        resetInviteFlags();
        setOpponentDisconnect(null);
        setDisconnectCountdown(0);
        stopCountdown(disconnectIntervalRef);
        setMatchCountdown(0);
        stopCountdown(matchIntervalRef);
    }, [resetRecovery, resetInviteFlags]);

    // ── Socket setup ────────────────────────────────────────────────────
    useEffect(() => {
        if (isGuest || !isArcadeLive) return;

        startLoadSocketConn();

        const socket = io(url, { auth: { token: globalState.authorizationToken } });
        socketRef.current = socket;

        socket.on("connect_error", (err) => {
            stopLoadSocketConn();
            toast.error(err?.message ?? "Error connecting to socket");
            console.error("Socket auth failed:", err.message);
        });

        socket.on("connect", () => {
            stopLoadSocketConn();
            socketRef.current = socket;
        });

        const cleanupPing = registerPing(socket)

        // ── Match lifecycle ─────────────────────────────────────────────
        socket.on("match_created", (data: any) => {
            markCreated()
            const enriched: MAZE_MATCH_TYPE = {
                matchId: data.matchId ?? data.id,
                amount: data.amount ?? data.stake,
                stake: data.stake ?? data.amount,
                gameMode: 1,
                player1: data.player1,
                player2: data.player2,
                status: "open",
            };
            setMatchDetails(enriched);
            setMatchStatus("open");
            MazeModalRef.current?.matchCreated(enriched);
        });

        socket.on("match_locking", () => {
            setMatchStatus("locking");
        });


        // ── Lobby ────────────────────────────────────────────────────────
        socket.on("match_listed", (m: MazeMatchListed) => {
            setMatchList(prev => prev.some(x => x.matchId === m.matchId) ? prev : [...prev, m]);
        });
        socket.on("match_unlisted", ({ matchId }: { matchId: string }) => {
            setMatchList(prev => prev.filter(m => m.matchId !== matchId));
        });

        // ── Gameplay ─────────────────────────────────────────────────────
        socket.on("maze_position_update", (data: { matchId: string; address: string; position: Coord; moveCount: number }) => {
            console.log("RECEIVED MOVEMENT UPDATE")
            console.log(data)
            setMatchDetails(prev => {
                if (!prev || prev.matchId !== data.matchId) return prev;
                const updated: MAZE_MATCH_TYPE = { ...prev };
                if (updated.player1?.address === data.address) {
                    updated.player1 = { ...updated.player1, position: data.position, moveCount: data.moveCount };
                } else if (updated.player2?.address === data.address) {
                    updated.player2 = { ...updated.player2, position: data.position, moveCount: data.moveCount };
                }
                return updated;
            });
        });

        socket.on("match_completed", (data: MazeMatchCompleted) => {
            if (!data?.reason) return;
            setMatchStatus("complete");
            setMatchCompleted({
                reason: data.reason,
                winner: data.winner ?? null,
                player1: data.player1,
                player2: data.player2,
            });
            stopCountdown(matchIntervalRef);

            // ── Optimistic local balance update ────────────────────────────
            // Local playBalance is stale (pre-match); on-chain already locked stake.
            //   Winner  → net delta = +stake × 0.95  (receives stake×1.95 from escrow, paid stake×1 before)
            //   Loser   → net delta = −stake
            //   timeout_no_winner → both stakes refunded; no local adjustment needed
            if (data.reason !== "timeout_no_winner" && data.winner !== null) {
                const stake = matchStakeRef.current;
                const userWon = data.winner === walletAddressRef.current;
                if (userWon) {
                    setPlayBalance(prev => (prev ?? 0) + stake * 0.95);
                } else {
                    setPlayBalance(prev => (prev ?? 0) - stake);
                }
            }
        });

        socket.on("resume_match", (data: MAZE_MATCH_TYPE & {gameType: "rpc" | "maze"}) => {
            
            if (data.gameType === "maze") {
                setMatchDetails(data)
                // setMatchDetails(prev => {
                //     // Socket auto-reconnect (context never unmounted): if the resume
                //     // payload omits the full grid but we still hold it for the same
                //     // match, keep the known maze so the canvas can rebuild.
                //     const incomingHasGrid = Array.isArray(m.maze?.grid) && m.maze!.grid.length > 0;
                //     if (!incomingHasGrid && prev?.matchId === m.matchId && (prev.maze?.grid?.length ?? 0) > 0) {
                //         return { ...m, maze: prev.maze };
                //     }
                //     return m;
                // });
                if (data.status === "active" && data.matchEndsAt) {
                    stopJoinMatchAwait();
                    setMatchStatus("active");
                    setMatchCompleted(null);
                    setOpponentDisconnect(null);
                    setIsPvP(true);
                    startCountdown({ setState: setMatchCountdown, intervalRef: matchIntervalRef, endsAt: data.matchEndsAt });
                    setModalOpen(false);
                } else if (data.status === "open" || data.status === "locking") {
                    setMatchStatus(data.status);
                    setModalOpen(true);
                    MazeModalRef.current?.changeSection("waiting");
                }
            } else {
                setActiveMatchWarning(data.gameType)
            }
        });

        // ── Invites / challenges ────────────────────────────────────────
        socket.on("challenge_received", (data: MazeChallengeInvite) => {
            if (data.gameType && data.gameType !== "maze") return;
            addInvite(data);
            // toast("New maze challenge received!", { icon: "🧩" });
        });
        socket.on("challenge_declined", () => {
            setChallengeDeclined(true);
            toast.error("Your challenge was declined");
        });

        socket.on("challenge_cancelled", (data: MazeChallengeInvite) => {
            if (data.gameType && data.gameType !== "maze") return
            removeInvite(data.matchId)
            toast("Opponent cancelled challenge ")
        })

        // ── Disconnect ──────────────────────────────────────────────────
        socket.on("player_disconnected", ({ wallet, endsAt }: { wallet: string; endsAt: number }) => {
            if (wallet === walletAddressRef.current) return; // self disconnect — ignore in overlay
            setOpponentDisconnect({ wallet, endsAt });
            startCountdown({ setState: setDisconnectCountdown, intervalRef: disconnectIntervalRef, endsAt });
        });
        socket.on("player_reconnected", () => {
            setOpponentDisconnect(null);
            stopCountdown(disconnectIntervalRef);
            setDisconnectCountdown(0);
        });

        // ── Settlement ──────────────────────────────────────────────────
        socket.on("settlement_status", (data: SettlementStatus) => {
            setSettlementData(data);
        });

        // ── Recovery / errors ───────────────────────────────────────────
        socket.on("recovery_result", ({ status }: { status: string }) => {
            stopMatchRecoveryLoading();
            if (status !== "recovered") {
                stopJoinMatchAwait();
            }
            switch (status) {
                case "no_stuck_match":
                    toast("No stuck match found.");
                    break;
                case "recovered":
                    toast.success("Match recovered");
                    break;
                case "error":
                    toast.error("Recovery failed");
                    break;
            }
        });

        socket.on("match_error", ({ message }: { code: string; message: string }) => {
            toast.error(message ?? "Match error");
        });

        return () => {
            cleanupPing();
            socket.disconnect();
        };
    }, [url, isGuest, isArcadeLive]);

    const value = useMemo<contextProps>(() => ({
        socketConnLoading,
        socket: socketRef,
        matchStatus,
        matchDetails,
        setMatchDetails,
        matchCompleted,
        setMatchCompleted,
        isPvP,
        setIsPvP,
        modalOpen,
        openModal,
        closeModal,
        MazeModalRef,
        matchList,
        fetchAvailableMatches,
        pendingInvites,
        removeInvite,
        challengeDeclined,
        setChallengeDeclined,
        isInviteMatch,
        setIsInviteMatch,
        inviteExpiresAt,
        setInviteExpiresAt,
        opponentDisconnect,
        setOpponentDisconnect,
        disconnectCountdown,
        matchCountdown,
        matchIntervalRef,
        matchRecoveryLoading,
        startMatchRecoveryLoading,
        startCreateRecoveryTimer,
        stopCreateRecoveryTimer,
        startCancelRecoveryTimer,
        awaitingMatchStart,
        startJoinMatchAwait,
        stopJoinMatchAwait,
        sendMove,
        // declineChallenge,
        // recoverStuckMatch,
        resetMatchSession,
    }), [
        socketConnLoading, matchStatus, matchDetails, matchCompleted, isPvP,
        modalOpen, openModal, closeModal, matchList, fetchAvailableMatches,
        pendingInvites, removeInvite, challengeDeclined, isInviteMatch, inviteExpiresAt,
        opponentDisconnect, disconnectCountdown, matchCountdown, matchRecoveryLoading,
        startMatchRecoveryLoading, startCreateRecoveryTimer, stopCreateRecoveryTimer, startCancelRecoveryTimer,
        awaitingMatchStart, startJoinMatchAwait, stopJoinMatchAwait,
        sendMove, resetMatchSession,
    ]);

    const networkValue = useMemo(() => ({ ping, connectionQuality }), [ping, connectionQuality]);

    return (
        <NetworkContext.Provider value={networkValue}>
            <mazeWagerContext.Provider value={value}>
                {awaitingMatchStart && <LoadingOverlay />}
                {children}
                <SettlementToast data={settlementData} />
                {activeMatchWarning && (
                    <ActiveMatchWarning
                        gameType={activeMatchWarning}
                        onClose={() => setActiveMatchWarning(null)}
                    />
                )}
            </mazeWagerContext.Provider>
        </NetworkContext.Provider>
    );
}

export { MazeWagerContextProvider, mazeWagerContext };

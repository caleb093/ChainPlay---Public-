"use client"
import { createContext, Dispatch, ReactNode, RefObject, SetStateAction, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import SettlementToast, { SettlementStatus } from "@/components/settlement-toast";
import { io, Socket } from "socket.io-client";                  
import { DefaultEventsMap } from "@socket.io/component-emitter";
import { getRcpGameMode } from "@/util/helperFunctions";
import useModal from "@/util/useModal";
import { useLoading } from "@/util/hooks";
import toast from "react-hot-toast";
import { globalState } from "../../api-feature/apiSlice";
import { appContext } from "./appContext";
import { rpc_stake_modal_type, RpcModalRefTypes } from "@/components/Games/rpc/modals/rpc-wager";
import { startCountdown, stopCountdown } from "@/util/countdown";
import { PvPStakeRefTypes } from "@/components/Games/rpc/pvp-wager";
import { solanaProgramContext } from "./anchorProvider";
import NetworkContext from "./networkProvider";
import ActiveMatchWarning from "@/components/modals/active-match-warning";
import LoadingOverlay from "@/components/seondary/loadingoverlay";
import { useRecoveryTimers } from "@/util/wager/useRecoveryTimers";
import { useChallengeInvites } from "@/util/wager/useChallengeInvites";
import { useSocketPing } from "@/util/wager/useSocketPing";
import { RivalryTier } from "../../api-feature/types";

interface contextProps {
    socketConnLoading: boolean,
    staking: RPC_STAKE_TYPE,
    setStaking: Dispatch<SetStateAction<RPC_STAKE_TYPE>>,
    socket: RefObject<Socket<DefaultEventsMap, DefaultEventsMap> | null>,
    GAME_MODE: "1 of 1" | "Best of 3" | "Best of 5" | undefined,
    resetStaking: () => void,
    pvpMatchDetails: PvP_MATCH_TYPE,
    setPvpMatchDetails: Dispatch<SetStateAction<PvP_MATCH_TYPE>>,
    matchStatus: MATCHSTATUS,
    modalOpen: boolean,
    closeModal: () => void,
    openModal: () => void,
    activeMatchDetails: ACTIVE_MATCH_TYPE,
    setActiveMatchDetails: Dispatch<SetStateAction<ACTIVE_MATCH_TYPE>>,
    resetActiveMatch: () => void,
    gameScreen: boolean,
    toggleGameScreen: (value: boolean) => void,
    updatePlayerWins: () => void,
    RpcModalRef: RefObject<null | RpcModalRefTypes>,
    reconnectCountdown: number,
    setReconnectCountdown: Dispatch<SetStateAction<number>>,
    gameRoundCountdown: number,
    setGameRoundCountdown: Dispatch<SetStateAction<number>>,
    reconnectIntervalRef:  RefObject<NodeJS.Timeout | null>,
    gameRoundIntervalRef: RefObject<NodeJS.Timeout | null>,
    opponentLocked: boolean,
    userLocked: boolean,
    opponentDisconnected: boolean,
    // setOpponentDisconnected: Dispatch<SetStateAction<boolean>>, 
    setOpponentLocked: Dispatch<SetStateAction<boolean>>,
    setUserLocked: Dispatch<SetStateAction<boolean>>,
    startMatchRecoveryLoading: () => void,
    matchRecoveryLoading: boolean,
    resetMatchSession: () => void,
    // Invite / challenge system
    pendingInvites: ChallengeInvite[],
    removeInvite: (matchId: string) => void,
    challengeDeclined: boolean,
    isInviteMatch: boolean,
    setIsInviteMatch: Dispatch<SetStateAction<boolean>>,
    inviteExpiresAt: number | null,
    setInviteExpiresAt: Dispatch<SetStateAction<number | null>>,
    // Recovery timers
    startCreateRecoveryTimer: (txSignature: string, matchId: string) => void,
    startCancelRecoveryTimer: (txSignature: string, matchId: string) => void,
    // Spectator
    isSpectating: boolean,
    spectatorCount: number,
    watchableMatches: WatchableMatch[],
    spectatorInfo: SpectatorInfo | null,
    fetchWatchableMatches: () => void,
    watchMatch: (matchId: string) => void,
    stopSpectating: () => void,
    awaitingMatchStart: boolean;
    startJoinMatchAwait: (invite?: boolean) => void;
    stopJoinMatchAwait: () => void;
}

// // To check users connection strength
// export type ConnectionQuality = "excellent" | "good" | "fair" | "poor" | "offline"

// type NetworkContextType = { ping: number | null; connectionQuality: ConnectionQuality }
// const NetworkContext = createContext<NetworkContextType>({ ping: null, connectionQuality: "offline" })

const dummySocketRef: RefObject<Socket<DefaultEventsMap, DefaultEventsMap> | null> = {
    current: null,
};

// normal rpc context
const rcpStakingContext = createContext<contextProps>({
    socketConnLoading: false,
    staking: {} as RPC_STAKE_TYPE,
    setStaking: () => {},
    socket: dummySocketRef,
    GAME_MODE: "1 of 1",
    resetStaking: () => {},
    pvpMatchDetails: {} as PvP_MATCH_TYPE,
    setPvpMatchDetails: () => {},
    matchStatus: "" as MATCHSTATUS,
    modalOpen: false,
    openModal: () => {},
    closeModal: () => {},
    activeMatchDetails: {} as ACTIVE_MATCH_TYPE,
    setActiveMatchDetails: () => {},
    resetActiveMatch: () => {},
    gameScreen: false,
    toggleGameScreen: () => {},
    updatePlayerWins: () => {},
    RpcModalRef: {current: null},
    reconnectCountdown: 0,
    setReconnectCountdown: () => {},
    gameRoundCountdown: 0,
    setGameRoundCountdown: () => {},
    reconnectIntervalRef: {current: null},
    gameRoundIntervalRef: {current: null},
    opponentLocked: false,
    userLocked: false,
    setOpponentLocked: () => {},
    setUserLocked: () => {},
    opponentDisconnected: false,
    // setOpponentDisconnected: () => {},
    startMatchRecoveryLoading: () => {},
    matchRecoveryLoading: false,
    resetMatchSession: () => {},
    pendingInvites: [],
    removeInvite: () => {},
    challengeDeclined: false,
    isInviteMatch: false,
    setIsInviteMatch: () => {},
    inviteExpiresAt: null,
    setInviteExpiresAt: () => {},
    startCreateRecoveryTimer: () => {},
    startCancelRecoveryTimer: () => {},
    isSpectating: false,
    spectatorCount: 0,
    watchableMatches: [],
    spectatorInfo: null,
    fetchWatchableMatches: () => {},
    watchMatch: () => {},
    stopSpectating: () => {},
    awaitingMatchStart: false,
    startJoinMatchAwait: () => {},
    stopJoinMatchAwait: () => {},
})

export type RPC_MOVES = "scissors" | "rock" | "paper"
type MATCHSTATUS = 'open' | 'locking' | 'active' | 'complete' | 'cancelled';

export type WatchableMatch = {
    matchId: string
    player1: {address: string, username: string}
    player2: {address: string, username: string}
    gameMode: RPC_GAME_MODE_TYPE
    round: number
    stake: number
}

export type SpectatorInfo = {
    player1Name: string
    player2Name: string
    player1Address: string
    player2Address: string
    round: number
    stake: number
    gameMode: RPC_GAME_MODE_TYPE
}

export type ChallengeInvite = {
    matchId: string
    challengerAddress: string
    challengerUsername: string
    stake: number
    gameMode: RPC_GAME_MODE_TYPE
    expiresAt: number
    gameType?: "rpc" | "maze"
}
export type PLAYER = { 
    socketId: string, 
    address: string, 
    username: string,
    move: RPC_MOVES | null, 
    wins: number,
    disconnectedAt?: number 
 }
export type RPC_GAME_MODE_TYPE = 1 | 3 | 5

export type PvP_MATCH_TYPE = {
    id: string;
    player1?: PLAYER;
    player2?: PLAYER | null;
    stake?: number;
    status?: MATCHSTATUS;
    round?: number;
    gameMode?: RPC_GAME_MODE_TYPE;
}

type ACTIVE_MATCH_TYPE = {
    matchId: string,
    stake: number | undefined
    gameMode: RPC_GAME_MODE_TYPE | undefined
    opponentUsername?: string
    isRivalMatch?: boolean
    rivalTier?: RivalryTier | null
}

export type RPC_STAKE_TYPE = {staking: boolean, type: "AI" | "PvP" | undefined, stake: number, gameMode: RPC_GAME_MODE_TYPE, round: number, playerWins: number}

function RcpStakingContextProvider({children}: {children: ReactNode}) {
    const {modalOpen, closeModal, openModal} = useModal()
    const [gameScreen, setGameScreen] = useState<boolean>(false);
    const {walletAddress, isGuest, isArcadeLive} = useContext(appContext)
    const {loading: socketConnLoading, startLoading: startLoadSocketConn, stopLoading: stopLoadSocketConn} = useLoading()
    const [reconnectCountdown, setReconnectCountdown] = useState(0)
    const [gameRoundCountdown, setGameRoundCountdown] = useState(0)
    const reconnectIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const gameRoundIntervalRef = useRef<NodeJS.Timeout | null>(null)
    // PvP Moves state
    const [opponentLocked, setOpponentLocked] = useState(false);
    const [userLocked, setUserLocked] = useState(false)
    const [opponentDisconnected, setOpponentDisconnected] = useState(false)

    const [activeMatchDetails, setActiveMatchDetails] = useState<ACTIVE_MATCH_TYPE>({
        stake: 0,
        gameMode: undefined,
        matchId: "",
        opponentUsername: ""
    })
    const [staking, setStaking] = useState<RPC_STAKE_TYPE>({
        staking: false,
        type: undefined,
        // @ts-ignore
        stake: null,
        gameMode: 1,
        round: 1,
        // gamesPlayed: 0,
        playerWins: 0
    })
    const socketRef = useRef<Socket>(null);

    // Challenge / invite state (shared across wager games)
    const {
        pendingInvites, addInvite, removeInvite,
        challengeDeclined, setChallengeDeclined,
        isInviteMatch, setIsInviteMatch,
        inviteExpiresAt, setInviteExpiresAt,
        resetInviteFlags,
    } = useChallengeInvites<ChallengeInvite>()

    // Spectator state
    const [isSpectating, setIsSpectating] = useState(false)
    const [spectatorCount, setSpectatorCount] = useState(0)
    const [watchableMatches, setWatchableMatches] = useState<WatchableMatch[]>([])
    const [spectatorInfo, setSpectatorInfo] = useState<SpectatorInfo | null>(null)
    const spectatorMatchIdRef = useRef<string | null>(null)

    const fetchWatchableMatches = useCallback(() => {
        socketRef.current?.emit("get_watchable_matches")
    }, [])

    const watchMatch = useCallback((matchId: string) => {
        socketRef.current?.emit("watch_match", { matchId })
    }, [])

    const stopSpectating = useCallback(() => {
        const matchId = spectatorMatchIdRef.current
        if (matchId) socketRef.current?.emit("unwatch_match", { matchId })
        spectatorMatchIdRef.current = null
        // setIsSpectating(false)
        setSpectatorCount(0)
        setSpectatorInfo(null)
        setGameScreen(false)
        setOpponentLocked(false)
        setUserLocked(false)
        setGameRoundCountdown(0)
        stopCountdown(gameRoundIntervalRef)
    }, [])

    const { ping, connectionQuality, registerPing } = useSocketPing()

    const [pvpMatchDetails, setPvpMatchDetails] = useState<PvP_MATCH_TYPE>({
        id: "",
        player1: undefined,
        player2: undefined,
        stake: undefined,
        status: undefined,
        gameMode: undefined
    })
    const GAME_MODE = activeMatchDetails.gameMode && getRcpGameMode(activeMatchDetails?.gameMode)
    const [matchStatus, setMatchStatus] = useState<MATCHSTATUS>("" as MATCHSTATUS)
    const [settlementData, setSettlementData] = useState<SettlementStatus | null>(null)
    const [activeMatchWarning, setActiveMatchWarning] = useState<string | null>(null)
    const url = process.env.NEXT_PUBLIC_API_BASE_URL
    const RpcModalRef = useRef<null | RpcModalRefTypes>(null)
    const {setPlayBalance} = useContext(solanaProgramContext)

    // Recovery timers + match-recovery loading + join-await (shared across wager games)
    const {
        matchRecoveryLoading, awaitingMatchStart,
        startMatchRecoveryLoading, stopMatchRecoveryLoading,
        startCreateRecoveryTimer, startCancelRecoveryTimer,
        startJoinMatchAwait, stopJoinMatchAwait,
        markCreated, markReady, markCancelled, resetRecovery,
    } = useRecoveryTimers(socketRef, {
        createToastMsg: "creating taking too long, syncing server…",
        cancelToastMsg: "Cancelling taking too long, confirming cancellation…",
        recoveringToastMsg: "Already in a match. recovering match wait..",
    })

    const toggleGameScreen = useCallback((value: boolean) => {
        setGameScreen(value);
    }, []);

    const resetActiveMatch = useCallback(() => {
        setActiveMatchDetails({
            matchId: "",
            stake: 0,
            gameMode: undefined,
            opponentUsername: ""
        })
    }, [])

    const resetStaking = useCallback(() => {
        setStaking({
            staking: false,
            type: undefined,
            // @ts-ignore
            stake: null,
            gameMode: 1,
            round: 1,
            playerWins: 0,
        });
    }, []);

    const resetMatchSession = useCallback(() => {
        resetRecovery();
        resetStaking();
        RpcModalRef.current?.changeModalSection("home")
        setPvpMatchDetails({ id: "", player1: undefined, player2: undefined, stake: undefined, status: undefined, gameMode: undefined });
        resetActiveMatch();
        setMatchStatus("" as MATCHSTATUS);
        setSettlementData(null);
        setOpponentLocked(false);
        setUserLocked(false);
        setGameRoundCountdown(0);
        setReconnectCountdown(0);
        stopCountdown(gameRoundIntervalRef);
        stopCountdown(reconnectIntervalRef);
        // changed to true
        setGameScreen(true);
        resetInviteFlags();
    }, [resetStaking, resetActiveMatch, resetRecovery, resetInviteFlags]);

    useEffect(() => {
        if (isGuest || !isArcadeLive) return;

        startLoadSocketConn()

        const socket = io(url, {auth: {token: globalState.authorizationToken}});
        socketRef.current = socket;
        
        
        socket.on("connect_error", (err) => {
            stopLoadSocketConn()
            toast.error(err?.message ?? "Error connecting to socket")
            console.error("Socket auth failed:", err.message);
        });
        
        socket.on("connect", () => {
            stopLoadSocketConn()
            console.log("Socket connected:", socket.id)
            socketRef.current = socket
        });
        const cleanupPing = registerPing(socket)
        socket.on("match_created", (data: PvP_MATCH_TYPE) => {
            markCreated()
            setMatchStatus("open"),
            console.log("Match created:", data)
            RpcModalRef.current?.matchCreated(data)
        });
        // When both users are present in a match
        socket.on("match_ready", (data: {
            endsAt: number;
            matchId: string;
            amount: number;
            gameMode: RPC_GAME_MODE_TYPE;
            player1: { address: string; username: string };
            player2: { address: string; username: string };
            isRivalMatch?: boolean;
            rivalTier?: RivalryTier | null;
        }) => {
            markReady()
            const myAddress = walletAddress;
            const opponentUsername = data.player1.address === myAddress
                ? data.player2.username
                : data.player1.username;

            setMatchStatus("active");
            RpcModalRef.current?.matchReady({
                ...data,
                opponentUsername,
                isRivalMatch: data.isRivalMatch ?? false,
                rivalTier: data.rivalTier ?? null,
            });
            closeModal();
        });

        socket.on("challenge_received", (data: ChallengeInvite) => {
            if (data.gameType && data.gameType !== "rpc") return
            console.log("CHALLENGE RECEIVED")
            console.log(data)
            addInvite(data)
            // toast("New challenge received!", { icon: "⚔️" })
        })
        socket.on("challenge_declined", () => {
            setChallengeDeclined(true)
            toast.error("Your challenge was declined")
        })

        socket.on("watchable_matches", (matches: WatchableMatch[]) => {
            setWatchableMatches(matches)
        })

        socket.on("watching_match", (data: {
            matchId: string
            endsAt: number
            role: "spectator"
            match: {
                player1: { address: string; username: string; move: boolean; wins: number }
                player2: { address: string; username: string; move: boolean; wins: number }
                round: number
                stake: number
                gameMode: RPC_GAME_MODE_TYPE
            }
        }) => {
            spectatorMatchIdRef.current = data.matchId
            // setIsSpectating(true)
            setSpectatorCount(0)
            setSpectatorInfo({
                player1Name: data.match.player1.username || `${data.match.player1.address.slice(0,4)}…${data.match.player1.address.slice(-4)}`,
                player2Name: data.match.player2.username || `${data.match.player2.address.slice(0,4)}…${data.match.player2.address.slice(-4)}`,
                player1Address: data.match.player1.address,
                player2Address: data.match.player2.address,
                round: data.match.round,
                stake: data.match.stake,
                gameMode: data.match.gameMode,
            })
            setUserLocked(data.match.player1.move)
            setOpponentLocked(data.match.player2.move)
            setStaking(prev => ({ ...prev, round: data.match.round }))
            startCountdown({ setState: setGameRoundCountdown, intervalRef: gameRoundIntervalRef, endsAt: data.endsAt })
            toggleGameScreen(true)
        })

        socket.on("spectator_joined", ({ matchId }: { matchId: string; address: string }) => {
            if (spectatorMatchIdRef.current === matchId) {
                setSpectatorCount(prev => prev + 1)
            }
        })

        socket.on("spectator_left", ({ matchId }: { matchId: string; address: string }) => {
            if (spectatorMatchIdRef.current === matchId) {
                setSpectatorCount(prev => Math.max(0, prev - 1))
            }
        })

        socket.on("recovery_result", ({ status, action, message }) => {
            stopMatchRecoveryLoading()
            if (status !== "recovered") {
                stopJoinMatchAwait();
            }
            switch (status) {
                case "no_stuck_match":
                    // Nothing was actually stuck — let them retry
                    toast.custom("No stuck match found. Try again.");
                    break;
                case "recovered": 
                    toast.success("Match Recovered")
                    break;
                case "error":
                    toast.error("Recovery Failed, we're looking into it. contact support");
                    break;
            }
        });

        const handleOpponentReconnected = () => {
            toast.success("Opponent Reconnected")
            setOpponentDisconnected(false)
            // stop reconnect countdown
            stopCountdown(reconnectIntervalRef)
            // stopDisconnectCountdown()
            setReconnectCountdown(0)
        }

        const handleOppponentDisconnected = ({endsAt}: {endsAt: number;}) => {
            console.log("OPPONENT DISCONNECTED")

            toast.error("Opponent Disconnected");
            
            setOpponentDisconnected(true);

            startCountdown({
                endsAt,
                setState: setReconnectCountdown,
                intervalRef: reconnectIntervalRef,
            });
        };

        socket.on("player_disconnected", handleOppponentDisconnected)
        socket.on("player_reconnected", handleOpponentReconnected)

        return () => {
            cleanupPing()
            socket.disconnect()
        };
    }, [url, isGuest, isArcadeLive]);

    const updatePlayerWins = useCallback(() => {
        setStaking(prev => ({...prev, playerWins: prev.playerWins + 1}))
    }, [])

    const value = useMemo<contextProps>(() => ({
        socketConnLoading,
        staking,
        setStaking,
        socket: socketRef,
        GAME_MODE,
        resetStaking,
        pvpMatchDetails,
        setPvpMatchDetails,
        matchStatus,
        modalOpen,
        closeModal,
        openModal,
        activeMatchDetails,
        setActiveMatchDetails,
        resetActiveMatch,
        gameScreen,
        toggleGameScreen,
        updatePlayerWins,
        RpcModalRef,
        reconnectCountdown,
        setReconnectCountdown,
        gameRoundCountdown,
        setGameRoundCountdown,
        challengeDeclined,
        isInviteMatch,
        setIsInviteMatch,
        inviteExpiresAt,
        setInviteExpiresAt,
        startCreateRecoveryTimer,
        startCancelRecoveryTimer,
        isSpectating,
        spectatorCount,
        watchableMatches,
        spectatorInfo,
        fetchWatchableMatches,
        watchMatch,
        stopSpectating,
        opponentDisconnected,
        awaitingMatchStart,
        startJoinMatchAwait,
        stopJoinMatchAwait,
    }), [
        socketConnLoading, staking, GAME_MODE, pvpMatchDetails, matchStatus,
        modalOpen,
        startCreateRecoveryTimer, startCancelRecoveryTimer,
        isSpectating, spectatorCount, watchableMatches, spectatorInfo,
        fetchWatchableMatches, watchMatch, stopSpectating, awaitingMatchStart, startJoinMatchAwait, stopJoinMatchAwait
    ])

    const networkValue = useMemo(() => ({ ping, connectionQuality }), [ping, connectionQuality])

    return (
        <NetworkContext.Provider value={networkValue}>
            <rcpStakingContext.Provider value={value}>
                {awaitingMatchStart && <LoadingOverlay />}
                {children}
                <SettlementToast data={settlementData} />
                {activeMatchWarning && (
                    <ActiveMatchWarning
                        gameType={activeMatchWarning}
                        onClose={() => setActiveMatchWarning(null)}
                    />
                )}
            </rcpStakingContext.Provider>
        </NetworkContext.Provider>
    )
}

export {rcpStakingContext, RcpStakingContextProvider}
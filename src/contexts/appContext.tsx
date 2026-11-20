"use client"
import { CSSProperties, createContext, Dispatch, ForwardRefExoticComponent, ReactNode, RefAttributes, RefObject, SetStateAction, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { APISTATUS, ApiType, GAME_NAMES, TOKEN_NAME, UserType } from "../../api-feature/types";
import { apiSlice, globalState, useGetGamesQuery, useGetUserDataQuery } from "../../api-feature/apiSlice";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { GamesType } from "../../api-feature/game/types";
import ErrorPopup from "@/components/seondary/error-popup";
import {
  CheckSquare,
  User,
  Wallet,
  Home,
  Trophy,
  Swords,
  LucideProps,
} from "lucide-react";
import useAudio, { SFXType } from "@/util/useAudio";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { AnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { AnchorProvider, Idl, Program } from "@coral-xyz/anchor";
import { walletContext } from "./walletContext";
import { solanaProgramContext } from "./anchorProvider";
import useNetworkGuard from "@/util/useNetworkGuard";
import WarningModal from "@/components/modals/wallet-not-connected";
import Link from "next/link";
import useModal from "@/util/useModal";


interface AppContextProps {
    isArcadeLive: boolean,
    isMobile: boolean,
    signedIn: boolean,
    setSignedIn: Dispatch<SetStateAction<boolean>>,
    showConnectWalletModal: (component: RequestWalletComponentTypes) => void
    isWalletSigned: boolean
    walletAddress?: string
    handleLogOut: () => void
    handleSignIn: (token: string, data: UserType) => void;
    checkedLocalStorage: boolean;
    userProfile: UserType;
    syncUserProfile: (updates: {
        username?: string;
        xp?: number;
        gameCountIncrement?: boolean;
        walletAddress?: string;
        gameSessionToken?: string;
        avatar?: string;
    }) => void;
    gamesData: Record<GAME_NAMES, GamesType>,
    gameStatus: APISTATUS,
    navItems:  {
        name: string;
        href: string;
        icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
        color: string;
        bgStyle?: CSSProperties;
    }[];
    toggleMute: () => void;
    isMuted: boolean;
    playSfx: (type: keyof SFXType) => void;
    walletPublicKey: PublicKey | null;
    handleWalletSign: () => void;
    requestWalletComponent: RequestWalletComponentTypes;
    gameSessionToken: RefObject<undefined | string>;
    appOpenModalHandler: (type: "connect" | "welcome" | "profile" | "account_init") => void;
    getIsAppModalOpen: (type: "connect" | "welcome" | "profile" | "account_init") => boolean;
    appCloseModalHandler: (type: "connect" | "welcome" | "profile" | "account_init") => void;
    isGuest: boolean;
    handleGuestLogin: () => void;
    handleGuestLogout: () => void;
}

const appContext = createContext<AppContextProps>({
    isArcadeLive: false,
    isMobile: false,
    signedIn: false,
    setSignedIn: () => {},
    showConnectWalletModal: () => {},
    isWalletSigned: false,
    walletAddress: undefined,
    handleLogOut: () => {},
    handleSignIn: () => {},
    checkedLocalStorage: false,
    userProfile: {} as UserType,
    syncUserProfile: () => {},
    gamesData: {} as Record<GAME_NAMES, GamesType>,
    gameStatus: "uninitialized",
    navItems: [],
    toggleMute: () => {},
    isMuted: true,
    playSfx: () => {},
    walletPublicKey: null,
    handleWalletSign: () => {},
    requestWalletComponent: "" as RequestWalletComponentTypes,
    gameSessionToken: {current: undefined},
    appOpenModalHandler: () => {},
    getIsAppModalOpen: () => false,
    appCloseModalHandler: () => {},
    isGuest: false,
    handleGuestLogin: () => {},
    handleGuestLogout: () => {},
})

interface userApiType extends ApiType {
  data: {data: UserType, success: boolean, gameSessionToken: string}
}

interface gamesApiType extends ApiType {
    data: {data: Record<GAME_NAMES, GamesType>, count: number, success: boolean}
}

export type RequestWalletComponentTypes = "profile" | "navbar" | "connect-modal"

function ContextProvider({children}: {children: ReactNode}) {
    const isArcadeLive = true
    const [isMobile, setIsMobile] = useState(false)
    const dispatch = useDispatch()
    const {audioRef, sfxAudioRef, playSfx, isMuted, requestSong, toggleMute} = useAudio()
    const {data, status, error, refetch} = useGetUserDataQuery<userApiType>(undefined, {skip: !globalState.authorizationToken})
    const {data: games, status: gameStatus, error: gamesError, refetch: refetchGames} = useGetGamesQuery<gamesApiType>(undefined, {skip: !globalState.authorizationToken})
    const gamesData = games?.data
    const { publicKey: walletPublicKey, disconnect, connected } = useWallet();
    const [requestWalletComponent, setRequestWalletComponent] = useState<RequestWalletComponentTypes>("" as RequestWalletComponentTypes)
    const {openWalletModal} = useContext(walletContext)
    const walletAddress = walletPublicKey?.toBase58()
    const [isWalletSigned, setIsWalletSigned] = useState(false)

    const [signedIn, setSignedIn] = useState(false)
    // Guest mode: session-only, never persisted to localStorage.
    const [isGuest, setIsGuest] = useState(false)
    const [userProfile, setUserProfile] = useState({} as UserType)
    const [checkedLocalStorage, setCheckedLocalStorage] = useState(false)
    const {clearTokenBalances} = useContext(solanaProgramContext)
    // const {isCorrectNetwork, currentNetwork, expectedNetwork} = useNetworkGuard()
    const gameSessionToken = useRef<undefined | string>(undefined)
    
    const {openModal: openWelcomeModal, modalOpen: welcomeModalOpen, closeModal: closeWelcomeModal} = useModal()
    const {openModal: openConnectModal, modalOpen: connectModalOpen, closeModal: closeConnectModal} = useModal()
    const {openModal: openProfileModal, modalOpen: profileModalOpen, closeModal: closeProfileModal} = useModal()
    const {openModal: openInitModal, modalOpen: initModalOpen, closeModal: closeInitModal} = useModal()

    const appCloseModalHandler = useCallback(
        (type: "connect" | "welcome" | "profile" | "account_init") => {
            const closeMap = {
            connect: closeConnectModal,
            welcome: closeWelcomeModal,
            profile: closeProfileModal,
            account_init: closeInitModal,
            };

            closeMap[type]?.();
        },
        [
            closeConnectModal,
            closeWelcomeModal,
            closeProfileModal,
            closeInitModal,
        ]
    );

    const getIsAppModalOpen = useCallback(
        (type: "connect" | "welcome" | "profile" | "account_init") => {
            const modalMap = {
            connect: connectModalOpen,
            welcome: welcomeModalOpen,
            profile: profileModalOpen,
            account_init: initModalOpen,
            };

            return modalMap[type];
        },
        [
            connectModalOpen,
            welcomeModalOpen,
            profileModalOpen,
            initModalOpen,
        ]
    );

    const appOpenModalHandler = useCallback((type: "connect" | "welcome" | "profile" | "account_init") => {
        switch(type) {
            case "connect":
                openConnectModal()
                closeWelcomeModal()
                closeProfileModal()
                closeInitModal()
                break;
            case "profile":
                openProfileModal()
                closeConnectModal()
                closeWelcomeModal()
                closeInitModal()
                break;
            case "welcome":
                openWelcomeModal()
                closeConnectModal()
                closeProfileModal()
                closeInitModal()
                break;
            case "account_init":
                openInitModal()
                closeWelcomeModal()
                closeConnectModal()
                closeProfileModal()
        }
    },[])

    useEffect(() => {
        let toastid = toast
        if (status === "pending") {
            toastid.loading("fetching user data")
        } else if (status === "fulfilled") {
            toastid.dismiss()
            setUserProfile({...data?.data})
            // To only open create profile modal when username is absent and initalize modal is closed
            !data.data.username && !initModalOpen && appOpenModalHandler("profile")
        } else if (status === "rejected") {
            toastid.dismiss()
            // toast.error("Error getting user data")
            console.error(error)
        }
        return () => {
            toastid.dismiss()
        }
    },[status])

    // useEffect for corss checking connected wallet with user profile wallet address
    useEffect(() => {
        if (walletAddress && userProfile?.walletAddress) {
            const abbr = `${walletAddress.slice(0,3)}....${walletAddress.slice(-4)}`
            const userProfileAddress = userProfile.walletAddress
            // userProfile.walletAddress can be full or abbreviated depending on which
            // API response (verifyNonce vs getUserData) last updated the state, so
            // check against both forms to avoid false mismatches.
            const isSameWallet = walletAddress === userProfileAddress || abbr === userProfileAddress
            if (!isSameWallet) {
                handleLogOut()
            }
        }
    },[walletAddress, userProfile])

    const showConnectWalletModal = useCallback((component: RequestWalletComponentTypes) => {
        // setShowAuthFlow(true)
        // setVisible(true)
        openWalletModal()
        setRequestWalletComponent(component)
    },[])
    

    const handleSignIn = useCallback((token: string, data: UserType) => {
        saveAuthorizationTokenWithExpiry(token)
        setUserProfile(data)
        setSignedIn(true)
        setIsGuest(false)
    },[])

    const handleGuestLogin = useCallback(() => {
        setIsGuest(true)
    }, [])

    const handleGuestLogout = useCallback(() => {
        setIsGuest(false)
    }, [])

    const handleLogOut = () => {
        try {
            localStorage.removeItem(TOKEN_NAME)
            setSignedIn(false)
            setIsWalletSigned(false)
            setUserProfile({} as UserType)
            setIsGuest(false)
            disconnect()
            clearTokenBalances()

            // @ts-ignore
            setRequestWalletComponent("")
            globalState.authorizationToken = ""

            // Clear RTK Query cache
            dispatch(apiSlice.util.resetApiState())
        } catch (error) {
            console.error(error)
        }
    }

    const syncUserProfile = useCallback(
        (updates: Partial<{
            username: string;
            xp: number;
            gameCountIncrement: boolean;
            walletAddress: string;
            avatar: string;
    }>) => {
        setUserProfile(prev => {
            let newProfile = { ...prev };

            if (updates.username !== undefined) {
                newProfile.username = updates.username;
            }

            if (updates.xp !== undefined) {
                newProfile.totalXp = prev.totalXp + Math.min(updates.xp, 20);
            }

            if (updates.gameCountIncrement) {
                newProfile.totalGamesCount = prev.totalGamesCount + 1;
            }

            if (updates.walletAddress !== undefined) {
                newProfile.walletAddress = updates.walletAddress;
            }

            if (updates.avatar !== undefined) {
                newProfile.avatar = updates.avatar
            }

            return newProfile;
        });
    },[]);


    const navItems = useMemo(() => [
        { name: "Home", href: "/", icon: Home, color: "neon-purple" },
        { name: "Swap", href: "/swap", icon: Wallet, color: "text-[#f836a5]" },
        ...(signedIn ?
            [
            { name: "Leaderboards", href: "/leaderboards", icon: Trophy, color: "neon-pink" },
            ...(userProfile?.hasRival ?
                [{ name: "Rivals", href: "/rivals", icon: Swords, color: "text-[#ff2d6e] drop-shadow-[0_0_6px_rgba(255,45,110,0.7)]", bgStyle: { background: "rgba(255,45,110,0.12)", boxShadow: "0 0 16px rgba(255,45,110,0.25), inset 0 0 12px rgba(255,45,110,0.08)", borderColor: "rgba(255,45,110,0.3)" } }]
                : []),
            { name: "Profile", href: "/profile", icon: User, color: "neon-cyan" },
            // { name: "Tasks", href: "/tasks", icon: CheckSquare, color: "neon-cyan" }
            ] : [])
    ],[signedIn, userProfile?.hasRival]);
    

    const contextValue: AppContextProps = useMemo(() => ({
        isArcadeLive,
        isMobile,
        signedIn,
        setSignedIn,
        showConnectWalletModal,
        isWalletSigned,
        walletAddress,
        handleLogOut,
        handleSignIn,
        checkedLocalStorage,
        userProfile,
        syncUserProfile,
        gamesData,
        gameStatus,
        navItems,
        toggleMute,
        isMuted,
        playSfx,
        walletPublicKey,
        handleWalletSign,
        requestWalletComponent,
        gameSessionToken,
        appOpenModalHandler,
        appCloseModalHandler,
        getIsAppModalOpen,
        isGuest,
        handleGuestLogin,
        handleGuestLogout,
    }), [isArcadeLive, isMobile, signedIn, isGuest, isWalletSigned, walletAddress,
     checkedLocalStorage, userProfile, syncUserProfile, appOpenModalHandler, appCloseModalHandler, getIsAppModalOpen,
     gamesData, gameStatus, navItems, toggleMute, isMuted, playSfx, walletPublicKey, handleWalletSign, requestWalletComponent, gameSessionToken,
     handleGuestLogin, handleGuestLogout])
    
    return (
        <appContext.Provider value={contextValue}>
            <>
                {/* SFX SOUNDS */}
                <audio
                    ref={sfxAudioRef}
                    preload="auto"
                />

                {/* BG MUSIC */}
                <audio
                    ref={audioRef}
                    // src="bg-music/Chill Lofi Retro Synthwave.mp3"
                    preload="none"
                />
                <ErrorPopup show={status === "rejected"} callback={() => {refetch(), refetchGames()}} text="Error getting userProfle" />
                {children}
            </>
        </appContext.Provider>
    )
}

export {appContext, ContextProvider}

/*
import { useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";

const GENESIS_HASHES: Record<string, "mainnet-beta" | "devnet" | "testnet"> = {
    "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d": "mainnet-beta",
    "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG": "devnet",
    "4uhcVJyU9pJkvQyS88uRDiswHXSCkY3zQawwpjk2NsNY": "testnet",
};

const useNetworkGuard = () => {
    const { connection } = useConnection();
    const [currentNetwork, setCurrentNetwork] = useState<"mainnet-beta" | "devnet" | "testnet" | "unknown">("unknown");
    const [checking, setChecking] = useState(true);

    const expectedNetwork = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";

    useEffect(() => {
        const detectNetwork = async () => {
            try {
                setChecking(true);
                const genesisHash = await connection.getGenesisHash();
                const network = GENESIS_HASHES[genesisHash] ?? "unknown";
                setCurrentNetwork(network);
            } catch (err) {
                console.error("[useNetworkGuard] Failed to detect network:", err);
                setCurrentNetwork("unknown");
            } finally {
                setChecking(false);
            }
        };

        detectNetwork();
    }, [connection]);

    const isCorrectNetwork = currentNetwork === expectedNetwork;

    return { currentNetwork, isCorrectNetwork, expectedNetwork, checking };
};

export default useNetworkGuard;
*/
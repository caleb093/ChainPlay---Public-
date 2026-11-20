import { Lock, RefreshCcw, RefreshCcwDot, User, Wallet } from "lucide-react"
import Modal from "../seondary/modal"
import Image from "next/image"
import React, { FC, useCallback, useContext, useEffect, useRef, useState } from "react"
import { FaArrowRight, FaDiscord, FaTwitter, FaUser } from "react-icons/fa"
import { useGetAuthDiscordQuery, useGetNonceQuery, useLazyGetNonceQuery, usePostDiscordCallbackMutation, usePostVerifyNonceMutation } from "../../../api-feature/apiSlice"
import { ApiType } from "../../../api-feature/types"
import toast from "react-hot-toast"
import { ConnectQueryParams } from "../layouts/homelayoutclient"
// import { ConnectQueryParams } from "../layouts/home-layout"
import { useLoading } from "@/util/hooks"
import { appContext } from "@/contexts/appContext"
import { useWallet } from "@solana/wallet-adapter-react"
import useWalletListener from "@/util/useWalletListener"
import { walletContext } from "@/contexts/walletContext"
import { solanaProgramContext } from "@/contexts/anchorProvider"

// const ConnectModal:FC<{isOpen: boolean, onClose: () => void}> = ({isOpen, onClose}) => {
//     return (
//         <Modal isOpen={isOpen} onClose={onClose}>
//             <div>
//                 <h1 className="text-center">Sign in to chainplay</h1>
//                 <div className="bg-slate-600 flex items-center justify-center gap-8 py-8 rounded-xl mt-5 mb-2">
//                     <div className="bg-white p-5 rounded-xl h-full">
//                         <User width={44} color="black" height={44} />
//                     </div>
//                     <RefreshCcwDot/>
//                     <div className="bg-white rounded-xl">
//                         <div className=" rounded-full retro-gradient flex items-center justify-center">
//                             <Image src={"/icons/logo.png"} className="rounded-xl h-[84px] w-[84px]" alt="logo" width={1000} height={1000} />
//                         </div>
//                     </div>
//                 </div>
//                 <p>Connect to explore an arcade of exciting games</p>
//                 <div className="mt-5 flex flex-col gap-3">
//                     <div className="flex items-center gap-6 px-3 py-4 bg-black rounded-lg cursor-pointer">
//                         <FaDiscord />
//                         <p>Continue with discord</p>
//                         <FaArrowRight className="ml-auto" />
//                     </div>
//                     <div className="flex items-center gap-6 px-3 py-4 bg-black rounded-lg cursor-pointer">
//                         <FaTwitter />
//                         <p>Continue with Twitter</p>
//                         <FaArrowRight className="ml-auto" />
//                     </div>
//                     <div className="flex items-center gap-6 px-3 py-4 bg-black rounded-lg cursor-pointer">
//                         <Wallet />
//                         <p>Continue with Wallet</p>
//                         <FaArrowRight className="ml-auto" />
//                     </div>
//                 </div>
//             </div>
//         </Modal>
//     )
// }


interface discordGetApi extends ApiType {
    data: {url: string, success: boolean}
}

interface nonceGetApi extends ApiType {
    data: {nonce: string}
}

interface props{
    isOpen: boolean;
    setErrorVerifying: React.Dispatch<React.SetStateAction<boolean>>
    onClose: () => void,
    onNewUser: () => void,
    openProfile: (type: "connect" | "welcome" | "profile") => void,
    queryData: ConnectQueryParams
}

const ConnectModal: FC<props> = ({ isOpen, onClose, onNewUser, openProfile, setErrorVerifying, queryData }) => {
    const [discordClicked, setDiscordClicked] = useState(false);
    const [shouldGetNonce, setShouldGetNonce] = useState(false);
    const {data, status, error, refetch} = useGetAuthDiscordQuery<discordGetApi>(undefined, {skip: !discordClicked})
    const {handleSignIn, showConnectWalletModal, handleWalletSign, isWalletSigned, checkedLocalStorage, handleGuestLogin} = useContext(appContext)
    const {clearTokenBalances} = useContext(solanaProgramContext)
    const [discordCallback] = usePostDiscordCallbackMutation()
    const {auth, code} = queryData
    const {loading, startLoading, stopLoading} = useLoading()
    const lock = true
    const lockedStyle = "border-slate-500 text-slate-400 drop-shadow-[0_0_6px_#494f4c] cursor-not-allowed "
    const blockCloseonclickoutside = useRef(false)
    const {walletModalVisible} = useContext(walletContext)
    const [showSignModal, setShowSignModal] = useState(false)

    const { connected, connecting, publicKey, select, disconnect, wallet, signMessage } = useWallet();
    const walletAddress = publicKey?.toBase58()
    console.log(publicKey)
    // const {data: nonceData, status: nonceStatus, error: nonceError, refetch: refetchNonce} = useGetNonceQuery<nonceGetApi>({address: walletAddress}, {skip: true})
    const [triggerGetNonce, {data: nonceData, status: nonceStatus, error: nonceError}] = useLazyGetNonceQuery<nonceGetApi>()
    const [verifyNonce] = usePostVerifyNonceMutation()
    const nonce = nonceData?.nonce;
    // Tracks whether the user explicitly cancelled the sign step so the next
    // wallet-connect attempt is allowed to re-fetch the nonce even though
    // nonceStatus is no longer "uninitialized".
    const cancelledRef = useRef(false)

    const handleGetNonce = useCallback(() => {
        console.log("GETTING NOCE")
        const address = publicKey?.toBase58();
        if (address) triggerGetNonce({ address });
    }, [publicKey, triggerGetNonce]);

    const walletCallback = useCallback(() => {
        console.log("Wallet CALLBACK")
        if (checkedLocalStorage && !isWalletSigned && nonceStatus !== "pending") {
            if (nonceStatus === "uninitialized" || cancelledRef.current) {
                cancelledRef.current = false
                handleGetNonce()
            }
        }
    }, [checkedLocalStorage, isWalletSigned, nonceStatus, handleGetNonce])

    useWalletListener(walletCallback, "connect-modal")

    // const walletCallback = useCallback(() => {
    //     console.log("Wallet CALLBACK")
    //     if (isOpen && checkedLocalStorage && !isWalletSigned && nonceStatus === "uninitialized") {
    //         handleGetNonce()
    //     }
    // },[checkedLocalStorage, isWalletSigned, isOpen, handleGetNonce, walletAddress])

    // useWalletListener(walletCallback, "connect-modal")

    // Mobile wallet fallback — on Seeker (and other deep-link wallets) the browser
    // may kill and reload the page while the user is in the wallet app, wiping
    // requestWalletComponent from React state. useWalletListener then never fires.
    // This effect catches that case: whenever the wallet is connected AND the modal
    // is open AND no nonce request has started yet, kick one off directly.
    useEffect(() => {
        if (!isOpen) return
        if (!connected || !publicKey) return
        if (!checkedLocalStorage || isWalletSigned) return
        if (nonceStatus === "pending") return
        if (nonceStatus !== "uninitialized" && !cancelledRef.current) return
        cancelledRef.current = false
        handleGetNonce()
    }, [isOpen, connected, publicKey, checkedLocalStorage, isWalletSigned, nonceStatus])

    const handleSignNonce = async () => { 
        const toastId = toast;
        toastId.loading("Verifying wallet")
        startLoading()

        try {
            if (signMessage) {
                const message = new TextEncoder().encode(nonce);
                const signature = await signMessage(message) 
                const signatureBytes = Array.from(signature);
                
                // @ts-ignore
                const response = await verifyNonce({walletAddress: walletAddress, signature: signatureBytes, nonce: nonceData.nonce}).unwrap()
                const {token, data} = response
                setShowSignModal(false)
                handleSignIn(token, data)
                handleWalletSign()
                toastId.dismiss()
                stopLoading()
                toast.custom(
                    (t) => (
                        <div className={`flex items-center gap-3 bg-green-600 text-white px-5 py-4 rounded-xl shadow-2xl text-sm font-medium transition-all duration-300 ${t.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
                            <span className="text-lg leading-none">✓</span>
                            <span>You are signed in.</span>
                        </div>
                    ),
                    { duration: 4000, position: "top-left" }
                )
                // if (!data.isOnchainAccountInitialized) {
                //     onClose()
                //     onNewUser()
                // } else {
                //     onClose()
                // }
                if (!data.isOnboarded) {
                    // onClose()
                    openProfile("profile")
                } else {
                    onClose()
                }
            } else {
                throw new Error("Wallet does not support signing messages")
            }
        }  catch(error) {
            toastId.dismiss()
            stopLoading()
            console.error(error)
            const msg = (error as Error)?.message ?? ""
            const userCancelled = /cancel|reject|denied/i.test(msg)
            if (userCancelled) {
                // Wallet sign prompt was dismissed — nonce is still valid, keep
                // the sign modal open so they can try again without reconnecting.
                toast.error("Signing cancelled. Press 'Sign Message' to try again.")
            } else {
                clearTokenBalances()
                toast.error("Error verifying wallet")
                setShowSignModal(false)
                cancelledRef.current = true
                disconnect()
            }
        }

    };

    const handleClick = (type: "discord" | "twitter") =>{
        if (type === "discord") {
            !discordClicked ? setDiscordClicked(true) : refetch()
        }
    }

    useEffect(() => {
        if (nonceStatus === "rejected") {
            disconnect()
            stopLoading()
            console.error(nonceError)
            // @ts-ignore
            console.log(nonceError?.data?.error)
            toast.error("Error occured")
            console.log("CALLING DISCONNECT FROM NONCE ERROR!!!!!")
        } else if (nonceStatus === "pending") {
            startLoading()
        } else if (nonceStatus === "fulfilled") {
            // handleSignNonce()
            stopLoading()
            setShowSignModal(true)
        }
    },[nonceStatus])

    useEffect(() => {
        if (status === "rejected") {
            toast.error("Error occured")
            stopLoading()
        } else if (status === "pending") {
            startLoading()
        } else if (status === "fulfilled") {
            window.open(data?.url, "_self")
            stopLoading()
        }
    },[status])

    const handleDiscordCallback = async () => {
        startLoading()
        try {
            const response = await discordCallback({code: code ?? ""}).unwrap()
            console.log(response)
            const {token, data} = response
            handleSignIn(token, data)
            if (!data.isOnboarded) {
                openProfile("profile")
            } else {
                onClose()
            }
        } catch (rejected) {
            setErrorVerifying(true)
            console.error(rejected)
        } finally {
            stopLoading()
        }
    }

    useEffect(() => {
        if (auth === "discord") {
          handleDiscordCallback()
        }
    },[auth])
    
    return (
        <Modal isOpen={isOpen} onClose={loading || auth || showSignModal ? () => {} : onClose} loading={loading} closeOnClickOutside={walletModalVisible ? false : true} containerClassname="md:w-[45em] py-10">
            
            <div>
                <h1
                    className="text-2xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ff] via-[#ff00ff] to-[#00f2ff] mb-4"
                    style={{
                        textShadow: '0 0 4px #00f2ff',
                    }}
                    >
                    Connect to ChainPlay
                </h1>
                <div
                    className=" text-white flex flex-col md:flex-row gap-6"
                    // style={{ boxShadow: '0 0 25px #00f2ff80' }}
                >
                    {/* Left Section: New Users */}
                    <div className="flex-1 flex flex-col justify-between border border-[#ff00ff]/20 rounded-lg p-3 sm:p-6 bg-[#1a1a1a]">
                        <div>
                            <h2
                                className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ff] to-[#ff00ff] mb-2"
                                style={{ textShadow: '0 0 4px #00f2ff' }}
                            >
                                Welcome Arcadian.
                            </h2>
                            <p className="text-sm text-[#bbbbbb] mb-6">
                            Create your ChainPlay account with one of the options below:
                            </p>

                            <div className="flex flex-col gap-4">
                                {/* <button
                                    onClick={() => {handleClick("discord")}}
                                    className="flex items-center gap-4 px-5 py-3 rounded-md bg-[#0d0d0d] text-[#00f2ff] border border-[#00f2ff]/60 hover:brightness-125 transition-all"
                                    style={{ boxShadow: '0 0 10px #00f2ff40' }}
                                >
                                    <FaDiscord />
                                    <span className="flex-1 text-left">Continue with Discord</span>
                                    <FaArrowRight />
                                </button> */}
                                <button
                                    onClick={() => {blockCloseonclickoutside.current = true, showConnectWalletModal("connect-modal")}}
                                    // disabled={lock}
                                    className={`flex w-full disabled:cursor-not-allowed items-center gap-4 px-5 py-3 transition-all rounded-md border ${false ? lockedStyle : "bg-[#0d0d0d] text-[#00ff95] border-[#00ff95]/60 hover:brightness-125" }`}
                                    // style={{ boxShadow: '0 0 10px #00ff9540' }}
                                >
                                    <Wallet />
                                    <span className="flex-1 text-left">Continue with Wallet</span>
                                    {false ? <Lock /> : <FaArrowRight />}
                                </button>

                                <div className="relative flex items-center my-1">
                                    <div className="flex-1 border-t border-[#ffffff15]" />
                                    <span className="mx-3 text-xs text-[#555]">or</span>
                                    <div className="flex-1 border-t border-[#ffffff15]" />
                                </div>

                                <button
                                    onClick={() => { handleGuestLogin(); onClose(); }}
                                    className="flex w-full items-center gap-4 px-5 py-3 transition-all rounded-md border bg-[#0d0d0d] text-[#888] border-[#444]/60 hover:brightness-125"
                                >
                                    <FaUser className="opacity-50" />
                                    <span className="flex-1 text-left">Continue as Guest</span>
                                    <FaArrowRight className="opacity-50" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Section: Existing Users */}
                    {/* <div className="flex-1 flex flex-col justify-between border border-[#00ff95]/20 rounded-lg p-3 sm:p-6 bg-[#1a1a1a]">
                        <div>
                            <h2
                                className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00ff95] to-[#00f2ff] mb-2"
                                style={{ textShadow: '0 0 4px #00ff95' }}
                            >
                                Returning Player?
                            </h2>
                            <p className="text-sm text-[#bbbbbb] mb-6">
                                Already have an account? Connect your wallet to continue:
                            </p>

                            <button
                                onClick={() => {blockCloseonclickoutside.current = true, showConnectWalletModal("connect-modal")}}
                                // disabled={lock}
                                className={`flex w-full disabled:cursor-not-allowed items-center gap-4 px-5 py-3 transition-all rounded-md border ${false ? lockedStyle : "bg-[#0d0d0d] text-[#00ff95] border-[#00ff95]/60 hover:brightness-125" }`}
                                // style={{ boxShadow: '0 0 10px #00ff9540' }}
                            >
                                <Wallet />
                                <span className="flex-1 text-left">Continue with Wallet</span>
                                {false ? <Lock /> : <FaArrowRight />}
                            </button>
                        </div>
                    </div> */}
                </div>
            </div>

            {/* SIGN MODAL */}
            {showSignModal &&
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
                    <div className="w-full max-w-md rounded-2xl border border-[#00ff95]/30 bg-[#111111] p-8 shadow-[0_0_30px_rgba(0,255,149,0.12)]">
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#00ff95]/30 bg-[#0d0d0d] shadow-[0_0_20px_rgba(0,255,149,0.15)]">
                                <Wallet className="h-7 w-7 text-[#00ff95]" />
                            </div>

                            <h3 className="text-xl font-bold text-white">
                                Continue Sign In
                            </h3>

                            <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-400">
                                Confirm this sign-in request in your wallet to continue to ChainPlay.
                            </p>

                            <button
                                onClick={handleSignNonce}
                                className="mt-7 flex items-center justify-center gap-3 rounded-xl border border-[#00ff95]/60 bg-[#0d0d0d] px-6 py-3 font-medium text-[#00ff95] transition-all duration-200 hover:scale-[1.02] hover:brightness-125 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Wallet className="h-5 w-5" />
                                Sign Message
                            </button>

                            <button onClick={() => { cancelledRef.current = true; disconnect(); setShowSignModal(false) }} className="mt-4 text-sm text-zinc-500 transition-colors hover:text-zinc-300">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            }
        </Modal>
    );
};



export default React.memo(ConnectModal)

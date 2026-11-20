"use client"
import HomeLayout from "@/components/layouts/home-layout"
import Button from "@/components/primary/Button"
import { Input } from "@/components/primary/Input";
import Head from "next/head"
import { useContext, useEffect, useState } from "react";
import { ArrowDownUp } from "lucide-react";
import Image from "next/image";
import { solanaProgramContext } from "@/contexts/anchorProvider";
import { appContext } from "@/contexts/appContext";
import useProgramInstructions from "@/util/useProgramInstructions";
import toast from "react-hot-toast";
import { useLoading } from "@/util/hooks";
import Loading from "@/components/seondary/Loading";
import LoadingOverlay from "@/components/seondary/loadingoverlay";
import { useLazyClaimFaucetQuery } from "../../../api-feature/apiSlice";


// export const metadata = {
//   title: `Swap - Chain Play`,
//   description: "Swap tokens to get $PLAY tokens for Chain Play Arcad"
// }

const FEE_RATE = 0.002 // 0.20%

const SwapPage = () => {
    const [fromAmount, setFromAmount] = useState("");
    const [isSwapForPlay, setIsSwapForPlay] = useState(true)
    const {isWalletSigned} = useContext(appContext)
    const {getAccounts, depositToken, withdrawToken, initializeUser} = useProgramInstructions()
    const {startLoading, stopLoading, loading} = useLoading()
    const {startLoading: startInitializeLoading, stopLoading: stopInitializeLoading, loading: initializeLoading} = useLoading()
    const [claimFaucet, {isFetching: claimLoading}] = useLazyClaimFaucetQuery()
    const {playBalance, usdcBalance, getUsdcBalance, getUserOnchainData, accountInitialised, loadingOnchainData} = useContext(solanaProgramContext)

    const handleClaimFaucet = async () => {
        try {
            const data = await claimFaucet().unwrap()
            toast.success(data.message || "Claimed successfully!")
            getUsdcBalance()
        } catch (err: any) {
            toast.error(err?.data?.message || "Claim failed. Please try again later.")
        }
    }

    const parsedAmount = parseFloat(fromAmount) || 0
    const feeAmount = isSwapForPlay ? parsedAmount * FEE_RATE : 0
    const receiveAmount = parsedAmount - feeAmount
    const displayReceiveAmount = parsedAmount > 0 ? receiveAmount.toFixed(6).replace(/\.?0+$/, "") : ""
    const displayFeeAmount = parsedAmount > 0 ? feeAmount.toFixed(6).replace(/\.?0+$/, "") : "—"

    const currentBalance = Number(isSwapForPlay ? usdcBalance : playBalance) || 0
    const isInsufficientBalance = parsedAmount > 0 && parsedAmount > currentBalance

    const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFromAmount(e.target.value);
    };

    const handleSwap = async () => {
        startLoading()
        const toastid = toast

        try {
            if (isSwapForPlay) {
                // Deposit
                toastid.loading("Deposit in progress")
                const tx = await depositToken(Number(fromAmount))

                if (tx) {
                    toastid.dismiss()
                    toast.success("Deposit successful")
                    getUserOnchainData()
                    getUsdcBalance()
                } else {
                    toastid.dismiss()
                }
            } else {
                // withdraw
                toastid.loading("withdraw in progress")
                const tx = await withdrawToken(Number(fromAmount))

                if (tx) {
                    toastid.dismiss()
                    toast.success("withdraw successful")

                    getUserOnchainData()
                    getUsdcBalance()
                } else {
                    toastid.dismiss()
                }

            }
        } catch (error) {
            toast.error("Error swapping")
            toastid.dismiss()
        } finally {
            stopLoading()
            setFromAmount("")
        }

    };

    const handleInitialize = async () => {
        try {
            startInitializeLoading()
            await initializeUser()
            toast.success("Account Initialized, fetching data...")
            await getUserOnchainData()
        } catch (error) {
            console.log(error)
        } finally {
            stopInitializeLoading()
        }
    }

    const usdcIcon = <span className="flex gap-1 items-center"><span className="h-6 w-6 rounded-full bg-[#2775ca] text-white text-[10px] font-bold flex items-center justify-center">$</span><span>USDC</span></span>
    const playIcon = <span className="flex gap-1 items-center"><Image className="h-6 w-6 " src={"/icons/joystick.png"} height={1000} width={1000} alt="play" /><span>Play</span></span>

    return (
        <>
            <Head>
                <title>Token Swap - Chain Play</title>
                <meta
                    name="description"
                    content="Swap tokens to get $PLAY tokens for Chain Play Arcade"
                />
            </Head>
            <HomeLayout>
                {loadingOnchainData && <LoadingOverlay />}
                <div className="min-h-screen px-6 pt-24 pb-16 text-[#a1a1aa] flex flex-col items-center">
                    <div className="inset-0 fixed grid-bg opacity-30" />
                    <div className="container max-w-md">
                        <h1 className="text-4xl font-bold tracking-tight mb-3 text-center neon-purple">
                            Token Swap
                        </h1>
                        <p className="text-center text-cyan-300 mb-10">
                            Swap your tokens for PLAY
                        </p>

                        {isWalletSigned && !loadingOnchainData && !accountInitialised && (
                            <>
                                <p className="mb-6 text-center text-sm font-bold tracking-wide text-red-500 border border-red-500/40 rounded-md px-4 py-3 bg-red-500/10">
                                    ⚠ ChainPlay Account not initialized.
                                </p>
                                <Button disabled={initializeLoading} onClick={handleInitialize} className="relative hover:bg-red-900 w-full bg-red-700 mt-0 mb-5 cursor-pointer">{initializeLoading ? <Loading small /> : "Intiailize Account"}</Button>
                            </>
                        )}

                        <div className="retro-card p-6 rounded-lg">
                            <div className="space-y-6">
                            {/* From token */}
                            <div className="space-y-2">
                                <label className="text-sm flex mb-1 font-medium text-muted-foreground">
                                    From {isWalletSigned && (
                                        <button
                                            onClick={handleClaimFaucet}
                                            disabled={claimLoading}
                                            className="ml-auto text-[0.9em] mt-auto text-cyan-400 hover:text-cyan-300 disabled:opacity-50 cursor-pointer"
                                        >
                                            {claimLoading ? "Claiming..." : "Get Faucet"}
                                        </button>
                                    )}
                                </label>
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50 border border-border/50">
                                    <div className="flex-1">
                                        <Input
                                            type="number"
                                            placeholder="0.0"
                                            value={fromAmount}
                                            onChange={handleFromAmountChange}
                                            className="border-0 bg-transparent text-lg focus-visible:ring-0 focus-visible:ring-offset-0 retro-input no-spinner"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-full">
                                        {/* <div className="h-5 w-5 rounded-full bg-blue-500"></div> */}
                                        <span className="font-medium">{isSwapForPlay ? usdcIcon : playIcon}</span>
                                    </div>
                                </div>
                                <div className="text-right text-xs text-muted-foreground ">
                                    {isSwapForPlay ? <p>Balance: {usdcBalance} {usdcIcon}</p> : <p>Balance: {playBalance} {playIcon}</p>}
                                </div>
                            </div>

                            {/* Swap icon */}
                            <div className="flex justify-center">
                                <div onClick={() => {setIsSwapForPlay(prev => !prev)}} className="h-10 w-10 cursor-pointer rounded-full bg-muted/30 flex items-center justify-center">
                                    <ArrowDownUp className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>

                            {/* To token */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">
                                    To
                                </label>
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50 border border-border/50">
                                <div className="flex-1">
                                    <Input
                                        type="number"
                                        placeholder="0.0"
                                        value={displayReceiveAmount}
                                        readOnly
                                        className="border-0 bg-transparent text-lg focus-visible:ring-0 focus-visible:ring-offset-0 retro-input"
                                    />
                                </div>
                                <div className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-full">
                                    {/* <div className="h-5 w-5 rounded-full bg-purple-500"></div> */}
                                    <span className="font-medium">{isSwapForPlay ? playIcon : usdcIcon}</span>
                                </div>
                                </div>
                                <div className="text-right text-xs text-muted-foreground">
                                    {isSwapForPlay ? <p>Balance: {playBalance} {playIcon}</p> : <p>Balance: {usdcBalance} {usdcIcon}</p>}
                                </div>
                            </div>

                            {/* Exchange rate */}
                            <div className="text-sm text-muted-foreground bg-muted/20 p-3 rounded-md space-y-1">
                                <div className="flex justify-between text-[0.9em]">
                                    <span>Exchange Rate</span>
                                    <span>1 USDC = 1 PLAY</span>
                                </div>
                                {isSwapForPlay && (
                                    <div className="flex justify-between text-[0.9em]">
                                        <span>Deposit Fee (0.20%)</span>
                                        <span>{displayFeeAmount} USDC</span>
                                    </div>
                                )}
                                {parsedAmount > 0 && (
                                    <div className="flex justify-between text-[0.9em] text-cyan-300 font-medium">
                                        <span>You receive</span>
                                        <span>{displayReceiveAmount} {isSwapForPlay ? "PLAY" : "USDC"}</span>
                                    </div>
                                )}
                            </div>

                            {/* Insufficient balance warning */}
                            {isInsufficientBalance && (
                                <p className="text-red-400 text-xs text-center">
                                    Insufficient {isSwapForPlay ? "USDC" : "PLAY"} balance
                                </p>
                            )}

                            {/* Swap button */}
                            <Button
                                onClick={handleSwap}
                                className="w-full retro-button text-[1em] py-2"
                                disabled={!isWalletSigned || !accountInitialised || !parsedAmount || parsedAmount <= 0 || loading || isInsufficientBalance}
                            >
                                {isWalletSigned ? "swap" : "Connect Wallet to Swap"}
                            </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </HomeLayout>
        </>
    )
}

export default SwapPage
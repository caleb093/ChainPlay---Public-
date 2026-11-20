"use client"
import { FC, useContext, useEffect, useState } from "react"
import Image from "next/image"
import { Info, X } from "lucide-react"
import { solanaProgramContext } from "@/contexts/anchorProvider"
import useProgramInstructions from "@/util/useProgramInstructions"
import Button from "@/components/primary/Button"
import { Input } from "@/components/primary/Input"
import Loading from "@/components/seondary/Loading"
import toast from "react-hot-toast"
import { useLoading } from "@/util/hooks"
import { createPortal } from "react-dom"

const FEE_RATE = 0.002

interface TopUpModalProps {
    isOpen: boolean
    onClose: () => void
    wagerAmount?: number
}

const TopUpModal: FC<TopUpModalProps> = ({ isOpen, onClose, wagerAmount }) => {
    const { playBalance, usdcBalance, getUsdcBalance, getUserOnchainData } = useContext(solanaProgramContext)
    const { depositToken } = useProgramInstructions()
    const { loading, startLoading, stopLoading } = useLoading()
    const [fromAmount, setFromAmount] = useState("")
    let requiredAmount = (wagerAmount ?? 0) - (playBalance ?? 0)

    useEffect(() => {
        setFromAmount((requiredAmount ? requiredAmount + 0.02 : 0)?.toString() ?? "")
    },[requiredAmount])

    if (!isOpen) return null

    const parsedAmount = parseFloat(fromAmount) || 0
    const feeAmount = parsedAmount * FEE_RATE
    const receiveAmount = parsedAmount - feeAmount
    const displayReceive = parsedAmount > 0 ? receiveAmount.toFixed(6).replace(/\.?0+$/, "") : ""
    const displayFee = parsedAmount > 0 ? feeAmount.toFixed(6).replace(/\.?0+$/, "") : "—"
    const isInsufficientUsdc = parsedAmount > 0 && parsedAmount > (Number(usdcBalance) || 0)

    const handleDeposit = async () => {
        startLoading()
        try {
            toast.loading("Deposit in progress")
            const tx = await depositToken(parsedAmount)
            toast.dismiss()
            if (tx) {
                toast.success("Deposit successful")
                getUserOnchainData()
                getUsdcBalance()
                setFromAmount("")
                onClose()
            }
        } catch {
            toast.dismiss()
            toast.error("Error depositing")
        } finally {
            stopLoading()
        }
    }

    const usdcIcon = (
        <div className="flex items-center gap-1.5 bg-slate-700/60 px-2.5 py-1 rounded-full ml-auto shrink-0">
            <span className="w-4 h-4 rounded-full bg-[#2775ca] text-white text-[9px] font-bold flex items-center justify-center">$</span>
            <span className="text-xs font-medium">USDC</span>
        </div>
    )
    const playIcon = (
        <div className="flex items-center gap-1.5 bg-slate-700/60 px-2.5 py-1 rounded-full ml-auto shrink-0">
            <Image src="/icons/joystick.png" width={16} height={16} alt="PLAY" className="w-4 h-4" />
            <span className="text-xs font-medium">PLAY</span>
        </div>
    )

    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-sm">
            <div className="relative w-[90%] max-w-sm bg-[#1e1e2f] rounded-xl px-6 py-5 shadow-2xl text-white border border-slate-700/50">
                <button
                    onClick={onClose}
                    className="absolute bg-red-500 rounded-full top-3 right-3 text-white hover:text-white cursor-pointer"
                >
                    <X className="w-6 h-6 scale-[0.8]" />
                </button>

                <h2 className="text-[1.25em] flex font-bold gap-2 items-center justify-center mb-1 tracking-wide text-red-600">Insufficient Balance <Info className="rotate-[180deg] text-red-600" height={20} width={20} /></h2>
                {wagerAmount !== undefined && (
                    <p className="text-center text-xs text-slate-400 mb-5">
                        You need at least{" "}
                        <span className="text-cyan-300 font-semibold">{wagerAmount} PLAY</span>{" "}
                        to place this wager. Deposit USDC below to top up.
                    </p>
                )}

                {/* From: USDC */}
                <div className="space-y-1 mb-3">
                    <label className="text-xs text-slate-400">From</label>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/70 border border-slate-700">
                        <Input
                            type="number"
                            placeholder="0.0"
                            value={fromAmount}
                            onChange={e => setFromAmount(e.target.value)}
                            className="flex-1 border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0 p-0 no-spinner"
                        />
                        {usdcIcon}
                    </div>
                    <p className="text-right text-[11px] text-slate-500">Balance: {usdcBalance ?? 0} USDC</p>
                </div>

                {/* To: PLAY */}
                <div className="space-y-1 mb-4">
                    <label className="text-xs text-slate-400">To</label>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/70 border border-slate-700">
                        <Input
                            type="number"
                            placeholder="0.0"
                            value={displayReceive}
                            readOnly
                            className="flex-1 border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                        />
                        {playIcon}
                    </div>
                    <p className="text-right text-[11px] text-slate-500">Balance: {playBalance ?? 0} PLAY</p>
                </div>

                {/* Exchange info */}
                <div className="text-xs text-slate-500 bg-slate-800/40 rounded-md px-3 py-2 space-y-1 mb-4">
                    <div className="flex justify-between">
                        <span>Rate</span>
                        <span>1 USDC = 1 PLAY</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Fee (0.20%)</span>
                        <span>{displayFee} USDC</span>
                    </div>
                    {parsedAmount > 0 && (
                        <div className="flex justify-between text-cyan-300 font-medium">
                            <span>You receive</span>
                            <span>{displayReceive} PLAY</span>
                        </div>
                    )}
                </div>

                {isInsufficientUsdc && (
                    <p className="text-red-400 text-xs text-center mb-3">Insufficient USDC balance</p>
                )}

                <Button
                    onClick={handleDeposit}
                    disabled={!parsedAmount || parsedAmount <= 0 || loading || isInsufficientUsdc}
                    className="w-full py-2 bg-green-600 text-[0.95em]"
                >
                    {loading ? <Loading small color="white" /> : `Top Up ${requiredAmount} PLAY `}
                </Button>
            </div>
        </div>,
        document.body
    )
}

export default TopUpModal
"use client"
import { FC, useContext } from "react"
import Image from "next/image"
import { useLoading } from "@/util/hooks"
import useProgramInstructions from "@/util/useProgramInstructions"
import { solanaProgramContext } from "@/contexts/anchorProvider"
import Loading from "@/components/seondary/Loading"
import toast from "react-hot-toast"

const WelcomeInitModal: FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { initializeUser } = useProgramInstructions()
    const { getUserOnchainData, updateAccountInitialised } = useContext(solanaProgramContext)
    const { loading, startLoading, stopLoading } = useLoading()

    if (!isOpen) return null

    const handleInitialize = async () => {
        try {
            startLoading()
            await initializeUser()
            toast.success("Account initialized!")
            updateAccountInitialised(true)
            await getUserOnchainData()
            onClose()
        } catch (error) {
            console.error(error)
            toast.error("Failed to initialize account")
        } finally {
            stopLoading()
        }
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm px-6">
            <div className="relative w-full max-w-md">

                {/* P-Bot peeking up from behind the top-left corner of the card */}
                <Image
                    src="/assets/pbot/pbot-wave.webp"
                    alt="P-Bot waving"
                    width={130}
                    height={130}
                    className="absolute -top-21 -left-4 z-0 select-none pointer-events-none"
                />

                {/* Card — z-10 so it sits in front of the pbot body, letting head/hand peek above */}
                <div className="relative z-10 w-full rounded-2xl border border-[#00ff95]/25 bg-[#111111] px-8 pt-14 pb-8 shadow-[0_0_40px_rgba(0,255,149,0.13)]">
                    <div className="flex flex-col items-center text-center">

                        <h3 className="text-2xl font-bold text-white leading-tight">
                            Welcome to ChainPlay
                        </h3>
                        <p className="mt-1 text-[11px] tracking-[0.22em] uppercase font-semibold text-[#00ff95]">
                            Arcadian
                        </p>

                        <p className="mt-5 max-w-xs text-sm leading-relaxed text-zinc-400">
                            Prepare to be immersed in the experience. Challenge Players, wager, and climb the ranks in a world where every move counts. Initialize your account to enter the <span className="text-[#00ffea]">arcade</span>.
                        </p>

                        <button
                            onClick={handleInitialize}
                            disabled={loading}
                            className="mt-8 w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-500 px-6 py-3 font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 shadow-[0_0_22px_rgba(34,197,94,0.35)]"
                        >
                            {loading ? <Loading small color="white" /> : "Initialize ChainPlay Account"}
                        </button>

                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="mt-4 text-xs text-zinc-600 transition-colors hover:text-zinc-400 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Skip for now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WelcomeInitModal

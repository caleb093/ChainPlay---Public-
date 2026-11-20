"use client"
import { FC, useContext, useState } from "react"
import { AlertTriangle, CheckCircle2, X } from "lucide-react"
import { solanaProgramContext } from "@/contexts/anchorProvider"
import useProgramInstructions from "@/util/useProgramInstructions"
import Button from "@/components/primary/Button"
import Loading from "@/components/seondary/Loading"
import { createPortal } from "react-dom"

interface Props {
    isOpen: boolean
    onClose: () => void
}

const AccountNotInitializedModal: FC<Props> = ({ isOpen, onClose }) => {
    const { getUserOnchainData } = useContext(solanaProgramContext)
    const { initializeUser } = useProgramInstructions()

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    if (!isOpen) return null

    const handleInitialize = async () => {
        setLoading(true)
        setError(null)
        try {
            await initializeUser()
            await getUserOnchainData()
            setSuccess(true)
            setTimeout(() => {
                setSuccess(false)
                onClose()
            }, 1400)
        } catch (err: any) {
            const msg = err?.error?.errorCode?.code ?? err?.message ?? "Initialization failed. Please try again."
            setError(String(msg))
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        if (loading) return
        setError(null)
        setSuccess(false)
        onClose()
    }

    return createPortal(
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 backdrop-blur-sm">
            <div className="relative w-[90%] max-w-sm bg-[#1e1e2f] rounded-xl px-6 py-6 shadow-2xl text-white border border-slate-700/50">
                {!loading && !success && (
                    <button
                        onClick={handleClose}
                        className="absolute bg-red-500 rounded-full top-3 right-3 text-white cursor-pointer"
                    >
                        <X className="w-6 h-6 scale-[0.8]" />
                    </button>
                )}

                {success ? (
                    <div className="flex flex-col items-center gap-3 py-4">
                        <CheckCircle2 className="w-12 h-12 text-green-400" />
                        <p className="text-green-400 font-bold tracking-wide text-sm">Account Initialized!</p>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col items-center gap-2 mb-5">
                            <AlertTriangle className="w-10 h-10 text-yellow-400" style={{ filter: "drop-shadow(0 0 8px #facc15)" }} />
                            <h2 className="text-[1.05em] font-bold tracking-wide text-center text-yellow-400">
                                Account Not Initialized
                            </h2>
                            <p className="text-xs text-slate-400 text-center leading-relaxed mt-1">
                                Your on-chain account needs to be set up before you can wager.
                                This is a one-time transaction.
                            </p>
                        </div>

                        {error && (
                            <p className="text-red-400 text-xs text-center mb-4 bg-red-400/10 border border-red-500/30 px-3 py-2 rounded-md">
                                {error}
                            </p>
                        )}

                        <Button
                            onClick={handleInitialize}
                            disabled={loading}
                            className="w-full py-2.5 bg-yellow-600 hover:bg-yellow-500 text-[0.9em] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loading small color="white" /> : error ? "Retry Initialize" : "Initialize Account"}
                        </Button>
                    </>
                )}
            </div>
        </div>,
        document.body
    )
}

export default AccountNotInitializedModal

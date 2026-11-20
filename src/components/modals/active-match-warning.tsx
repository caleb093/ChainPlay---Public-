"use client"
import { createPortal } from "react-dom"
import { AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation";

const GAME_LABELS: Record<string, string> = {
    rpc: "Rock Paper Scissors",
    maze: "Maze",
}

const ActiveMatchWarning = ({ gameType, onClose }: { gameType: string; onClose: () => void }) => {
    const label = GAME_LABELS[gameType] ?? gameType
    const router = useRouter()

    return createPortal(
        <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm flex items-center justify-center px-4">
            <div className="bg-[#0f0f0f] border border-yellow-500 rounded-2xl p-8 text-center w-full max-w-sm shadow-[0_0_40px_rgba(234,179,8,0.2)]">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/30 mx-auto mb-5">
                    <AlertTriangle className="w-8 h-8 text-yellow-400" />
                </div>
                <h2 className="text-xl font-bold text-yellow-400 mb-2 tracking-wide">Active Match Found</h2>
                <p className="text-slate-300 text-sm mb-2">
                    You have an active{" "}
                    <span className="text-white font-semibold">{label}</span>{" "}
                    match in progress.
                </p>
                <p className="text-slate-500 text-xs mb-7">
                    Navigate to {label} game to continue your match.
                </p>
                <button
                    onClick={() => router.push("/")}
                    className="bg-yellow-600 hover:bg-yellow-500 transition-colors w-full py-2.5 rounded-lg text-white font-semibold cursor-pointer tracking-wide"
                >
                    Go to {label}
                </button>
            </div>
        </div>,
        document.body
    )
}

export default ActiveMatchWarning
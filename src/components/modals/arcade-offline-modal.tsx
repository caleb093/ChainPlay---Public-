"use client"
import { FC } from "react"
import Image from "next/image"
import Modal from "@/components/seondary/modal"
interface Props {
    isOpen: boolean
    onClose: () => void
}

const ArcadeOfflineModal: FC<Props> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="flex flex-col items-center text-center gap-4 px-2 py-2">
                {/* Pbot waving */}
                <div
                    className="relative"
                    style={{ filter: "drop-shadow(0 0 18px rgba(192,64,255,0.55))" }}
                >
                    <Image
                        src="/assets/pbot/pbot-sad.webp"
                        className="rounded-full"
                        alt="Pbot waving"
                        width={110}
                        height={110}
                        priority
                    />
                </div>

                {/* Heading */}
                <h2
                    className="text-[1.15rem] font-black tracking-widest uppercase"
                    style={{
                        color: "#fff",
                        textShadow: "0 0 12px #c040ff, 0 0 28px #c040ff",
                    }}
                >
                    Arcade is Offline
                </h2>

                {/* Body */}
                <p
                    className="text-sm max-w-[22rem] "
                    style={{ color: "rgba(255,255,255,0.6)" }}
                >
                    Sorry Arcadian, the arcade is not live yet.

                    You&apos;ll be notified as soon as we go live! 🎮
                </p>

                {/* Divider */}
                <div
                    className="w-full h-px"
                    style={{
                        background:
                            "linear-gradient(90deg, transparent, rgba(192,64,255,0.5), transparent)",
                    }}
                />

                {/* Dismiss button */}
                <button
                    onClick={onClose}
                    className="w-full py-2.5 font-black tracking-[0.2em] text-[0.75em] uppercase cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                    style={{
                        background: "transparent",
                        border: "2px solid #c040ff",
                        color: "#c040ff",
                        textShadow: "0 0 8px #c040ff",
                        boxShadow: "0 0 14px rgba(192,64,255,0.35), inset 0 0 12px rgba(192,64,255,0.08)",
                    }}
                    onMouseEnter={e =>
                        ((e.currentTarget as HTMLButtonElement).style.background =
                            "rgba(192,64,255,0.12)")
                    }
                    onMouseLeave={e =>
                        ((e.currentTarget as HTMLButtonElement).style.background = "transparent")
                    }
                >
                    Got it
                </button>
            </div>
        </Modal>
    )
}

export default ArcadeOfflineModal

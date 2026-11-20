"use client"
import { FC, useEffect } from "react"
import Image from "next/image"
import { AchievementItem, getAchievementImage } from "@/contexts/notifyContext"

interface Props {
    achievement: AchievementItem
    onDismiss: () => void
}

const AchievementUnlockedPopup: FC<Props> = ({ achievement, onDismiss }) => {
    // Auto-dismiss after 4.5 s
    useEffect(() => {
        const t = setTimeout(onDismiss, 4500)
        return () => clearTimeout(t)
    }, [onDismiss])

    return (
        <div
            className="fixed bottom-6 left-3 z-[200] flex items-center gap-4 px-5 py-4 rounded-2xl shadow-2xl animate-slide-up"
            style={{
                background: "rgba(10,10,26,0.97)",
                border: "1px solid rgba(192,64,255,0.55)",
                boxShadow: "0 0 32px rgba(192,64,255,0.35), inset 0 0 24px rgba(192,64,255,0.06)",
                minWidth: 280,
                maxWidth: "90vw",
            }}
            onClick={onDismiss}
        >
            {/* Badge image */}
            <div
                className="shrink-0 rounded-full overflow-hidden"
                style={{ filter: "drop-shadow(0 0 10px rgba(192,64,255,0.7))" }}
            >
                <Image
                    src={getAchievementImage(achievement.id)}
                    alt={achievement.name}
                    width={56}
                    height={56}
                    className="object-cover"
                />
            </div>

            {/* Text */}
            <div className="flex flex-col gap-0.5 min-w-0">
                <p className="text-[10px] uppercase tracking-[0.25em] font-black"
                    style={{ color: "#c040ff", textShadow: "0 0 8px #c040ff" }}>
                    Achievement Unlocked!
                </p>
                <p className="text-sm font-black text-white truncate">
                    {achievement.name}
                </p>
                <p className="text-xs text-slate-400 truncate">
                    {achievement.description}
                </p>
            </div>

            {/* Dismiss hint */}
            <span className="shrink-0 text-[10px] text-slate-600 ml-1">tap</span>
        </div>
    )
}

export default AchievementUnlockedPopup
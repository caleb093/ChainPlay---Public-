import Modal from "@/components/seondary/modal"
import { FC } from "react"
import { Inter } from "next/font/google"
import { ItaskProgress } from "../../../../../api-feature/game/types";

const interfont = Inter({
    variable: "--",
    subsets: ["latin"]
});

const SnakeTaskModal:FC<{
    isOpen: boolean, 
    onClose: () => void,
    data: ItaskProgress[] | undefined
}> = ({isOpen, onClose, data}) => {

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className={`p-4 text-white `}>
                <h2 className="text-[1.6em] mb-4 text-center neon-text">Snake Tasks</h2>
            </div>

            <div className="space-y-3">
                {data?.map((task, idx) => {
                    // const isComplete = task.progress >= task.total;
                    const isComplete = task.completed;

                    return (
                    <div
                        key={idx}
                        className="border border-white/30 p-3 rounded-md backdrop-blur-sm bg-white/5 hover:bg-white/10 transition relative"
                    >
                        <div className="flex justify-between items-center">
                        <p className="text-[1em] font-semibold">{task.title}</p>
                        {isComplete ? (
                            <span className="text-lime-400 text-xl">✔</span>
                        ) : (
                            <span className="text-white/30 text-lg">○</span>
                        )}
                        </div>

                        <div className="mt-2 text-[0.85em] text-white/70 flex justify-between">
                        <span>{!isComplete ? task.progress : task.total} / {task.total} {task.type === "xp" ? "xp" : "games"}</span>
                        {!isComplete && (
                            <span>{Math.floor((task.progress / task.total) * 100)}%</span>
                        )}
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-white/10 h-2 rounded mt-1 overflow-hidden">
                        <div
                            className={`h-full ${
                            isComplete ? "bg-lime-400" : "bg-blue-400"
                            } transition-all duration-300`}
                            style={{ width: `${Math.min(100, (task.progress / task.total) * 100)}%` }}
                        />
                        </div>
                    </div>
                    );
                })}
                {data && (data?.length <= 0 && <p>Tasks unavailable</p>)}
            </div>

        </Modal>
    )
}

export default SnakeTaskModal
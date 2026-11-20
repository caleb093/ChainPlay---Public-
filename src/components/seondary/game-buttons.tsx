import { appContext } from "@/contexts/appContext";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpIcon } from "lucide-react";
import { useContext } from "react";

type Direction = "ArrowUp" | "ArrowLeft" | "ArrowDown" | "ArrowRight";

const GameButtons = ({
    movePlayer,
    onHoldStart,
    onHoldEnd,
}: {
    movePlayer: (direction: Direction) => void;
    onHoldStart?: (direction: Direction) => void;
    onHoldEnd?: (direction: Direction) => void;
}) => {
    const {isMobile} = useContext(appContext)
    const supportsHold = Boolean(onHoldStart && onHoldEnd)

    const handlers = (direction: Direction) =>
        supportsHold
            ? {
                onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); onHoldStart!(direction) },
                onPointerUp: () => onHoldEnd!(direction),
                onPointerLeave: () => onHoldEnd!(direction),
                onPointerCancel: () => onHoldEnd!(direction),
            }
            : { onClick: () => movePlayer(direction) }

    return (
        <div
            className={`${isMobile ? "flex" : "hidden"} flex-col items-center gap-2 absolute bottom-24 left-1/2 -translate-x-1/2 scale-110`}
            style={{ touchAction: "none" }}
        >
            {/* Up Button */}
            <button {...handlers("ArrowUp")} className="neon-button px-4 py-2">
                <ArrowUpIcon />
            </button>

            {/* Left, Down, Right Buttons */}
            <div className="flex items-center justify-center gap-2">
                <button {...handlers("ArrowLeft")} className="neon-button px-4 py-2">
                    <ArrowLeft />
                </button>

                <button {...handlers("ArrowDown")} className="neon-button px-4 py-2">
                    <ArrowDown />
                </button>

                <button {...handlers("ArrowRight")} className="neon-button px-4 py-2">
                    <ArrowRight />
                </button>
            </div>
        </div>

    )
}

export default GameButtons

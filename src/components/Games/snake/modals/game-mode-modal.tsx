import Modal from "@/components/seondary/modal"
import { FC, useContext } from "react"
import { Inter } from "next/font/google"
import { SNAKE_GAME_MODES } from "..";
import { Lock } from "lucide-react";
import { GAME_MODE } from "../../../../../api-feature/types";
import Tooltip from "@/components/seondary/tooltip";
import { appContext } from "@/contexts/appContext";
import ModeItem from "@/components/seondary/mode-item";

const interfont = Inter({
    variable: "--",
    subsets: ["latin"]
});

const SnakeGameMode:FC<{
    isOpen: boolean, 
    startGame: (mode: SNAKE_GAME_MODES) => void, 
    gameModeRequirements: Record<string, {
        type: string;
        value: number;
    }[]>,
    unlockedModes: Record<GAME_MODE, boolean> | undefined;
    onClose: () => void
}> = ({isOpen, onClose, unlockedModes, gameModeRequirements, startGame}) => {
    const {gamesData, playSfx} = useContext(appContext)
    
    return (
        <Modal isOpen={isOpen} onClose={() => {}} hideCloseIcon>
            <div className={`${interfont.className} max-w-sm mx-auto text-white `}>
                    {/* Section: Mode Selection */}
                    <h1 className="text-xl font-bold text-center mb-2 text-[#00f0ff] drop-shadow-[0_0_6px_#00f0ff]">
                        Play Mode
                    </h1>
                    <p className="text-xs text-center text-[#999] mb-4">Select a mode to begin</p>
                    
                    <div className="grid grid-cols-1 gap-4 mb-6">
                        <button
                            onMouseEnter={() => playSfx("beamInteraction")}
                            className="cursor-pointer py-3 px-4 rounded-md border border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff33] transition-all drop-shadow-[0_0_6px_#00f0ff]"
                            onClick={() => startGame("classic")}
                        >
                            <span className="block text-lg font-semibold">Classic</span>
                            <span className="text-xs text-[#00f0ffcc]">classic snake game</span>
                        </button>
                        {/* <button
                            className={`cursor-pointer py-3 px-4 rounded-md border ${unlockedModes?.crack ? "border-[#ff00f0] text-[#ff00f0] hover:bg-[#ff00f033] transition-all drop-shadow-[0_0_6px_#ff00f0]" : lockedStyle}`}
                            onClick={() => {unlockedModes?.crack && startGame("crack")}}
                        >
                            {!unlockedModes?.crack && <Lock className="absolute top-1 right-2" />}
                            <span className="block text-lg font-semibold">Crack</span>
                            <span className="text-xs text-[#ff00f0cc]">play snake on crack </span>
                            {!unlockedModes?.crack && (
                                <Tooltip requirements={gameModeRequirements?.countdown} />
                            )}
                        </button> */}
                        <ModeItem 
                            onMouseEnter={() => playSfx("beamInteraction")}
                            className="border-[#ff00f0] text-[#ff00f0] hover:bg-[#ff00f033] drop-shadow-[0_0_6px_#ff00f0]"
                            mode="crack" 
                            supportText="play snake on crack"
                            startGame={startGame}
                            gameModeRequirements={gameModeRequirements}
                            unlockedModes={unlockedModes}
                        />
                        <ModeItem 
                            onMouseEnter={() => playSfx("beamInteraction")}
                            className="border-red-500 text-red-400 hover:bg-red-500/20 drop-shadow-[0_0_6px_#f00]"
                            mode="mirror" 
                            supportText="play snake with flipped controls"
                            startGame={startGame}
                            gameModeRequirements={gameModeRequirements}
                            unlockedModes={unlockedModes}
                        />
                    </div>
            </div>
        </Modal>
    )
}

export default SnakeGameMode
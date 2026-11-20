import { FC } from "react"
import { FlapBounceGameModes, GAME_MODE } from "../../../api-feature/types";
import { SNAKE_GAME_MODES } from "../Games/snake";
import { Lock } from "lucide-react";
import { MAZE_GAME_MODES } from "../Games/maze";
import { capitalizeFirstLetter } from "@/util/helperFunctions";
import { twMerge } from "tailwind-merge";

type GameModesMap = {
  snake: SNAKE_GAME_MODES;
  maze: MAZE_GAME_MODES;
  flapBounce: FlapBounceGameModes;
  wordix: "classic"
  // add more games here...
};

const ModeItem:FC<{
    unlockedModes: Record<GAME_MODE, boolean> | undefined;
    startGame: (mode: SNAKE_GAME_MODES) => void, 
    onMouseEnter?: () => void;
    gameModeRequirements: Record<string, {
        type: string;
        value: number;
    }[]>,
    mode: GAME_MODE;
    supportText?: string;
    className?: string;
}> = ({unlockedModes, startGame, onMouseEnter, className, supportText, gameModeRequirements, mode}) => {
    const lockedStyle = "border-slate-500 text-slate-400 hover:bg-slate-500/20 drop-shadow-[0_0_6px_#494f4c] cursor-not-allowed "
    
    return (
        <button
            onMouseEnter={() => {unlockedModes?.[mode] && (onMouseEnter && onMouseEnter())}}
            // className="cursor-pointer py-3 px-4 rounded-md border transition-all border-red-500 text-red-400 hover:bg-red-500/20 drop-shadow-[0_0_6px_#f00]"
            // className={`relative group py-3 px-4 rounded-md border transition-all ${unlockedModes?.[mode] ?  "border-red-500 text-red-400 hover:bg-red-500/20 drop-shadow-[0_0_6px_#f00] cursor-pointer" : lockedStyle } `}
            className={twMerge(`relative flex-1 group py-3 px-4 rounded-md border transition-all ${unlockedModes?.[mode] ?  `${className} cursor-pointer` : lockedStyle }`)}
            // @ts-ignore
            onClick={() => {unlockedModes?.[mode] && startGame(mode)}}
            // onClick={() => {startGame(mode)}}
        >
            {!unlockedModes?.[mode] && <Lock className="absolute top-1 scale-[0.8] right-2" />}
            <span className="block text-lg font-semibold">{capitalizeFirstLetter(mode)}</span>
            {!unlockedModes?.[mode] && gameModeRequirements?.[mode]?.length > 0 ? (
                <span className="text-xs text-slate-400 mt-0.5 block">
                    Unlock: {gameModeRequirements[mode].map((req, i) => (
                        <span key={i}>{i > 0 ? " · " : ""}{req.type === "games_played" ? "Games Played" : req.type.toUpperCase()} {req.value}</span>
                    ))}
                </span>
            ) : (
                supportText && <span className="text-xs">{supportText}</span>
            )}
        </button>
    )
}

export default ModeItem
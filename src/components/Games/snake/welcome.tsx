import HowToPlay from "@/components/modals/how-to-play"
import Button from "@/components/primary/Button"
import { useDropdown } from "@/util/hooks"
import useModal from "@/util/useModal"
import { Settings, Volume2, VolumeX } from "lucide-react"
import Link from "next/link"
import React, { FC, useContext, useMemo } from "react"
import { FaPlay } from "react-icons/fa"
import { MdLeaderboard } from "react-icons/md"
import { Inter } from "next/font/google"
import SnakeTaskModal from "./modals/snake-task-modal"
import SnakeGameMode from "./modals/game-mode-modal"
import { SNAKE_GAME_MODES } from "."
import toast from "react-hot-toast"
import LeaderboardModal from "@/components/modals/leaderboard-modal"
import { calculateXP } from "@/util/helperFunctions"
import { ItaskProgress, IUserProgress } from "../../../../api-feature/game/types"
import useClickOutside from "@/util/useClickOutside"
import FallingConfetti from "@/components/seondary/confetti"
import useSimulateContract from "@/util/useSimulate"
import Simulate from "@/components/modals/simulate"
import { appContext } from "@/contexts/appContext"
import { GAME_MODE } from "../../../../api-feature/types"

const interfont = Inter({
    variable: "--",
    subsets: ["latin"]
});

const WelcomeSnake:FC<{
    isGameRunning: boolean,
    gameOver: boolean,
    isHighscore: boolean,
    userData: IUserProgress,
    disableStart?: boolean,
    gameMode: SNAKE_GAME_MODES,
    gameModeRequirements: Record<string, {
        type: string;
        value: number;
    }[]>,
    score: number,
    startGame: (mode: SNAKE_GAME_MODES) => void,
    resetGame: () => void
}> = ({isGameRunning, gameOver, isHighscore, gameModeRequirements, userData, disableStart, gameMode, startGame, score, resetGame}) => {
    const {playSfx, toggleMute, isMuted, isGuest} = useContext(appContext)
    const tasksData = userData?.taskProgress
    const unlockedModes = userData?.unlockedModes
    const highscores = userData?.highscores
    const {modalOpen, openModal, closeModal} = useModal()
    const {modalOpen: taskModalOpen, closeModal: closeTaskModal, openModal: openTaskModal} = useModal()
    const {modalOpen: gameModeOpen, openModal: openGameModeModal, closeModal: closeGameModeModal} = useModal()
    const {modalOpen: leaderboardOpen, openModal: openLeaderboardModal, closeModal: closeLeaderboardModal} = useModal()
    const {contractInteract, interactionLoading} = useSimulateContract(openGameModeModal, "snake")
    const {toggleDropdown, dropOpen, closeDropDown} = useDropdown()
    const dropDownRef = useClickOutside<HTMLDivElement>(() => closeDropDown());
    const gameModes = useMemo(() => ["classic","crack","mirror"], []) as GAME_MODE[];

    const handleStartGame = (mode: SNAKE_GAME_MODES) => {
        closeGameModeModal()
        startGame(mode)
    }
    const {finalxp, normalxp} = calculateXP("snake", gameMode, score)

    const highscoreSelector = () => {
        if (gameMode === "classic") {
            return highscores?.classic
        } else if (gameMode === "crack") {
            return highscores?.crack
        } else if (gameMode === "mirror") {
            return highscores?.mirror
        }
    }
    
    return (
        <>
            {/* <Simulate isOpen={interactionLoading} onClose={() => {}} /> */}
            {isHighscore && <FallingConfetti  />}
            {!isGameRunning && 
                <div className="bg-black/40 absolute w-full h-full flex flex-col justify-center items-center z-[3]">
                    <HowToPlay isOpen={modalOpen} onClose={closeModal}>
                        <div className=" mx-auto">
                            <ol className="list-decimal list-inside space-y-2">
                                <li>Use arrow keys (↑ ↓ ← →) to move the snake.</li>
                                <li>Don’t run into the walls.</li>
                                <li>Eat the food to grow longer.</li>
                                <li>Each food you eat increases your score.</li>
                                <li>Don’t run into yourself.</li>
                                <li>The game ends if you crash.</li>
                            </ol>
                        </div>
                    </HowToPlay>
                    {/* Will open after contract interaction */}
                    <SnakeGameMode gameModeRequirements={gameModeRequirements} unlockedModes={unlockedModes} isOpen={gameModeOpen} onClose={closeGameModeModal} startGame={handleStartGame} />
                    <LeaderboardModal gameName="snake" isOpen={leaderboardOpen} onClose={closeLeaderboardModal} gameModes={gameModes} />
                    <SnakeTaskModal data={tasksData} isOpen={taskModalOpen} onClose={closeTaskModal} />
                    
                    {!gameOver && (
                        <div className="text-center w-[90%] md:w-[25em] ">
                            {/* <Link href={"/"} className="absolute top-5 right-5">Exit</Link> */}
                            <div className={`${interfont.className} absolute top-5 right-5 flex flex-col`}>
                                <button onMouseDown={(e) => e.stopPropagation()} onClick={() => {toggleDropdown(), playSfx("shuffle")}} className={`ml-auto cursor-pointer`}><Settings size={35} /></button>
                                {/* Dropdown */}
                                {dropOpen && <div ref={dropDownRef} className="flex flex-col mt-2 min-w-[160px] rounded-md border border-[#392b65] backdrop-blur-sm bg-[#392b65]/5 text-sm shadow-lg">
                                    <button className="text-left px-3 py-2 cursor-pointer hover:bg-[#0ff2]/40" onClick={() => {toast.error("Coming soon"), closeDropDown()}}>Wager</button>
                                    <button onClick={() => {openTaskModal(), closeDropDown()}} className="py-2 px-3 cursor-pointer hover:bg-[#0ff2]/40 w-full text-left ">Tasks ✅ </button>
                                    <div className="px-3 py-2 flex justify-between items-center hover:bg-[#0ff2]/40 transition-all">
                                        <span>⚡ XP:</span>
                                        <span className="font-bold text-[#0ff] drop-shadow-[0_0_3px_#0ff]">{userData?.stats?.xp.toFixed(2)}</span>
                                    </div>
                                    <div onClick={toggleMute} className="px-3 flex justify-center py-2 border-b border-white/10 hover:bg-[#0ff2]/40 transition-all cursor-pointer">
                                        {isMuted ? <VolumeX /> : <Volume2 />}
                                    </div>
                                    <Link className="py-2 px-3 cursor-pointer hover:bg-[#0ff2]/40 w-full text-left text-red-500" href={"/"}><button className="">Exit</button></Link>
                                </div>}
                            </div>
                            <p className="absolute left-5 top-5 text-white">Highscore: {userData?.highscores?.classic ?? 0}</p>
                            <h1 className="text-[3em]" style={{letterSpacing: 10}}>SNAKE</h1>
                            <p className="flappy-animated-text">Cyber Punk</p>
                            <div className="flex text-[0.9em] items-center mt-8 justify-between">
                                <Button 
                                    onMouseEnter={() => playSfx("beamInteraction")}
                                    disabled={isGuest ? false : disableStart || interactionLoading} 
                                    className=" bg-green-700 disabled:cursor-not-allowed hover:bg-green-900 px-4 py-2 rounded-md flex items-center gap-3" 
                                    onClick={contractInteract}
                                >   
                                    Start <FaPlay />
                                </Button>
                                <button onClick={openModal} className="underline cursor-pointer">How To?</button>
                            </div>
                            <Button
                                // onMouseEnter={() => playSfx("beamInteraction")}
                                onClick={openLeaderboardModal}
                                className=" flex justify-center mt-4 items-center gap-2 bg-[#1ec0c0] text-[#121213] px-8 rounded-md py-2 w-full"
                            >
                                Leaderboard
                                <MdLeaderboard color="white" />
                            </Button>
                        </div>
                    )}
                    {gameOver && ( 
                        <div className="text-center">
                            <Link href={"/"} className="absolute top-5 right-5">Exit</Link>
                            <h1 style={{letterSpacing: 5}} className="text-red-600 text-[2em]">GAME OVER</h1>
                            {/* Match Details */}
                            <div className={`${interfont.className} mt-4 bg-[#1a1a1a] rounded-2xl shadow-lg relative p-4 border border-gray-700`}>
                                {isHighscore && <div className="bg-red-600 rotate-[-20deg] text-white absolute -right-20 -top-10 px-2 py-6 rounded-full arcade">HIGH<br/>SCORE</div>}
                                <div className="space-y-2 text-gray-300">
                                    <div className="flex justify-between border-b border-gray-700 pb-1">
                                        <span>Score</span>
                                        <span className="font-medium text-white">{score}</span>
                                    </div>

                                    <div className="flex justify-between border-b border-gray-700 pb-1">
                                        <span>High score</span>
                                        <span className="text-white">{highscoreSelector()}</span>
                                    </div>

                                    <div className="flex justify-between border-b border-gray-700 pb-1">
                                        <span>Game Mode</span>
                                        <span className="text-white">{gameMode}</span>
                                    </div>

                                    <div className="flex justify-between border-b border-gray-700 pb-1">
                                        <span>XP Earned</span>
                                        <span className="text-[#00ffff] font-semibold drop-shadow-[0_0_4px_#00ffff]">
                                            {normalxp} xp
                                        </span>
                                    </div>

                                    <div className="flex justify-between border-b border-gray-700 pb-1">
                                        <span>Multipliers</span>
                                        <span className="font-medium">{gameMode === "crack" ? "20" : gameMode === "mirror" ? "50" : "0"}%</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span>Final XP</span>
                                        <span className="text-[#00ffff] font-semibold drop-shadow-[0_0_4px_#00ffff]">
                                            {finalxp} xp
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onMouseEnter={() => playSfx("beamInteraction")}
                                onClick={resetGame}
                                className="mt-5 px-4 py-2 bg-green-700 hover:bg-green-900 text-white rounded w-full"
                            >
                                Restart
                            </Button>
                            <Button
                                onMouseEnter={() => playSfx("beamInteraction")}
                                onClick={openLeaderboardModal}
                                className=" flex justify-center mt-4 items-center gap-2 bg-[#1ec0c0] text-[#121213] px-8 rounded-md py-2 w-full"
                            >
                                Leaderboard
                                <MdLeaderboard color="white" />
                            </Button>                            
                        </div>                        
                    )}
                </div>
            }
        </>
    )
}

export default React.memo(WelcomeSnake)
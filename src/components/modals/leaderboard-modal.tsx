import React, { FC, useContext, useEffect, useState } from "react";
import Modal from "../seondary/modal";
import { Avatar, AvatarImage } from "../seondary/Avatar";
import { Inter } from "next/font/google"
import Loading from "../seondary/Loading";
import { useGetLeaderboardQuery } from "../../../api-feature/apiSlice";
import { SNAKE_GAME_MODES } from "../Games/snake";
import { ApiType, GAME_MODE, GAME_NAMES } from "../../../api-feature/types";
import { IleaderboardResponse } from "../../../api-feature/game/types";
import { appContext } from "@/contexts/appContext";

interface LeaderboardEntry {
  userId: string;
  rank: number;
  username: string;
  avatar: string;
  score: number;
}

interface ILeaderboardData {
    game: string,
    gameMode: string,
    count: number,
    players: LeaderboardEntry[]
}

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameName: GAME_NAMES;
  gameModes?: GAME_MODE[];
  onGameModeChange?: (mode: string) => void;
}

const interfont = Inter({
    variable: "--",
    subsets: ["latin"]
});

interface leaderboardApiType extends ApiType {
    data: {data: IleaderboardResponse, success: boolean}
}

const LeaderboardModal: FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  gameName,
  gameModes = [],
  onGameModeChange
}) => {
    const gameMode = "classic"
    const [selectedGameMode, setSelectedGameMode] = useState<GAME_MODE>(
        gameModes.length > 0 ? gameModes[0] : "classic"
    );
    const {userProfile} = useContext(appContext)
    const {data, status, error, refetch} = useGetLeaderboardQuery<leaderboardApiType>({gameMode: selectedGameMode, gameName}, {skip: !gameName})
    const leaderboardData = data?.data
    const isError = status === "rejected"
    const isLoading = status === "pending"

    useEffect(() => {
        status !== "uninitialized" && refetch()
    },[selectedGameMode])
    
    // For Maze Game
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60000);
        const seconds = Math.floor((time % 60000) / 1000);
        const milliseconds = time % 1000;
        const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}:${String(milliseconds).padStart(3, "0")}`;
        return formatted
    }
    console.log(data)
            
    return (
        <Modal isOpen={isOpen} containerClassname="z-[51]" onClose={onClose}>
            <div className={`p-2 ${interfont.className} `}>
            
                {/* Game Name */}
                <h2 className="text-3xl font-bold mb-5 text-center text-[#00ffff] tracking-wider drop-shadow-[0_0_6px_#00ffff]">
                    {leaderboardData?.game}
                </h2>

                {/* 🎮 Game Mode Selector */}
                {gameModes.length > 1 && (
                    <div className="flex w-full justify-center mb-6">
                        <select
                            value={selectedGameMode}
                            onChange={(e) => setSelectedGameMode(e.target.value as GAME_MODE)}
                            className="bg-[#100f21] border border-[#00ffff] text-[#00ffff] rounded-md px-3 py-1 w-full text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00ffff]"
                        >
                            {gameModes.map((mode) => (
                                <option className="bg-[#0a0a1a] text-[#00ffff] hover:bg-[#111133]" key={mode} value={mode}>
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Loading/Error states */}
                {isLoading && (
                    <Loading />
                )}
                {isError && (
                    <p className="text-center text-red-400 drop-shadow-[0_0_5px_#ff0055]">Error occured</p>
                )}

                {/* Leaderboard List */}
                {(!isLoading && !isError) && leaderboardData?.game && (
                    <div className="space-y-4">
                        {/* Header row */}
                        <div
                            className="flex items-center justify-between pb-2 mb-2 border-b border-[#00ffff]/40 
                                    text-sm font-semibold uppercase tracking-wide text-[#00ffff] 
                                    drop-shadow-[0_0_6px_#00ffff]"
                        >
                            <span className="w-10 text-left">Rank</span>
                            <span className="flex-1 text-left pl-10">Player</span>
                            <span className="w-16 text-right">{gameName === "maze" ? "Time" : "Score"}</span>
                        </div>
                        
                        <ul className="space-y-3">
                            {leaderboardData?.players.map((entry, index) => (
                                <li
                                    key={entry.userId}
                                    className="flex items-center justify-between pb-2 border-b border-[#7800ff]/30 hover:bg-[#1a1a3a]/40 rounded-md transition"
                                >
                                    <span className="w-6 font-bold text-[#ff00ff] drop-shadow-[0_0_4px_#ff00ff]">
                                        {index + 1}
                                    </span>

                                    <div className="flex items-center gap-4 flex-1 ml-2">
                                        <Avatar className="shadow-[0_0_8px_#00ffff] rounded-full overflow-hidden">
                                            <AvatarImage src={entry.avatar ?? "/user-avatar.png"} alt={entry.username} className="w-full h-full" />
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="truncate text-[#00ffff] font-semibold drop-shadow-[0_0_4px_#00ffff]">
                                            {entry.username === userProfile.username ? "You" : entry.username}
                                            </span>
                                            {/* <span className="text-[0.9em] text-left text-[#a1a1aa] ">0xss...222</span> */}
                                        </div>
                                    </div>

                                    <span className="font-bold text-[#ff00ff] drop-shadow-[0_0_4px_#ff00ff]">
                                        {gameName === "maze" ? formatTime(entry?.score) : entry?.score}
                                    </span>
                                </li>
                            ))}

                            {leaderboardData?.players?.length <= 0 && <p className="text-center text-[#a1a1aa] pt-5">No Data Available</p>}
                        </ul>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default React.memo(LeaderboardModal);

/*

  // Dropdown for Game Modes 
    {gameModes.length > 0 && (
        <div className="mb-6 flex justify-center">
        <select
            className="bg-[#0b0b20] text-[#00ffff] font-semibold px-4 py-2 rounded-md border-2 border-[#7800ff] 
                    shadow-[0_0_10px_#7800ff,inset_0_0_6px_#00ffff] hover:border-[#00ffff] focus:outline-none"
            value={selectedGameMode}
            onChange={(e) => setSelectedGameMode(e.target.value)}
        >
            {gameModes.map((mode) => (
            <option
                key={mode}
                value={mode}
                className="bg-[#0b0b20] text-[#00ffff] font-semibold"
            >
                {mode}
            </option>
            ))}
        </select>
        </div>
    )} 
*/
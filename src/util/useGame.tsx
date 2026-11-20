import { FC, useCallback, useContext, useEffect, useRef, useState } from "react";
import { IUserProgress } from "../../api-feature/game/types";
import { useGetUserProgressQuery, usePostGameCompletedMutation } from "../../api-feature/apiSlice";
import { ApiType, FlapBounceGameModes, GAME_MODE, GAME_NAMES } from "../../api-feature/types";
import { appContext } from "@/contexts/appContext";
import toast from "react-hot-toast";
import { useLoading } from "./hooks";
import { calculateXP } from "./helperFunctions";
import { MAZE_GAME_MODES } from "@/components/Games/maze";
import { SNAKE_GAME_MODES } from "@/components/Games/snake";

interface userProgressApiType extends ApiType {
    data: {data: IUserProgress, success: boolean}
}

type GameModesMap = {
  snake: SNAKE_GAME_MODES;
  maze: MAZE_GAME_MODES;
  flapBounce: FlapBounceGameModes;
  wordix: "classic"
  // add more games here...
};

type RequirementsObject = Record<string, number>

const useGame = <T extends keyof GameModesMap>(name: T) => {
    const {gameStatus, gamesData, userProfile, syncUserProfile, playSfx, isGuest} = useContext(appContext)
    const {data, status: progressStatus, error: progressError} = useGetUserProgressQuery<userProgressApiType>({gameId: gamesData && gamesData?.[name]?._id}, {skip: isGuest || !(gamesData?.[name]?._id)})
    const [gameCompleted] = usePostGameCompletedMutation()
    const {gameSessionToken} = useContext(appContext)
    const userProfileRef = useRef(userProfile);

    useEffect(() => {
        const toastId = toast
        if (progressStatus === "pending") {
            toastId.loading("Fetching your progress")
        } else if (progressStatus === "fulfilled") {
            toastId.dismiss()
            setProgressData(data?.data)
        } else if (progressStatus === "rejected") {
            toastId.dismiss()
            console.error(progressError)
            toast.error("Error occured")
        }
        return () => {
            toastId.dismiss()
        }
    },[progressStatus])
    
    
    const updateProgressState = (finalxp: number, score: number, mode: GAME_MODE) => {
        setProgressData(prev => {
            const updatedStats = {
                xp: (prev?.stats?.xp ?? 0) + finalxp,
                games_played: (prev?.stats?.games_played ?? 0) + 1,
            };

            const updatedTaskProgress = prev?.taskProgress?.map(task => {
                if (task.type === "xp") {
                    const newProgress = task.progress + finalxp;
                    return {
                        ...task,
                        progress: newProgress,
                        completed: newProgress >= task.total,
                    };
                }

                if (task.type === "games_played") {
                    const newProgress = task.progress + 1;
                    return {
                        ...task,
                        progress: newProgress,
                        completed: newProgress >= task.total,
                    };
                }

                return task; // unchanged if other type
            }) ?? [];

            // ---- Highscores logic ----
            const previousHighscore = prev?.highscores?.[mode] ?? 0;
            // const isNewHighscore = name === "maze" ? (score < previousHighscore) : (score > previousHighscore);
            // isNewHighscore && setIsHighscore(true)
            const isNewHighscore = name === "maze" 
                ? ((previousHighscore === 0 && score > 0) || score < previousHighscore) 
                : score > previousHighscore;

            isNewHighscore && setIsHighscore(true);
            isNewHighscore && playSfx("highscore")

            // @ts-ignore
            const updatedHighscores: IUserProgress["highscores"] = {
            ...prev?.highscores,
            [mode]: isNewHighscore ? score : previousHighscore,
            };

            return {
                ...prev,
                stats: updatedStats,
                taskProgress: updatedTaskProgress,
                highscores: updatedHighscores,
            };
        });
    }

    const onGameEnd = useCallback(async (score: number) => {
        const currentMode = gameModeRef?.current;
        const {finalxp, normalxp} = calculateXP(name, currentMode, score)
        setGameXp({final: finalxp, normal: normalxp})

        
        try {
            toastId.loading("saving your data")

            const response = await gameCompleted(data).unwrap()
            syncUserProfile({xp: response?.xpEarned ?? 0, gameCountIncrement: true})
            gameSessionToken.current = undefined;

            updateProgressState(finalxp, score, currentMode)

        } catch(error) {
            setErrorSaving(true)
            toast.error("error occured")
            console.error(error)
        } finally {
            stopLoading()
            toastId.dismiss()
        }
    },[isGuest])

    useEffect(() => {
        gameModeRef.current = gameMode;
    }, [gameMode]);
    
    return {isHighscore, onGameEnd, gameModeRef, requirements, gameXp, progressStatus, progressData, saveLoading, errorSaving, setIsHighscore, gameMode, setGameMode }
}

export default useGame
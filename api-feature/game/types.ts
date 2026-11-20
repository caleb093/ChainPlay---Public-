import { GAME_MODE, GAME_NAMES } from "../types";

interface IRequirement {
  type: string; // e.g. "xp", "games_played", "days_played"
  value: number;
}

interface ITask {
  title: string;
  total: number;
  type: "games_played" | "xp"
}

interface IGameMode {
  name: GAME_MODE; // "classic" | "crack" | "mirror" | "countdown" | "hard"
  xpReward?: number; // XP gained from this mode (optional if XP is calculated differently)
  multiplier?: number; // flapBounce and snake
  requirements: IRequirement[]; // Conditions to unlock
}

export interface GamesType {
    _id: string;
    name: GAME_NAMES;
    modes: IGameMode[];
    tasks: ITask[];
}

interface IStats {
  xp: number; // e.g., { maze_games_played: 25, maze_xp: 40 }
  games_played: number;
}

export interface ItaskProgress extends ITask {
  progress: number;
  completed: boolean
}

export interface IUserProgress {
    gameName?: string;
    userId: string; // or string if using external auth
    gameId: string; // reference to Game model
    stats?: IStats;
    taskProgress?: ItaskProgress[];
    highscores?: Record<
      "classic" | "crack" | "mirror" | "countdown" | "hard" | "default",
      number
    >;
    unlockedModes?: Record<GAME_MODE, boolean>;
}

export interface ILeaderboardData {
  rank: number,
  userId: string,
  username: string,
  avatar: string,
  score: number,
  dateAchieved: string
}

export interface IleaderboardResponse {
  game: GAME_NAMES,
  gameMode: GAME_MODE | "all",
  count: number,
  players: ILeaderboardData[]
}
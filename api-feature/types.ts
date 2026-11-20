export type APISTATUS = "fulfilled" | "pending" | "rejected" | "uninitialized"

export const TOKEN_NAME = "chain-play-token"

export interface AuthResponseType {
    success: boolean,
    data: {
        accessToken: string
    }
}

export interface ApiType {
  status: APISTATUS,
  error: unknown
}

interface ITaskToggle {
  completed: boolean;
  reward: number;
}

export interface IDailyTasks {
  date?: string; // YYYY-MM-DD
  play_five_games: ITaskToggle & { count: number };
  three_different_games: ITaskToggle & { count: number };
  word_of_day: { isComplete: boolean };
}

export interface IStarterTasks {
  connect_discord: ITaskToggle;
  connect_twitter: ITaskToggle;
  followed_twitter: ITaskToggle;
  joined_discord: ITaskToggle;
  engaged_twitter_post: ITaskToggle;
}

interface IGameStats {
  highscore: number;
  xp: number;
  gameCount: number;
}

interface ISnakeGameStats {
  classic: IGameStats;
  crack: IGameStats;
  mirror: IGameStats;
}

interface IMazeGameStats {
  classic: IGameStats;
  countdown: IGameStats;
  hard: IGameStats;
  crack: IGameStats;
}

interface IFlapBounceGameStats {
  classic: IGameStats;
  crack: IGameStats;
  mirror: IGameStats;
}

export type GAME_MODE = keyof ISnakeGameStats | keyof IMazeGameStats | keyof IFlapBounceGameStats

export type FlapBounceGameModes = keyof IFlapBounceGameStats

interface IGamesData {
  snake: ISnakeGameStats;
  maze: IMazeGameStats;
  flapBounce: IFlapBounceGameStats;

  wordix: {xp: number; gameCount: number},
  rockPaperScissors: {xp: number; gameCount: number}
  // You can add more games here as needed
}

export type GAME_NAMES = keyof IGamesData

export interface UserType {
    username: string,
    avatar?: string;
  
    walletAddress: string,
    xUsername: string,
    discordUsername: string,

    profileImage: string,
    referralCode: string,
    referralsCount: number,

    totalXp: number,
    totalGamesCount: number;
    gamesData?: IGamesData,

    dailyTasks?: IDailyTasks,
    starterTasks?: IStarterTasks,
    isOnboarded:  Boolean,
    isOnchainAccountInitialized: boolean;
    hasRival?: boolean;
}

export interface IMatchHistoryEntry {
  matchId: string;
  gameType: GameTypesAcronym;
  opponentUsername: string;
  opponentAddress: string;
  amountWagered: number;
  // "forfeit" = one player quit; check forfeitedBy to see who.
  // "mutual_forfeit" = both quit / match timed out with no winner.
  result: "win" | "loss" | "forfeit" | "mutual_forfeit";
  forfeitedBy?: "player" | "opponent"; // only set when result === "forfeit"
  playedAt: Date;
}

export type GameTypesAcronym = "rpc" | "maze";

export interface IWagerStats {
  user: string;
  gameId: string;
  totalWins: number;
  totalLosses: number;
  totalAmountWon: number;
  totalAmountLost: number;
  biggestWin: number;  // largest single payout received
  biggestLoss: number; // largest single wager lost
  recentMatches: IMatchHistoryEntry[];
  updatedAt: Date;
  createdAt: Date;
}

export type IncidentStatus = "open" | "investigating" | "resolved" | "dismissed"
export type IncidentCategory = "settlement" | "dispute" | "report"

export interface ISettlementDetails {
  txSignature: string | null;
}
export interface IDisputeDetails {
  reason: string;
  txSignature: string | null;
  reportedBy?: string;
}
export interface IReportDetails {
  description: string;
  category: string;
}

export interface IIncidentResolution {
  action: string;
  notes: string;
  resolvedAt: string;
}

export interface IIncident {
  id: string;
  category: IncidentCategory;
  matchId: string | null;
  status: IncidentStatus;
  subject: string | null;
  details: ISettlementDetails | IDisputeDetails | IReportDetails;
  resolution: IIncidentResolution | null;
  createdAt: string;
  updatedAt: string;
}

export interface IIncidentsResponse {
  incidents: IIncident[];
  total: number;
  page: number;
  pages: number;
}

export interface IDisputeRequest {
  matchId: string;
  reason: string;
}

export interface IDisputeResponse {
  incidentId: string;
  severity: string;
  status: IncidentStatus;
}

export interface IReportRequest {
  subject: string;
  description: string;
  category?: string;
}

export interface IReportResponse {
  incidentId: string;
  status: IncidentStatus;
}

export type RivalryTier = "rivals" | "fierce" | "arch"

export interface IRivalryOpponent {
  userId: string;
  username: string;
  avatar: string | null;
  walletAddress: string;
}

export interface IRivalryRecord {
  wins: number;
  losses: number;
  draws: number;
  amountWon: number;
  amountLost: number;
}

export interface IRivalryItem {
  tier: RivalryTier;
  tierLabel: string;
  tierRank: number;
  isActive: boolean;
  opponent: IRivalryOpponent;
  record: IRivalryRecord;
  totalMatches: number;
  totalWagered: number;
  firstMatchAt: string;
  lastMatchAt: string;
}

export interface IRivalriesResponse {
  rivalries: IRivalryItem[];
  count: number;
}

export interface IRivalryBadge {
  tier: RivalryTier;
  tierLabel: string;
  isActive: boolean;
}

export interface IWagerLeaderboardPlayer {
  rank: number;
  userId: string;
  username: string;
  avatar: string | null;
  totalWon: number;
  totalLost: number;
  wins: number;
  losses: number;
  biggestWin: number;
  biggestLoss: number;
  winRate: number;
}

export interface IWagerLeaderboardResponse {
  success: boolean;
  data: {
    count: number;
    players: IWagerLeaderboardPlayer[];
  };
}
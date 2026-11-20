// export type GAME_NAMES = "snake" | "flap-bounce" | "wordix" | "rpc" | "maze"
import { GAME_MODE, GAME_NAMES } from "../../api-feature/types";

export const calculateXP = (gameName: GAME_NAMES, gameMode: GAME_MODE, score: number, time?: number) => {
  let normalxp = 0
  let finalxp = 0;

  const round = (num: number) => Number(num.toFixed(2));

  switch (gameName) {
    case 'snake':
      finalxp = score * 0.04;
      normalxp = finalxp
      if (gameMode === 'crack') finalxp *= 1.2;
      if (gameMode === 'mirror') finalxp *= 1.5;
      break;

    case 'flapBounce':
      finalxp = score / 20;
      normalxp = finalxp
   
  }

  return {
    finalxp: round(finalxp),
    normalxp: round(normalxp),
  };
}

// Rock Paper Scissors
export const getWinningProbability = (games: number, stake: number): number => {
  let baseChance = 90; // 90% for the first 5 games
  console.log(games)
  // Decrease 10% every 5 games
  baseChance -= Math.floor(games / 5) * 10;

  // Cap at 20%
  if (baseChance < 20) baseChance = 20;
  console.log(baseChance)
  // Adjust for high stake: if stake is large, reduce chance significantly
  if (stake >= 100) {
    // baseChance = Math.max(baseChance - 80, 10); // Big stake drops chance to 10%
    baseChance = 10;
  } else if (stake >= 50) {
    // baseChance = Math.max(baseChance - 60, 15);
    baseChance = 15;
  }

  return baseChance;
};


export const determineOutcome = (playerChoice: number, win: boolean): number => {
  // Rock: 0, Paper: 1, Scissors: 2
  if (win) {
    if (playerChoice === 0) return 2; // Rock beats Scissors
    if (playerChoice === 1) return 0; // Paper beats Rock
    return 1;     

export const capitalizeFirstLetter = (str: string) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}


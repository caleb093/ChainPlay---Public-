import { globalState } from "../apiSlice";
import { EndpointBuilder } from '@reduxjs/toolkit/query';
import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { GAME_MODE, GAME_NAMES } from "../types";
import { GamesType } from "./types";

const gameEndpoints = (
    builder: EndpointBuilder<
        BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
        '',
        'api'
    >) => ({
        getGames: builder.query<{ success: boolean; count: number; data: Record<string, GamesType> }, undefined>({
            query: () => ({
                url: "/game", 
                method: "GET"
            }),
            transformResponse: (response: { success: boolean; count: number; data: GamesType[] }) => {
                // Convert array to object keyed by game name
                const gamesObject: Record<string, GamesType> = {};
                response.data.forEach((game) => {
                    gamesObject[game.name] = game;
                });
                return {success: response.success, count: response.count, data: gamesObject};
            },
        }),
        getUserProgress: builder.query<undefined, {gameId: string}>({
            query: ({gameId}) => ({
                url: `/game/${gameId}`, 
                method: "GET"
            }),
            keepUnusedDataFor: 0, // 🛑 disables caching, forces re-fetch
        }),
        getGameStart: builder.query<{ success: boolean; gameSessionToken: string }, { gameName: GAME_NAMES; txSignature: string }>({
            query: ({ gameName, txSignature }) => ({
                url: `/game/start?gameName=${gameName}&txSignature=${txSignature}`,
                method: "GET",
            }),
            keepUnusedDataFor: 0,
        }),
        postGameCompleted: builder.mutation<{game: GAME_NAMES, gameMode: GAME_MODE, count: number,  gameSessionToken: string, xpEarned: number }, {gameName: GAME_NAMES, gameMode: GAME_MODE, score: number, gameSessionToken: string}>({
            query: (body) => {
                console.log(body)
                return {
                    url: "/game/game-completed",
                    method: "POST",
                    body: body
                }
            }
        }),
        getLeaderboard: builder.query<undefined, {gameName: GAME_NAMES, gameMode: GAME_MODE}>({
            query: ({gameName, gameMode}) => ({
                url: `/game/leaderboard/${gameName}?gameMode=${gameMode}`, 
                method: "GET"
            }),
            keepUnusedDataFor: 0, // 🛑 disables caching, forces re-fetch
        }),
        getWagerLeaderboard: builder.query<{
            success: boolean;
            data: {
                count: number;
                players: {
                    rank: number;
                    userId: string;
                    username: string;
                    avatar?: string;
                    game: string;
                    wins: number;
                    losses: number;
                    biggestWin: number;
                    biggestLoss: number;
                    totalWon: number;
                    totalLost: number;
                    winRate: number;
                }[];
            };
        }, {gameId: string}>({
            query: ({gameId}) => ({
                url: `/game/wager-leaderboard/${gameId}`,
                method: "GET"
            }),
            keepUnusedDataFor: 0, // 🛑 disables caching, forces re-fetch
        })
    })

export default gameEndpoints
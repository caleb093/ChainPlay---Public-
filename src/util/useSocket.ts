// useSocket.ts
import { PvP_MATCH_TYPE, RPC_MOVES } from "@/contexts/rcpStakingContext";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";
import { GameTypesAcronym } from "../../api-feature/types";

/*
NOTE:
Why socket.once(...) comes before socket.emit(...):
 - emit("create_match") triggers the server to send back an event to listen to l.e socket.once(match_created). But here's the key:
 - must set up the listener before emitting, so you're ready to receive the event when the server emits it — which can happen immediately or very quickly.
    
 IF server responds very fast (e.g. within the same event loop tick), your listener might not be attached in time. That means:
- may miss the event, and
- The once callback will never get called.
*/

export const socketMethods = () => {
    // const createMatch = (socket: Socket | null, data: {txSignature: string, matchId: string, gameMode: 1 | 3 | 5, gameId: string}) => {
    //     if (!socket) return
    //     // socket.once("match_created", (data) => {
    //     //     callback(data)
    //     // })
    //     socket?.emit("create_match", { txSignature: data.txSignature, gameMode: data.gameMode, gameId: data.gameId, matchId: data.matchId}, 
    //         (res: { success: boolean; error?: string }) => {
    //             if (!res.success) {
    //                 console.error(res.error); // "PLAYER_ALREADY_HAS_OPEN_MATCH"
    //                 toast.error(res.error ?? "Error creating match" )
    //                 return;
    //             }
    //             // console.log('Match created', res.matchId);
    //         }
    //     );
    // };

    const startJoinMatch = (socket: Socket | null, data: { matchId: string }): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (!socket) return reject(new Error("No socket connection"));

            socket.emit("start_join_match", { matchId: data.matchId },
                (response: { success: boolean; error?: string }) => {
                    if (!response.success) {
                        toast.error(response.error ?? "Error joining Match");
                        return reject(new Error(response.error));
                    }
                    resolve();
                }
            );
        });
    };

    const resetJoinMatch = (socket: Socket | null, data: { matchId: string }): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (!socket) return reject(new Error("No socket connection"));

            socket.emit("reset_join_match", { matchId: data.matchId },
                (response: { success: boolean; error?: string }) => {
                    if (!response.success) {
                        toast.error(response.error ?? "Error resetting Match");
                        return reject(new Error(response.error));
                    }
                    resolve();
                }
            );
        });
    };

    // const joinMatch = (socket: Socket | null, data: {matchId: string, txSignature: string}) => {
    //      socket?.emit("join_match", { matchId: data.matchId, txSignature: data.txSignature }, 
    //         (response: { success: boolean; error?: string }) => {
    //             if(!response.success) {
    //                 console.error(response.error)
    //                 toast.error(response.error ?? "Error joining Match")
    //                 return;
    //             }
    //     });
    // };


    const submitMove = async (socket: Socket | null, data: {matchId: string, addr: string, move: RPC_MOVES}, signMessage: ((message: Uint8Array<ArrayBufferLike>) => Promise<Uint8Array>) | undefined ) => {
        if (!signMessage) return;

        // const moveData =`${data.matchId}:${data.addr}:${data.move}`
        // const message = new TextEncoder().encode(moveData)
        // const signature = await signMessage(message)
        // const signatureBytes = Array.from(signature);
        const signatureBytes = [0];
        
        socket?.emit("submit_move", {
            matchId: data.matchId,
            move: data.move,
            signature: signatureBytes
        }, (response: {success: boolean; error?: string}) => {
            if(!response.success) {
                console.error(response.error)
                toast.error(response.error ?? "Error submitting Move")
                return;
            }
        });
    };

    const getAvailableMatches = (
        socket: Socket | null,
        gameType: "rpc" |"maze",
        filters: { gameMode?: 1 | 3 | 5, minStake?: number, maxStake?: number } | undefined,
        callback: (data: any) => void
    ) => {
        if (!socket || !gameType) return;
        socket.off("available_matches");
        socket.once("available_matches", (data) => {
            callback(data);
        });
        socket.emit("get_available_matches", { gameType, ...(filters ?? {}) });
    }

    const cancelMatch = (socket: Socket | null, data: {matchId: number}, callback: (data: any) => void, ) => {
        if (!socket) return
        
        socket.once("match_cancelled", (data) => {
            callback(data)
        })
        socket?.emit("cancel_match", {
            matchId: data.matchId
        })
    }

    const recoverStuckMatch = (socket: Socket | null) => {
        if (!socket) return
        socket.emit("recover_stuck_match")
    }

    const declineChallenge = (socket: Socket | null, matchId: string, gameType: GameTypesAcronym) => {
        if (!socket) return
        socket.emit("decline_challenge", { matchId, gameType })
    }

    const verifyCreateMatch = (socket: Socket | null, txSignature: string, matchId: string, toastId: string) => {
        if (!socket) return

        socket.emit('verify_create_match', { txSignature, matchId }, (res: { success: boolean; error?: string; message?: string }) => {
            toast.dismiss(toastId)
            if (!res.success) {
                toast.error(res.message ?? res.error ?? "Match creation could not be verified")
            }
        })
    }

    return { startJoinMatch, resetJoinMatch, submitMove, getAvailableMatches, cancelMatch, recoverStuckMatch, declineChallenge, verifyCreateMatch }
}


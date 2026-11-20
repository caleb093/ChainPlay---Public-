import { useCallback, useRef, useState } from "react"
import type { Socket } from "socket.io-client"
import type { ConnectionQuality } from "@/contexts/networkProvider"

/**
 * Shared socket ping / connection-quality probe used by every wager context.
 *
 * Owns the `ping` round-trip state and derives a coarse `connectionQuality`.
 * `registerPing(socket)` attaches the connect/pong/disconnect listeners plus the
 * 5s heartbeat to a freshly-created socket and returns a cleanup function that the
 * caller folds into its socket effect's teardown.
 */
export function useSocketPing() {
    const [ping, setPing] = useState<number | null>(null)
    const pingSentAtRef = useRef<number | null>(null)

    const connectionQuality: ConnectionQuality =
        ping === null   ? "offline"
        : ping < 60     ? "excellent"
        : ping < 120    ? "good"
        : ping < 250    ? "fair"
                        : "poor"

    const registerPing = useCallback((socket: Socket) => {
        const sendPing = () => {
            if (!socket.connected) return
            pingSentAtRef.current = Date.now()
            socket.emit("ping_check")
        }
        const onConnect = () => {
            // Fire an immediate ping on connect
            pingSentAtRef.current = Date.now()
            socket.emit("ping_check")
        }
        const onPong = () => {
            if (pingSentAtRef.current !== null) {
                setPing(Date.now() - pingSentAtRef.current)
                pingSentAtRef.current = null
            }
        }
        const onDisconnect = () => setPing(null)

        socket.on("connect", onConnect)
        socket.on("pong_check", onPong)
        socket.on("disconnect", onDisconnect)
        const interval = setInterval(sendPing, 5000)

        return () => {
            clearInterval(interval)
            socket.off("connect", onConnect)
            socket.off("pong_check", onPong)
            socket.off("disconnect", onDisconnect)
        }
    }, [])

    return { ping, connectionQuality, registerPing }
}

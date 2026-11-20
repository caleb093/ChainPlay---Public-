import { createContext } from "react";

export type ConnectionQuality = "excellent" | "good" | "fair" | "poor" | "offline"

type NetworkContextType = { ping: number | null; connectionQuality: ConnectionQuality }
const NetworkContext = createContext<NetworkContextType>({ ping: null, connectionQuality: "offline" })

export default NetworkContext


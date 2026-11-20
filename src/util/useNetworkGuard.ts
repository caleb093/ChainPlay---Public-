import { useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";

const GENESIS_HASHES: Record<string, "mainnet-beta" | "devnet" | "testnet"> = {
    "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d": "mainnet-beta",
    "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG": "devnet",
    "4uhcVJyU9pJkvQyS88uRDiswHXSCkY3zQawwpjk2NsNY": "testnet",
};

const useNetworkGuard = () => {
    const { connection } = useConnection();
    const [currentNetwork, setCurrentNetwork] = useState<"mainnet-beta" | "devnet" | "testnet" | "unknown">("unknown");
    const [checking, setChecking] = useState(true);

    const expectedNetwork = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";

    useEffect(() => {
        const detectNetwork = async () => {
            try {
                setChecking(true);
                const genesisHash = await connection.getGenesisHash();
                const network = GENESIS_HASHES[genesisHash] ?? "unknown";
                setCurrentNetwork(network);
            } catch (err) {
                console.error("[useNetworkGuard] Failed to detect network:", err);
                setCurrentNetwork("unknown");
            } finally {
                setChecking(false);
            }
        };

        detectNetwork();
    }, [connection]);

    const isCorrectNetwork = currentNetwork === expectedNetwork;

    return { currentNetwork, isCorrectNetwork, expectedNetwork, checking };
};

export default useNetworkGuard;
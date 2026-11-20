"use client";

import {
    createDefaultAuthorizationCache,
    createDefaultChainSelector,
    createDefaultWalletNotFoundHandler,
    registerMwa,
} from "@solana-mobile/wallet-standard-mobile";

let registered = false;

export function registerMobileWalletAdapter() {
    if (registered) return;
    if (typeof window === "undefined") return;

    try {
        registerMwa({
            appIdentity: {
                name: "ChainPlay",
                uri: window.location.origin,
                icon: "icons/logo_transparent.png",
            },
            authorizationCache: createDefaultAuthorizationCache(),
            chains: ["solana:devnet", "solana:mainnet"],
            chainSelector: createDefaultChainSelector(),
            onWalletNotFound: createDefaultWalletNotFoundHandler(),
        });
        registered = true;
    } catch (e) {
        console.error("Failed to register Mobile Wallet Adapter:", e);
    }
}

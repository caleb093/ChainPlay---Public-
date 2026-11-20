"use client"
import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
    ConnectionProvider,
    WalletProvider
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import CustomWalletModal from "@/components/modals/connect-wallet-modal";
import { registerMobileWalletAdapter } from "@/util/registerMobileWalletAdapter";

interface WalletContextProps {
    walletModalVisible: boolean,
    closeWalletModal: () => void,
    openWalletModal: () => void,
    pendingNewUser: boolean,
    setPendingNewUser: (v: boolean) => void,
}

const walletContext = createContext<WalletContextProps>({
    walletModalVisible: false,
    closeWalletModal: () => {},
    openWalletModal: () => {},
    pendingNewUser: false,
    setPendingNewUser: () => {},
})

function WalletContextProvider({children}: {children: ReactNode}) {
    useEffect(() => {
        registerMobileWalletAdapter();
    },[])

    // Explicit adapters ensure Phantom/Solflare are available in their own in-app
    // browsers even when Wallet Standard auto-detection hasn't fired yet.
    const wallets = useMemo(() => [], []);

    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
    const network = WalletAdapterNetwork.Devnet;

    // You can also provide a custom RPC endpoint

    const [walletModalVisible, setWalletModalVisible] = useState(false);
    const [pendingNewUser, setPendingNewUser] = useState(false);

    const openWalletModal = useCallback(() => {
        setWalletModalVisible(true)
    },[])

    const closeWalletModal = useCallback(() => {
        setWalletModalVisible(false)
    },[])

    const value = useMemo(() => ({
        walletModalVisible,
        openWalletModal,
        closeWalletModal,
        pendingNewUser,
        setPendingNewUser,
    }),[walletModalVisible, openWalletModal, closeWalletModal, pendingNewUser])

    return (
        <walletContext.Provider value={value}>
            <ConnectionProvider endpoint={endpoint}>
                <WalletProvider wallets={wallets} autoConnect>
                    <CustomWalletModal />
                    {children}
                    {/* <WalletModalProvider>{children}</WalletModalProvider> */}
                </WalletProvider>
            </ConnectionProvider>
        </walletContext.Provider>
    )
}

export {walletContext, WalletContextProvider}


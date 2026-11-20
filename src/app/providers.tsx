// src/app/providers.tsx
'use client'
import '../styles/wallet-adapter.css';
import { SolanaProgramProvider } from '@/contexts/anchorProvider'
import { ContextProvider } from "@/contexts/appContext";
import { WalletContextProvider } from "@/contexts/walletContext";
import { ApiProvider } from "@reduxjs/toolkit/query/react";
import { apiSlice } from '../../api-feature/apiSlice';
import { ClusterProvider } from '@/web3/solana/cluster-access';
import { Toaster } from "react-hot-toast";
import { NotifyProvider } from "@/contexts/notifyContext";

export function Providers({ children }: {children: React.ReactNode;}) {
  return (
    <ApiProvider api={apiSlice}>
        <ClusterProvider>
            <WalletContextProvider>
                <SolanaProgramProvider>
                    <ContextProvider>
                        <NotifyProvider>
                            <Toaster />
                            {children}
                        </NotifyProvider>
                    </ContextProvider>
                </SolanaProgramProvider>
            </WalletContextProvider>
        </ClusterProvider>
    </ApiProvider>
  )
}

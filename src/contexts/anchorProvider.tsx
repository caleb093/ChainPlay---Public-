"use client"
import { Program, AnchorProvider, setProvider } from "@coral-xyz/anchor"
// import { useAnchorProvider } from "./appContext";
import idl from "@/web3/solana/idl.json"
import { Cluster, clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { deriveUserUsdcAta } from "@/web3/solana/constants";
import { useCluster } from "@/web3/solana/cluster-access";
import { createContext, Dispatch, ReactNode, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import useProgramInstructions from "@/util/useProgramInstructions";
import { AnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useLoading } from "@/util/hooks";
import useModal from "@/util/useModal";

const PROGRAM_ADDRESS = "YtcQyJXwTkyYoXXu1MvEPoyW8GhTDWXJNtojtxdbGGn"

function useAnchorProvider() {
  const { connection } = useConnection()
  const wallet = useWallet()

  return new AnchorProvider(connection, wallet as AnchorWallet, { commitment: 'confirmed' })
}

interface SolanaContextProps {
  program: Program | null,
  solBalance: number | null,
  usdcBalance: number | null,
  playBalance: number | null,
  setPlayBalance:  Dispatch<SetStateAction<number | null>>,
  getUserOnchainData: () => Promise<void>;
  getSolBalance: () => void;
  getUsdcBalance: () => void;
  accountInitialised: boolean;
  clearTokenBalances: () => void;
  loadingOnchainData: boolean;
  updateAccountInitialised: (value: boolean) => void;
}

const solanaProgramContext = createContext<SolanaContextProps>({
  program: null,
  solBalance: null,
  usdcBalance: null,
  playBalance: null,
  setPlayBalance: () => {},
  getUserOnchainData: async () => {},
  getSolBalance: () => {},
  getUsdcBalance: () => {},
  accountInitialised: false,
  clearTokenBalances: () => {},
  loadingOnchainData: false,
  updateAccountInitialised: () => {}
});

function SolanaProgramProvider({ children }: { children: ReactNode }) {
  const provider = useAnchorProvider();
  const { cluster } = useCluster();
  const {getUserAccount} = useProgramInstructions()
  const {publicKey: walletPublicKey} = useWallet()
  const {openModal: openInitModal, modalOpen: initModalOpen, closeModal: closeInitModal} = useModal()

  const [playBalance, setPlayBalance] = useState<null | number>(null)
  const [solBalance, setSolBalance] = useState<null | number>(null)
  const [usdcBalance, setUsdcBalance] = useState<null | number>(null)
  const [accountInitialised, setAccountInitialised] = useState(false)
  const {
      loading: loadingOnchainData, 
      startLoading: startOnchainDataLoading, 
      stopLoading: stopOnchainDataLoading
  } = useLoading()

  const clearTokenBalances = () => {
    setPlayBalance(null)
    setSolBalance(null)
    setUsdcBalance(null)
  }

  const updateAccountInitialised = useCallback((value: boolean) => {
    console.log(value)
    setAccountInitialised(value)
  },[])

  // const [program, setProgram] = useState<Program | null>(null);
  // const programId = new PublicKey(PROGRAM_ADDRESS);
  
  // useEffect(() => {
  //   console.log("Provider Effect Ran")
  //   if (!provider) return;
  //   console.log("HERE IN EFFECT")
  //   setProvider(provider);
  //   setProgram(new Program({ ...idl, programId }));
  // }, [provider]);
  
  const program = useMemo(() => {
    if (!provider) return null;

    setProvider(provider); // 👈 only once, here

    const programId = new PublicKey(PROGRAM_ADDRESS);

    return new Program({...idl, programId, });
  }, [provider, cluster]);

  const getSolBalance = async () => {
      if (program) {
          const provider = program?.provider
          const bal = await provider?.connection.getBalance(
              provider.publicKey!
          )
          setSolBalance(bal / LAMPORTS_PER_SOL);
      }
  }

  // Wallet's spendable USDC (the deposit source) — read straight off the ATA.
  const getUsdcBalance = async () => {
      if (!program || !walletPublicKey) return
      try {
          const ata = deriveUserUsdcAta(walletPublicKey)
          const res = await program.provider.connection.getTokenAccountBalance(ata)
          setUsdcBalance(res.value.uiAmount ?? 0)
      } catch {
          // ATA not created yet → no USDC held
          setUsdcBalance(0)
      }
  }

  const getUserOnchainData = async () => {
    console.log(walletPublicKey)
    if (walletPublicKey && program) {
      startOnchainDataLoading()
      try {
          const data = await getUserAccount(walletPublicKey, program, updateAccountInitialised);
          setPlayBalance(data?.balanceUsdc ?? 0)
      } catch (error) {
          console.error(error)
          // throw error
      } finally {
        stopOnchainDataLoading()
      }
    }
  }

  useEffect(() => {
    console.log(walletPublicKey)
    if (!walletPublicKey || !program) return;
    console.log("EFFECT RAN!!!!!!!!!")
    
    getUserOnchainData()
    getSolBalance()
    getUsdcBalance()
  }, [walletPublicKey]);

  const contextValue: SolanaContextProps = useMemo(() => ({
    program,
    solBalance,
    usdcBalance,
    playBalance,
    setPlayBalance,
    loadingOnchainData,
    getSolBalance,
    getUsdcBalance,
    getUserOnchainData,
    accountInitialised,
    clearTokenBalances,
    updateAccountInitialised
  }), [program, solBalance, usdcBalance, playBalance, loadingOnchainData, getSolBalance,
      getUsdcBalance, getUserOnchainData, accountInitialised, clearTokenBalances, updateAccountInitialised
  ])

  return (
    <solanaProgramContext.Provider value={contextValue}>
      {children}
    </solanaProgramContext.Provider>
  );
}

export {solanaProgramContext, SolanaProgramProvider}
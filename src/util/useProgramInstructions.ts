import { BN, Idl, Program } from "@coral-xyz/anchor"
import { PublicKey, SystemProgram } from "@solana/web3.js"
import { useContext } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { solanaProgramContext } from "@/contexts/anchorProvider"
import toast from "react-hot-toast"
import { appContext } from "@/contexts/appContext"
import {
    USDC_UNITS,
    USDC_MINT,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    deriveVaultTokenPda,
    deriveUserUsdcAta,
} from "@/web3/solana/constants"

const deriveUserPda = async (
    authority: PublicKey,
    programId: PublicKey
): Promise<PublicKey> => {
    const [pda] = PublicKey.findProgramAddressSync(
        [authority.toBuffer()],
        programId
    )
    return pda
}

const deriveVaultPda = async (programId: PublicKey) => {
  const [vaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    programId
  );
  return vaultPda;
};

const deriveMatchPda = (
    matchId: string,
    programId: PublicKey
): PublicKey => {
    const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from("match"), Buffer.from(matchId)],
        programId
    );
    return pda;
};

const useProgramInstructions = () => {
    const {program, updateAccountInitialised} = useContext(solanaProgramContext)
    const {appOpenModalHandler} = useContext(appContext)
    const {publicKey} = useWallet()

    
    const initializeUser = async () => {
        if (!program) {
            console.warn("Program not ready yet");
            return null;
        }

        try {
            const authority = publicKey;
            if (!authority) {
                toast.error("Wallet Not Connected")
                throw new Error("Wallet not connected")
            };

            // 🔑 Derive the user PDA (seed = signer)
            const userPda = await deriveUserPda(authority, program.programId);

            const tx = await program.methods
                .initializeUser()
                .accounts({
                    signer: authority,
                    user: userPda,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();
            
            updateAccountInitialised(true)

            console.log("Initialize user tx:", tx);
            return tx;
        } catch (error: any) {
            // Common case: account already initialized
            if (error?.message?.includes("already in use")) {
                console.warn("User account already initialized");
                toast.success("Account already initialised")
                updateAccountInitialised(true)
                return null;
            }

            toast.error("Error initializing account")
            console.error("Initialize user failed:", error);
            throw error;
        }
    };

    const getAccounts = async () => {
        if (!program) {
            console.warn("Program not ready yet");
            throw "Program Not Ready"
            // return [];
        }
        
        try {
            // @ts-ignore
            const users = await program?.account.userData.all();
            // @ts-ignore
            const formatted = users.map(u => ({
                userPda: u.publicKey.toBase58(),
                authority: u.account.authority.toBase58(),
                balanceRaw: u.account.balance.toNumber(),
                balanceUsdc: u.account.balance.toNumber() / USDC_UNITS,
                xp: u.account.xp.toNumber(),
            }));
            return formatted
        } catch (error) {
            console.error(error)
            throw error
        }
    }

    const getUserAccount = async (authority: PublicKey, program: Program<Idl> | null, updateAccountInitialised: (value: boolean) => void) => {

        if (!program) {
            console.warn("Program not ready yet");
            return null;
            // throw new Error("Program not ready");
        }

        // const toastIddd = toast

        try {
            // toastIddd.loading("Fetching On-chain account")
            // 1️⃣ Derive the PDA (must match program seeds exactly)
            const userPda = await deriveUserPda(authority, program.programId)

            // 2️⃣ Fetch the account directly
            // @ts-ignore
            const account = await program.account.userData.fetch(userPda);
            console.log("Should Call")
            updateAccountInitialised(true)
            // toastIddd.dismiss()

            // 3️⃣ Format nicely
            return {
                userPda: userPda?.toBase58(),
                authority: account.authority.toBase58(),
                balanceRaw: account.balance.toNumber(),
                balanceUsdc: account.balance.toNumber() / USDC_UNITS,
                xp: account.xp.toNumber(),
            };
        } catch (error: any) {
            console.error(error)
            if (error?.message?.includes("Account does not exist")) {
                // toastIddd.dismiss()
                // toast.error("Account Not Initialised")
                console.error(error)
                console.log("CALL ACCOUNTINIT")
                appOpenModalHandler("account_init")
                updateAccountInitialised(false)
            } else {
                // toastIddd.dismiss()
                toast.error("Error fetching on-chain data")
                updateAccountInitialised(false)
            }
            throw error;
        }
    };


    const depositToken = async (amountUsdc: number) => {
        if (!program) {
            console.warn("Program not ready yet")
            return null
        }

        try {
            const authority = publicKey

            if (!authority) throw new Error("Wallet not connected")

            const userPda = await deriveUserPda(authority, program.programId)
            const vaultPda = await deriveVaultPda(program.programId)
            const vaultTokenPda = deriveVaultTokenPda(program.programId)
            const userUsdc = deriveUserUsdcAta(authority)

            // USDC base units — 6 decimals
            const amount = new BN(Math.round(amountUsdc * USDC_UNITS))

            const tx = await program.methods
                .deposit(amount)
                .accountsPartial({
                    authority,
                    userData: userPda,
                    vault: vaultPda,
                    usdcMint: USDC_MINT,
                    userUsdc,
                    vaultToken: vaultTokenPda,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                })
                .rpc()

            console.log("Deposit tx:", tx)
            return tx
        } catch (error) {
            console.error("Deposit Failed", error)
            // throw error
        }
    }

    const withdrawToken = async (amountUsdc: number) => {
        if (!program) {
            console.warn("Program not ready yet")
            return null
        }

        try {
            const authority = publicKey
            if (!authority) {
                toast.error("Wallet Not Connected")
                throw new Error("Wallet not connected")
            }

            const userPda = await deriveUserPda(authority, program.programId)
            const vaultPda = await deriveVaultPda(program.programId)
            const vaultTokenPda = deriveVaultTokenPda(program.programId)
            const userUsdc = deriveUserUsdcAta(authority)

            // USDC base units — 6 decimals
            const amount = new BN(Math.round(amountUsdc * USDC_UNITS))

            const tx = await program.methods
            .withdraw(amount)
            .accountsPartial({
                authority,
                userData: userPda,
                vault: vaultPda,
                usdcMint: USDC_MINT,
                userUsdc,
                vaultToken: vaultTokenPda,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            })
            .rpc()

            console.log("Withdraw tx:", tx)
            return tx
        } catch (err) {
            console.error("Withdraw failed:", err)
            throw err
        }
    }

    const gameInteraction = async () => {
        if (!program) {
            console.warn("Program not ready yet");
            return null;
        }

        try {
            const authority = publicKey;
            if (!authority) {
                toast.error("Wallet Not Connected")
                throw new Error("Wallet not connected")
            };

            // 🔑 Derive PDAs (must match IDL + on-chain seeds)
            const userPda = await deriveUserPda(authority, program.programId);
            const vaultPda = await deriveVaultPda(program.programId);

            const tx = await program.methods
            .gameInteraction()
            .accounts({
                authority,              // signer
                userData: userPda,      // PDA derived from authority
                vault: vaultPda,        // PDA derived from "vault"
                systemProgram: SystemProgram.programId,
            })
            .rpc();

            console.log("Game interaction tx:", tx);
            return tx;
        } catch (error) {
            console.error("Game interaction failed:", error);
            throw error
        }
    };

    // Wager
    const createMatch = async ({
        matchId,
        wagerAmount,
        gameMode,
        gameId,
        invitedPlayer
    }: {
        matchId: string,
        wagerAmount: number,
        gameMode: 1 | 3 | 5,
        gameId: string,
        invitedPlayer?: string | null
    }) => {
        if (!program) {
            console.warn("Program not ready yet");
            return null;
        }

        try {
            const authority = publicKey;
            if (!authority) {
                toast.error("Wallet Not Connected");
                throw new Error("Wallet not connected");
            }

            const userPda = await deriveUserPda(authority, program.programId);
            const matchPda = deriveMatchPda(matchId, program.programId);
            // Wager is a PLAY/USDC amount → encode to USDC base units (6 decimals)
            const amount = Math.round(wagerAmount * USDC_UNITS)

            const invitedPlayerPubkey = invitedPlayer
            ? new PublicKey(invitedPlayer)
            : null;

            const tx = await program.methods
                .createMatch(
                    matchId,
                    new BN(amount),
                    gameMode,
                    gameId,
                    invitedPlayerPubkey
                )
                .accounts({
                    authority,
                    userData: userPda,
                    matchAccount: matchPda,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            console.log(`[createMatch] Match ${matchId} created. Tx: ${tx}`);
            return tx;

        } catch (error: any) {
            console.error("[createMatch] Failed:", error);
            toast.error("Failed to create match on-chain");
            throw error;
        }
    };

    const joinMatch = async (matchId: string) => {
        if (!program) {
            console.warn("Program not ready yet");
            return null;
        }

        try {
            const authority = publicKey;
            if (!authority) {
                toast.error("Wallet Not Connected");
                throw new Error("Wallet not connected");
            }

            const userPda = await deriveUserPda(authority, program.programId);
            const matchPda = deriveMatchPda(matchId, program.programId);

            const tx = await program.methods
                .joinMatch(matchId)
                .accounts({
                    authority,
                    userData: userPda,
                    matchAccount: matchPda,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            console.log(`[joinMatch] Joined match ${matchId}. Tx: ${tx}`);
            return tx;

        } catch (error: any) {
            console.error(error)
            if (error?.message?.includes("CannotJoinOwnMatch")) {
                toast.error("You cannot join your own match");
                return null;
            }
            if (error?.message?.includes("MatchFull")) {
                toast.error("Match is already full");
                return null;
            }
            if (error?.message?.includes("InsufficientFunds")) {
                toast.error("Insufficient balance to join this match");
                return null;
            }
            console.error("[joinMatch] Failed:", error);
            toast.error("Failed to join match on-chain");
            throw error;
        }
    };

    const cancelMatch = async (matchId: string) => {
        if (!program) {
            console.warn("Program not ready yet");
            return null;
        }

        try {
            const authority = publicKey;
            if (!authority) {
                toast.error("Wallet Not Connected");
                throw new Error("Wallet not connected");
            }

            const userPda = await deriveUserPda(authority, program.programId);
            const matchPda = deriveMatchPda(matchId, program.programId);

            const tx = await program.methods
                .cancelMatch(matchId)
                .accounts({
                    authority,
                    userData: userPda,
                    matchAccount: matchPda,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            console.log(`[cancelMatch] Match ${matchId} cancelled. Tx: ${tx}`);
            return tx;

        } catch (error: any) {
            if (error?.message?.includes("InvalidMatchStatus")) {
                toast.error("Match cannot be cancelled — it may already be active");
                throw error;
            }
            if (error?.message?.includes("NotAParticipant")) {
                toast.error("You are not the owner of this match");
                return null;
            }
            console.error("[cancelMatch] Failed:", error);
            toast.error("Failed to cancel match on-chain");
            throw error;
        }
    };

    return {
        getAccounts,
        depositToken,
        getUserAccount,
        withdrawToken,
        gameInteraction,
        initializeUser,
        createMatch,    // ← new
        joinMatch,      // ← new
        cancelMatch,    // ← new
    }
} 


export default useProgramInstructions
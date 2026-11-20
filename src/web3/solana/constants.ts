import { PublicKey } from "@solana/web3.js"

/**
 * USDC settlement config.
 *
 * The program no longer uses native SOL. All wagers / balances are denominated
 * in USDC (an SPL token) measured in base units — 6 decimals, so
 * `1 USDC = 1_000_000` units. On-chain user `balance` is an internal ledger
 * number in these base units; the physical USDC all sits in one program-owned
 * token account (`vault_token`).
 */

// Devnet USDC mint
export const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU")

// 6 decimals — divide base units by this for a human amount, multiply to encode
export const USDC_DECIMALS = 6
export const USDC_UNITS = 1_000_000

// SPL token programs (from the IDL)
export const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")

export const deriveVaultPda = (programId: PublicKey): PublicKey =>
    PublicKey.findProgramAddressSync([Buffer.from("vault")], programId)[0]

export const deriveVaultTokenPda = (programId: PublicKey): PublicKey =>
    PublicKey.findProgramAddressSync([Buffer.from("vault_token")], programId)[0]

/** Associated token account holding `owner`'s USDC (the deposit source / withdraw destination). */
export const deriveUserUsdcAta = (owner: PublicKey, mint: PublicKey = USDC_MINT): PublicKey =>
    PublicKey.findProgramAddressSync(
        [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID
    )[0]

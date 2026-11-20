import { useWallet } from "@solana/wallet-adapter-react";
import { WalletName, WalletReadyState } from "@solana/wallet-adapter-base";
import { useContext } from "react";
import { walletContext } from "@/contexts/walletContext";
import { XIcon } from "lucide-react";
import Image from "next/image";
import { SolanaMobileWalletAdapterWalletName } from "@solana-mobile/wallet-standard-mobile";
import toast from "react-hot-toast";

console.log(SolanaMobileWalletAdapterWalletName)

const CustomWalletModal = () => {
    const { wallets, select, connect, disconnect, wallet } = useWallet();
    const {walletModalVisible, closeWalletModal} = useContext(walletContext)
    const SUPPORTED_WALLETS = ["Phantom", "Solflare"];

    const mobileWalletAdapter = wallets.find(
        (w) => w.adapter.name === SolanaMobileWalletAdapterWalletName
    );

    const getWalletByName = (name: string) =>
        wallets.find((w) => w.adapter.name === name);

    // Wallets that are actually injected in the current browser (e.g. Phantom's own
    // in-app browser injects window.phantom.solana → readyState: Installed).
    const installedSupportedWallets = SUPPORTED_WALLETS
        .map((name) => getWalletByName(name))
        .filter((w): w is NonNullable<typeof w> =>
            !!w && w.adapter.readyState === WalletReadyState.Installed
        );

    // Prefer injected wallets over MWA. MWA works only in external browsers (e.g.
    // Chrome) — inside Phantom's/Solflare's own browser, MWA deep-links back to the
    // wallet app you're already inside, which either fails silently or does nothing.
    const showMwa = installedSupportedWallets.length === 0 && !!mobileWalletAdapter;

    // if wallet not open/visible return;
    if (!walletModalVisible) return null;

    const handleMwaClick = async () => {
        // remove
        // toast("MWA HANDLING")
        try {
            // Per MWA UX guidelines: if MWA is the selected wallet, connect directly
            // (must run within the trusted user-event context). Otherwise select it
            // and let `autoConnect` (set on WalletProvider) carry the user activation
            // through to connect on the next tick.
            if (wallet?.adapter?.name === SolanaMobileWalletAdapterWalletName) {
                if (wallet.adapter.connecting || wallet.adapter.connected) {
                    await disconnect();
                }
                await connect();
            } else {
                select(SolanaMobileWalletAdapterWalletName as WalletName);
            }
            closeWalletModal();
        } catch (e) {
            console.error("MWA connect failed:", e);
        }
    };

    return (
        <div className="fixed z-[100] inset-0 bg-black/50 flex items-center justify-center">
            <div className="relative bg-[#0d0d0d] text-slate-200 rounded-lg p-3 sm:p-6 w-[95%] sm:w-[400px] border border-[#00f2ff]/40">
                <button onClick={closeWalletModal} className="text-white z-[20] absolute top-2 right-4 cursor-pointer bg-red-800 rounded-full"><XIcon className="scale-[0.8]" /></button>
                <div className="mb-4 ">
                    <h2 className="text-xl font-bold text-center flex items-center justify-center gap-1">
                        <Image src={'/icons/logo_transparent.webp'} className="w-10 h-10" alt="logo" height={40} width={40} />
                        <span>Connect your wallet</span>
                    </h2>
                </div>

                {showMwa ? (
                    <div
                        onClick={handleMwaClick}
                        className="flex flex-col items-center justify-center p-4 rounded transition-all cursor-pointer hover:bg-[#1a1a1a] border border-[#00f2ff]/30"
                    >
                        {mobileWalletAdapter.adapter.icon ? (
                            <img
                                src={mobileWalletAdapter.adapter.icon}
                                alt="Use Installed Wallet"
                                className="w-10 h-10 mb-2"
                            />
                        ) : (
                            <Image
                                src={'/icons/logo_transparent.webp'}
                                alt="Use Installed Wallet"
                                className="w-10 h-10 mb-2"
                                width={40}
                                height={40}
                            />
                        )}
                        <span className="font-semibold">Use Installed Wallet</span>
                        <span className="text-xs mt-1 text-[#00f2ff]">Detected</span>
                    </div>
                ) : (
                    <ul className="flex gap-4 justify-between">
                        {SUPPORTED_WALLETS.map((walletName) => {
                            const w = getWalletByName(walletName);
                            const isDetected = !!w;

                            return (
                                <li
                                    key={walletName}
                                    onClick={() => {
                                        try {                                            
                                            // remove
                                            // toast("Normal HANDLING")
                                            // toast(`isDetected: ${isDetected}`)
                                            if (!isDetected) return;
                                            // toast(`Selected ${walletName}`)
                                            select(w!.adapter.name);
                                            closeWalletModal();
                                        } catch (e) {
                                            console.error("ERROR", e)
                                            toast.error(`Error occured while selecting ${walletName}`)
                                        }
                                    }}
                                    className={`
                                        flex flex-col items-center justify-center
                                        flex-1 p-4 rounded
                                        transition-all cursor-pointer
                                        ${isDetected
                                            ? "hover:bg-[#1a1a1a] "
                                            : "opacity-40 cursor-not-allowed "}
                                    `}
                                >
                                    <img
                                        src={
                                            w?.adapter.icon ||
                                            (walletName === "Phantom"
                                            ? "/icons/phantom_icon.svg"
                                            : "/icons/solflare_icon.svg")
                                        }
                                        alt={walletName}
                                        className="w-10 h-10 mb-2"
                                    />

                                    <span className="font-semibold">{walletName}</span>

                                    <span
                                        className={`text-xs mt-1 ${
                                            isDetected
                                            ? "text-[#00f2ff]"
                                            : "text-gray-400"
                                        }`}
                                    >
                                        {isDetected ? "Detected" : "Not Installed"}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                )}

                <p className="text-center font-extrabold text-xl mt-5 mb-2"><span className="tracking-tight neon-pink">Chain</span><span className="neon-cyan">Play</span></p>

            </div>
        </div>
    );
}

export default CustomWalletModal

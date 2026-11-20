import { appContext, RequestWalletComponentTypes } from "@/contexts/appContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { useContext, useEffect } from "react";

const useWalletListener = (callback: () => void, component: RequestWalletComponentTypes) => {
    const {requestWalletComponent} = useContext(appContext)
    const { connected, connecting, publicKey, } = useWallet();

    useEffect (() => {
        if (requestWalletComponent === component) {
            console.log(`running for ${component}, component that requested: ${requestWalletComponent}`)

            if (connected && publicKey) {
                callback()
            }
        }
    },[connected, publicKey, requestWalletComponent, component])
}

export default useWalletListener
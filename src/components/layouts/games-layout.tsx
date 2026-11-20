import React, { ReactNode, useContext, useEffect } from "react"
import WalletNotConnected from "../modals/wallet-not-connected";
import { appContext } from "@/contexts/appContext";
import WarningModal from "../modals/wallet-not-connected";
import Link from "next/link";

const GamesLayout = ({children}: {children: ReactNode}) => {
    const {isWalletSigned, walletAddress, isGuest} = useContext(appContext)

    const goFullscreen = () => {
        const elem = document.documentElement; // or document.getElementById("yourElementId")
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if ((elem as any).webkitRequestFullscreen) { // Safari
            (elem as any).webkitRequestFullscreen();
        } else if ((elem as any).msRequestFullscreen) { // IE11
            (elem as any).msRequestFullscreen();
        }
        console.log(elem)
    };

    const exitFullscreen = () => {
        if(document) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if ((document as any).webkitExitFullscreen) {
                (document as any).webkitExitFullscreen(); // Safari
            } else if ((document as any).msExitFullscreen) {
                (document as any).msExitFullscreen(); // IE11
            }
        }
    };


    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
                goFullscreen();
            }
        };
        goFullscreen()
        document.addEventListener("keydown", handleKeyPress);
        return () => {
            document.removeEventListener("keydown", handleKeyPress)

            if (document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement) {
                console.log("Exit Full screen")
                exitFullscreen();
            }
        };
    }, []);

    // const goFullscreen = () => {
    //     const elem = document.documentElement; // or document.getElementById("yourElementId")
    //     if (elem.requestFullscreen) {
    //         elem.requestFullscreen();
    //     } else if ((elem as any).webkitRequestFullscreen) { // Safari
    //         (elem as any).webkitRequestFullscreen();
    //     } else if ((elem as any).msRequestFullscreen) { // IE11
    //         (elem as any).msRequestFullscreen();
    //     }
    //     console.log(elem)
    // };

    // const exitFullscreen = () => {
    //     if(document) {
    //         if (document.exitFullscreen) {
    //             document.exitFullscreen();
    //         } else if ((document as any).webkitExitFullscreen) {
    //             (document as any).webkitExitFullscreen(); // Safari
    //         } else if ((document as any).msExitFullscreen) {
    //             (document as any).msExitFullscreen(); // IE11
    //         }
    //     }
    // };


    // useEffect(() => {
    //     const handleKeyPress = (e: KeyboardEvent) => {
    //         if (e.key === "Enter" || e.key === " ") {
    //             goFullscreen();
    //         }
    //     };
    //     goFullscreen()
    //     document.addEventListener("keydown", handleKeyPress);

    //     const handleBeforeUnload = () => {
    //         if (
    //             document.fullscreenElement ||
    //             (document as any).webkitFullscreenElement ||
    //             (document as any).msFullscreenElement
    //         ) {
    //             exitFullscreen();
    //         }
    //     };
        
    //     window.addEventListener("beforeunload", handleBeforeUnload);

    //     return () => {
    //         document.removeEventListener("keydown", handleKeyPress)
    //         window.removeEventListener("beforeunload", handleBeforeUnload);
    //     };
    // }, []);


    return (
        <div className="overflow-hidden" style={{ fontFamily: 'var(--font-press-start), cursive' }}>
            {children}
            {/* <WarningModal isOpen={!isWalletSigned || !walletAddress} handleClose={() => {}} header="Wallet Not Connected" >
                <p>wallet already linked? <br/> connect on <Link className="border-b text-teal-600 bottom-[2px] relative" href={"/"}>home</Link> ( avatar, top-right ) </p>
                <br />
                <p>wallet not linked? <br /> Link wallet on <Link className="border-b text-teal-600 bottom-[2px] relative" href={"/profile"}>profile page</Link></p>            
            </WarningModal> */}
        </div>
    )
}

export default React.memo(GamesLayout)
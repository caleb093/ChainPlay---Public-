import { ReactNode, useContext, useEffect, useState } from "react"
import { globalState } from "../../../api-feature/apiSlice"
import Logo from "../seondary/Logo"
import { appContext } from "@/contexts/appContext"
import { useRouter } from "next/navigation"
import Link from "next/link"

const ProtectLayout = ({children}: {children: ReactNode}) => {
    const {signedIn, isGuest} = useContext(appContext)
    const router = useRouter();
    const [countdown, setCountdown] = useState(5);
    const allowed = signedIn || isGuest;

    useEffect(() => {
        if (!allowed) {
        const interval = setInterval(() => {
            setCountdown((prev) => {
            if (prev <= 1) {
                clearInterval(interval);
                router.push("/");
            }
            return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
        }
    }, [allowed, router]);

    if (!allowed) {
        return (
            <div className="text-[#a1a1aa] flex justify-center items-center flex-col h-screen">
                <div className="fixed h-full inset-0 grid-bg opacity-20" />
                <Logo />    
                <h1>unrecognized player</h1>
                <p>Sign in with connect button</p>
                <p className="mt-4 z-[2]">
                    Redirecting in <span className="text-red-600">{countdown}</span>... or{" "}
                    <Link
                        href="/"
                        className="text-cyan-400 underline hover:text-cyan-300 transition"
                    >
                        Home
                    </Link>
                </p>
            </div>
        )
    }

    return (
        <>
            {children}
        </>
    )
}

export default ProtectLayout
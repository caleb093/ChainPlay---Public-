"use client";

import Navbar from "../seondary/Navbar";
import { AudioPlayer } from "../seondary/audio-player";
import { WelcomeModal } from "../modals/welcome-modal";
import type { Metadata } from "next";
import useModal from "@/util/useModal";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import Button from "../primary/Button";
import { MdQuestionMark } from "react-icons/md";
import ConnectModal from "../modals/connect-modal";
import CreateProfileModal from "../modals/create-profile";
import WelcomeInitModal from "../modals/welcome-init-modal";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { appContext } from "@/contexts/appContext";
import { notifyContext } from "@/contexts/notifyContext";
import { walletContext } from "@/contexts/walletContext";
import { useRouter } from "next/navigation";
import { useParams, useSearchParams } from "next/navigation";

export type ConnectQueryParams = {
  auth?: "discord" | "twitter"
  code?: string
}

export const metadata: Metadata = {
  title: "Chain Play - Retro Arcade Gaming Platform",
  description: "Play retro arcade games and earn crypto rewards",
};
;

export default function HomeLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const paramData = useParams()
  // const router = useRouter()
  const {signedIn, navItems, playSfx, userProfile, getIsAppModalOpen, appCloseModalHandler, appOpenModalHandler} = useContext(appContext)
  const { unseenAchievementsCount } = useContext(notifyContext)
  const {pendingNewUser, setPendingNewUser} = useContext(walletContext)
  const [errorVerifying, setErrorVerifying] = useState(false)

  const searchParams = useSearchParams()

  const auth = searchParams.get('auth')
  const code = searchParams.get('code')

  const queryData = {auth, code}

  useEffect(() => {
    if (pendingNewUser) {
      setPendingNewUser(false)
      appOpenModalHandler("account_init")
    }
  }, [pendingNewUser])

  useEffect(() => {
    if (auth && !signedIn) {
      appOpenModalHandler("connect")
    }
  },[auth])

  const handleCloseInitModal = () => {
    if (!userProfile.isOnboarded) {
      appOpenModalHandler("profile")
    } else {
      appCloseModalHandler("account_init")
    }
  }


  useEffect(() => {
      // Check if user has seen the welcome modal before
      const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
      if (!hasSeenWelcome) {
          appOpenModalHandler("welcome")
          // openWelcomeModal()
      }
  }, []);

  const handleClose = () => {
      appCloseModalHandler("welcome")
      localStorage.setItem("hasSeenWelcome", "true");
  };
  
  return (
    // <html lang="en" suppressHydrationWarning>
      <div>
      {/* <div> */}
        <div className="fixed max-[931px]:hidden top-8 left-8 z-[20]">
          <div className="flex flex-col gap-4">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const hasUnseenBadge = item.href === "/profile" && unseenAchievementsCount > 0;
              return (
                <Link
                  onMouseEnter={() => playSfx("normalInteraction")}
                  key={item.href}
                  href={item.href}
                  className={twMerge(
                    "group relative cursor-pointer flex items-center justify-center w-16 h-16 rounded-full retro-card transition-all duration-300 hover:scale-110 hover:rotate-12"
                  )}
                  style={{
                    animationDelay: `${index * 0.2}s`,
                    animationDuration: "3s",
                    ...item.bgStyle,
                  }}
                >
                  <Icon className={twMerge("h-6 w-6 transition-colors", item.color)} />
                  {hasUnseenBadge && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-[#07071c]" />
                  )}
                  <div className="absolute pointer-events-none left-20 bg-black/80 text-white px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
            
        <Navbar modalHandler={appOpenModalHandler} />
        {children}
        <AudioPlayer />
        {errorVerifying && <div className=" bg-[#511b86] text-white rounded-l-xl fixed top-[20px] right-0 z-[26] px-4 py-1">
          <p >Error verifying <span onClick={() => {window.location.reload()}} className="underline text-red-600 cursor-pointer ml-1">Retry</span></p>
        </div>}
        <CreateProfileModal isOpen={getIsAppModalOpen("profile")} onClose={() => appCloseModalHandler("profile")} />
        {/* @ts-ignore */}
        <ConnectModal setErrorVerifying={setErrorVerifying} queryData={queryData} isOpen={getIsAppModalOpen("connect")} onClose={() => appCloseModalHandler("connect")} openProfile={appOpenModalHandler} onNewUser={() => {appOpenModalHandler("account_init")}} />
        <WelcomeInitModal isOpen={getIsAppModalOpen("account_init")} onClose={handleCloseInitModal} />
        <WelcomeModal isOpen={getIsAppModalOpen("welcome")} handleClose={handleClose} />
        <div className="fixed bottom-4 right-4 z-[21]" onClick={() => appOpenModalHandler("welcome")}>
          <Button
            className="rounded-full bg-background/80 backdrop-blur-sm border-cyan-500/50 hover:border-cyan-400 retro-glow px-3 py-3"
          >
            <MdQuestionMark />
          </Button>
        </div>
      </div>
    // </html>
  );
}

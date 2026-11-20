import Link from "next/link";
import Button from "../primary/Button";
import { useRouter, usePathname } from "next/navigation";
import {twMerge} from "tailwind-merge"
import gsap from "gsap";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { appContext } from "@/contexts/appContext";
import { notifyContext } from "@/contexts/notifyContext";
import { useDropdown } from "@/util/hooks";
import useClickOutside from "@/util/useClickOutside";
import Image from "next/image";
import { useWallet } from "@solana/wallet-adapter-react";
import { usePostConfirmWalletMutation } from "../../../api-feature/apiSlice";
import toast from "react-hot-toast";
import useWalletListener from "@/util/useWalletListener";
import { solanaProgramContext } from "@/contexts/anchorProvider";
import { User2 } from "lucide-react";

const Navbar = ({modalHandler}: {modalHandler: (type: "connect" | "welcome" | "profile") => void}) => {
  const router = useRouter();
  const [openNav, setOpenNav] = useState(false)
  const {dropOpen, toggleDropdown, openDropDown, closeDropDown} = useDropdown()
  const dropDownRef = useClickOutside<HTMLDivElement>(() => closeDropDown());
  const pathname = usePathname(); // string | null
  // const pathname = router.pathname;
  const {showConnectWalletModal, handleWalletSign, walletAddress, userProfile, handleLogOut, signedIn, navItems, isWalletSigned, isGuest, handleGuestLogout} = useContext(appContext)
  const {playBalance} = useContext(solanaProgramContext)
  const { streak, unseenAchievementsCount } = useContext(notifyContext)
  const showStreak = signedIn && (streak?.current ?? 0) >= 3
  const [confirmWallet] = usePostConfirmWalletMutation()
  const {disconnect, wallet, connected, publicKey} = useWallet()

  const walletCallback = useCallback(() => {

    if (!signedIn) return

    if (!isWalletSigned) {
      // @ts-ignore
      console.log("✅ Connected to", publicKey?.toBase58());
      // @ts-ignore
      const address = publicKey?.toBase58()

      const toastId = toast

      toastId.loading("confirming wallet")

      // @ts-ignore
      confirmWallet({walletAddress: address}).unwrap()
        .then(fulfilled => {
          toastId.dismiss()
          toast.success("Confirmed")
          handleWalletSign()
        })
        .catch((rejected: {data: {message: string}}) =>{
          disconnect()
          toastId.dismiss()
          toast.error(rejected?.data?.message ?? "Error occured", {duration: 5000})
          console.error(rejected)
        })
    }
  },[signedIn, isWalletSigned, publicKey])

  useWalletListener(walletCallback, "navbar")

  const toggleNav = () => {
    const openAnim = gsap.timeline()
      .to(".phone-nav", {y: 0})
      .to(".hamburger-line-top", {rotate: "45deg", y: 1, height: "2px"}, "<")
      .to(".hamburger-line-bottom", {rotate: "-45deg", y: "-5.5px", height: "2px"}, "<")

    const closeAnim = gsap.timeline()
      .to(".phone-nav", {y: "-130%"})
      .to(".hamburger-line-top", {rotate: "0deg", y: 0, height: "1px"}, "<")
      .to(".hamburger-line-bottom", {rotate: "0deg", y: 0, height: "1px"}, "<")

    openNav && openAnim.play()
    !openNav && closeAnim.reverse()
    
    setOpenNav(prev => !prev)
  }

  return (
    // <nav className="fixed px-4 top-0 z-20 w-full border-b border-purple-500/30 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <nav className="fixed w-auto max-[931px]:bg-background/80 max-[931px]:backdrop-blur max-[931px]:w-full px-4 top-0 z-20 right-0  ">

      {/* DESKTOP */}
      <div className="hidden min-[931px]:flex h-16 items-center justify-between">
        <div className="flex items-center relative gap-6 ml-auto ">
          {signedIn && <div className="text-sm bg-[#12102d] border border-[#2f2b44] px-5 py-2.5 font-bold text-accent neon-pink">
            {playBalance} PLAY
          </div>}
          {showStreak && (
            <div
              className="relative flex items-center justify-center text-[1.5rem] select-none cursor-default"
              title={`${streak!.current}-day streak`}
            >
              <span className="animate-fire-flicker inline-block origin-bottom">🔥</span>
              <span
                className="absolute inset-0 flex items-center justify-center text-[0.55rem] font-black leading-none"
                style={{ color: "#fff", textShadow: "0 0 4px #000", paddingTop: "2px" }}
              >
                {streak!.current}
              </span>
            </div>
          )}
          {/* <Button onClick={() => {walletAddress ? handleLogOut() : showConnectWalletModal()}} className="retro-button">{walletAddress ? `${walletAddress.substring(0, 3)}...${walletAddress.substring(walletAddress.length - 3, walletAddress.length)}` : "Connect"}</Button> */}
          {signedIn ?
            <div className="">
              <div onClick={openDropDown} className="bg-[#191414] w-12 h-12 overflow-hidden border border-[#00ffff] rounded-full cursor-pointer flex items-center justify-center">
                <Image src={userProfile?.avatar ?? "/user-avatar.png"} alt="avatar" height={2000} width={2000}/>
              </div>
              {/* Dropdown */}
              {dropOpen && <div onMouseDown={(e) => e.stopPropagation()} ref={dropDownRef} className="absolute w-[14em] right-0 bg-[#120d2a] border-black border text-[0.9em] pt-1 rounded-xl flex flex-col text-[#00ffff] mt-2" >
                <button onClick={handleLogOut} className="py-1.5 px-2 cursor-pointer bg-red-600 rounded-md text-white hover:bg-red-600/80 mx-2 my-1 " >Logout</button>
                {isWalletSigned && walletAddress ?
                  <p className="py-3 text-center">{walletAddress?.substring(0, 3)}...{walletAddress?.substring(walletAddress?.length - 4, walletAddress?.length)}</p> :
                  <button onClick={() => {showConnectWalletModal("navbar"), closeDropDown()}} className="py-1.5 px-2 cursor-pointer hover:bg-slate-400/10 retro-button text-white mx-2 my-2 rounded-md " >Connect wallet</button>
                }
              </div>}
            </div>
          : isGuest ?
            <div className="">
              <div onClick={openDropDown} className="flex items-center gap-2 px-3 py-2 border border-[#555] rounded-md cursor-pointer text-[#888] hover:brightness-125 text-sm">
                <User2 className="h-4 w-4" />
                <span>Guest</span>
              </div>
              {dropOpen && <div onMouseDown={(e) => e.stopPropagation()} ref={dropDownRef} className="absolute w-[14em] right-0 bg-[#120d2a] border-black border text-[0.9em] pt-1 rounded-xl flex flex-col text-[#00ffff] mt-2">
                <button onClick={() => { handleGuestLogout(); closeDropDown(); }} className="py-1.5 px-2 cursor-pointer bg-red-600/80 rounded-md text-white hover:bg-red-600 mx-2 my-1">Exit Guest Mode</button>
                <p className="py-2 px-2 text-[#555] text-center text-xs">Connect to save progress</p>
              </div>}
            </div>
          : <Button onClick={() => {modalHandler("connect")}} className="retro-button">Connect</Button>}
          </div>

      </div>

       {/* MOBILE */}
      <div className="flex min-[931px]:hidden justify-between items-center h-16 ">
        <div className="flex justify-between items-center w-full relative z-[6]">
          <div className="flex items-center gap-2">
            <div  onClick={toggleNav} className="flex flex-col gap-2 cursor-pointer z-[2]">
              <div style={{ boxShadow: "0 0 16px #00ffe1" }} className="hamburger-line-top h-[3px] w-6 bg-[#00ffe1]" />
              <div style={{ boxShadow: "0 0 16px #00ffe1" }} className="hamburger-line-bottom h-[3px] w-6 bg-[#00ffe1]" />
            </div>
            {/* <Link href="/" className="flex items-center">
              <Image src={'/icons/logo_transparent.png'} className="w-16 h-16" alt="logo" height={1000} width={1000} />
              <span className="text-2xl font-bold tracking-tight neon-purple">
                C<span className="neon-cyan pl-1">P</span>
              </span>
            </Link> */}
          </div>
          
          {signedIn ?
            <div className="flex items-center gap-3 ">
              <div className="text-[0.8em] bg-[#12102d] border border-[#2f2b44] px-4 py-2 font-bold text-accent neon-pink">
                {playBalance} PLAY
              </div>
              {showStreak && (
                <div
                  className="relative flex items-center justify-center text-[1.4rem] select-none cursor-default"
                  title={`${streak!.current}-day streak`}
                >
                  <span className="animate-fire-flicker inline-block origin-bottom">🔥</span>
                  <span
                    className="absolute inset-0 flex items-center justify-center text-[0.5rem] font-black leading-none"
                    style={{ color: "#fff", textShadow: "0 0 4px #000", paddingTop: "2px" }}
                  >
                    {streak!.current}
                  </span>
                </div>
              )}
              <div onClick={openDropDown} className="bg-black w-12 h-12 overflow-hidden border border-[#00ffff] rounded-full cursor-pointer">
                <Image src={userProfile?.avatar ?? "/user-avatar.png"} alt="avatar" height={2000} width={2000}/>
              </div>
              {/* Dropdown */}
              {dropOpen && <div ref={dropDownRef} className="absolute w-[14em] right-0 bg-[#120d2a] border-black border text-[0.9em] flex flex-col text-[#00ffff] top-16" >
                <button onClick={handleLogOut} className="py-1.5 px-2 cursor-pointer bg-red-600 rounded-md text-white hover:bg-red-600/80 mx-2 my-1 " >Logout</button>
                {isWalletSigned && walletAddress ?
                  <p className="py-3 text-center">{walletAddress?.substring(0, 3)}...{walletAddress?.substring(walletAddress?.length - 4, walletAddress?.length)}</p> :
                  <button onClick={() => {showConnectWalletModal("navbar"), closeDropDown()}} className="py-1.5 px-2 cursor-pointer hover:bg-slate-400/10 retro-button text-white mx-2 my-2 rounded-md " >Connect wallet</button>
                }
              </div>}
            </div>
          : isGuest ?
            <div className="flex items-center">
              <div onClick={openDropDown} className="flex items-center gap-2 px-3 py-2 border border-[#555] rounded-md cursor-pointer text-[#888] hover:brightness-125 text-sm">
                <User2 className="h-4 w-4" />
                <span>Guest</span>
              </div>
              {dropOpen && <div ref={dropDownRef} className="absolute w-[14em] right-0 bg-[#120d2a] border-black border text-[0.9em] flex flex-col text-[#00ffff] top-16">
                <button onClick={() => { handleGuestLogout(); closeDropDown(); }} className="py-1.5 px-2 cursor-pointer bg-red-600/80 rounded-md text-white hover:bg-red-600 mx-2 my-1">Exit Guest Mode</button>
                <p className="py-2 px-2 text-[#555] text-center text-xs">Connect to save progress</p>
              </div>}
            </div>
          : <Button onClick={() => {modalHandler("connect")}} className="retro-button">Connect</Button>}
          
        </div>
        
        <div className="phone-nav -translate-y-[130%] absolute bg-background w-full top-16 left-0 h-screen z-[5]">
          <div className="flex flex-col gap-8 text-[1.2em] px-5 pt-5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const hasUnseenBadge = item.href === "/profile" && unseenAchievementsCount > 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={twMerge(`text-[#a1a1aa] hover:text-white flex items-center gap-2 ${pathname === item.href && "neon-cyan"}`)}
                >
                  <span className="relative">
                    <Icon className={twMerge("h-6 w-6", item.color)} />
                    {hasUnseenBadge && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 ring-1 ring-[#07071c]" />
                    )}
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </div>
          <p className="absolute bottom-20 right-5">
            <span className="text-xl font-bold tracking-tight neon-purple">
              Chain<span className="neon-cyan">Play</span>
            </span>
          </p>
        </div>
      </div>
    </nav>
  );
}

export default React.memo(Navbar)
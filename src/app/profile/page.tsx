"use client"
import HomeLayout from "@/components/layouts/home-layout"
import { Card, CardContent } from "@/components/seondary/card"
import { Copy, Lock, Trophy, Upload } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/seondary/Avatar"
import Button from "@/components/primary/Button"
import { useCallback, useContext, useEffect, useState } from "react"
import { twMerge } from "tailwind-merge"
import { appContext } from "@/contexts/appContext"
import ProtectLayout from "@/components/layouts/protect-layout"
import { useWallet } from "@solana/wallet-adapter-react"
import { useLazyGetLinkNonceQuery, usePostLinkVerifyNonceMutation } from "../../../api-feature/apiSlice"
import { globalState } from "../../../api-feature/apiSlice"
import useImageUpload from "@/util/useImageUpload"
import Loading from "@/components/seondary/Loading"
import { ApiType } from "../../../api-feature/types"
import toast from "react-hot-toast"
import { useLoading } from "@/util/hooks"
import useWalletListener from "@/util/useWalletListener"
import { solanaProgramContext } from "@/contexts/anchorProvider"
import { notifyContext, getAchievementImage, AchievementItem } from "@/contexts/notifyContext"
import AchievementDetailModal from "@/components/modals/achievement-detail-modal"
import ReportModal from "@/components/modals/report-modal"
import Image from "next/image"
import Link from "next/link"

interface nonceGetApi extends ApiType {
    data: {nonce: string}
}

const Profile = () => {
  const {selectedImage, handleSelectImage, fileIsTooLarge} = useImageUpload()
  const {loading: avatarLoading, startLoading: startAvatarLoading, stopLoading: stopAvatarLoading} = useLoading()
  const [copySuccess, setCopySuccess] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [triggerGetNonce, {data: nonceData, status: nonceStatus, error: nonceError}] = useLazyGetLinkNonceQuery<nonceGetApi>()
  const [verifyNonce] = usePostLinkVerifyNonceMutation()
  const nonce = nonceData?.nonce;

  // Clear the nav red dot as soon as the user lands on this page
  useEffect(() => { clearUnseenAchievements() }, [clearUnseenAchievements])

  const handleSignNonce = async () => { 
      const toastId = toast;

      toastId.loading("Verifying wallet")

      try {
          if (signMessage) {
              const message = new TextEncoder().encode(nonce);
              const signature = await signMessage(message) 
              const signatureBytes = Array.from(signature);
              // @ts-ignore
              const response = await verifyNonce({walletAddress: walletAddress, signature: signatureBytes, nonce: nonceData.nonce}).unwrap()
              toastId.dismiss()
              toast.success("wallet verified!")
              handleWalletSign()
              syncUserProfile({walletAddress: `${walletAddress?.substring(0, 3)}...${walletAddress?.substring(walletAddress?.length - 4, walletAddress?.length)}`})
          }
      }  catch(error: unknown) {
          toastId.dismiss()
          // @ts-ignore
          toast.error(error?.data?.error?.code === 11000 ? "wallet linked to an existing account" : "Error verifying wallet")
          disconnect()
      }
  };

  const handleGetNonce = useCallback(() => {
    if (walletAddress) {
      triggerGetNonce({address: walletAddress})
    } else {
      disconnect()
    }
  },[triggerGetNonce, walletAddress])

  const walletCallback = useCallback(() => {
    if (isWalletSigned) return;

    handleGetNonce()
  },[isWalletSigned, handleGetNonce, walletAddress])

  useWalletListener(walletCallback, "profile")
  // useEffect(() => {
  //   console.log(walletAddress)
  //   if (walletAddress) return;

  //   if (connected && publicKey) {
  //       console.log("✅ Connected to", publicKey.toBase58());
  //       handleGetNonce()
  //   }
  // }, [connected, publicKey, walletAddress]);
  
  useEffect(() => {
    const toastId = toast
    
    if (nonceStatus === "rejected") {
      toastId.dismiss()
      toast.error("Error occured")
      disconnect()
    } else if (nonceStatus === "pending") {
      toastId.loading("Getting nonce")
    } else if (nonceStatus === "fulfilled") {
      toastId.dismiss()
      handleSignNonce()
      // window.open(data?.url, "_self")
    }
  },[nonceStatus])
  
  
  return (
    <>
      <HomeLayout>
        <ProtectLayout>
        <div className="fixed h-full inset-0 grid-bg opacity-20" />
        <div className="min-h-screen bg-background pt-20 pb-8 text-[#a1a1aa] ">
          <div className="pt-32 pb-16 px-8">
            <div className="max-w-7xl mx-auto">
              {/* Hero Section with Avatar */}
              <div className="text-center mb-16 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-96 h-96 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 blur-3xl" />
                </div>

                <div className="relative z-10">
                  <div className="mb-8">
                    <div className="relative group inline-block">
                      <Avatar className="h-32 w-32 retro-glow mx-auto border-4 border-secondary/50">
                        <AvatarImage src={selectedImage || userProfile?.avatar} alt={username} />
                        <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-purple-600 to-cyan-600">
                          {username?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {avatarLoading ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                              <Loading small color="white" />
                          </div>
                      ) : (
                          <label
                              htmlFor="avatar-upload"
                              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                              <Upload className="h-8 w-8 text-white" />
                          </label>
                      )}
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={avatarLoading}
                      />
                      {fileIsTooLarge && (
                          <p className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[11px] text-red-500 whitespace-nowrap">
                              ❗File too large (4MB max)
                          </p>
                      )}
                    </div>
                  </div>

                  {/* Referral Code Display */}
                  <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30 w-full sm:w-auto">
                    <div className="text-left">
                      <p className="text-sm text-secondary mb-1">
                        Your Referral Code
                      </p>
                      <p className="text-2xl font-mono neon-cyan">{referralCode}</p>
                    </div>
                    <Button
                      onClick={handleCopyReferral}
                      className={twMerge(
                        "flex items-center justify-center retro-button h-12 px-6 w-full sm:w-auto",
                        copySuccess && "bg-green-600 hover:bg-green-700",
                      )}
                    >
                      <Copy className="h-5 w-5 mr-2" />
                      {copySuccess ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                <div className="retro-card text-center p-6 rounded-xl">
                  <div className="text-3xl font-bold neon-purple mb-2">{userProfile?.totalGamesCount ?? 0}</div>
                  <div className="text-sm text-muted-foreground">Games Played</div>
                </div>
                <div className="retro-card text-center p-6 rounded-xl">
                  <div className="text-3xl font-bold neon-cyan mb-2">{userProfile?.totalXp?.toFixed(2) ?? 0}</div>
                  <div className="text-sm text-muted-foreground">
                    XP count
                  </div>
                </div>
                <div className="retro-card text-center p-6 rounded-xl">
                  <div className="text-3xl font-bold neon-pink mb-2">{playBalance}</div>
                  <div className="text-sm text-muted-foreground">
                    PLAY Balance
                  </div>
                </div>
              </div>

              {/* Achievements Section */}
              <div className="mb-16">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold neon-pink mb-4">Achievements</h2>
                  <p className="text-muted-foreground text-lg">
                    Show off your gaming prowess with these exclusive badges
                  </p>
                  {/* Streak bar */}
                  {streak && (
                    <div className="inline-flex items-center gap-3 mt-4 px-5 py-2.5 rounded-xl"
                      style={{ background: "rgba(255,140,0,0.08)", border: "1px solid rgba(255,140,0,0.3)" }}>
                      <span className="text-2xl">🔥</span>
                      <div className="text-left">
                        <p className="text-sm font-black text-orange-400">
                          {streak.current}-day streak
                        </p>
                        <p className="text-xs text-slate-500">
                          Longest: {streak.longest} days
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {achievementsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loading small color="white" />
                  </div>
                ) : achievements.length === 0 ? (
                  <div className="text-center text-slate-500 py-12">No achievement data yet.</div>
                ) : (() => {
                  const chainPlayer = achievements.find(a => a.id === "chain_player")
                  const rest = achievements.filter(a => a.id !== "chain_player")
                  return (
                    <div className="max-w-5xl mx-auto space-y-8">

                      {/* ── Chain Player — featured solo row ── */}
                      {chainPlayer && (
                        <div className="flex justify-center">
                          <div
                            onClick={() => chainPlayer.unlocked && setSelectedAchievement(chainPlayer)}
                            className={twMerge(
                              "relative flex flex-col items-center text-center p-8 rounded-2xl transition-all duration-300 w-64",
                              chainPlayer.unlocked ? "cursor-pointer hover:scale-105" : "opacity-70",
                            )}
                            style={{
                              border: chainPlayer.unlocked
                                ? "2px solid rgba(239,68,68,0.7)"
                                : "2px solid rgba(239,68,68,0.2)",
                              background: chainPlayer.unlocked
                                ? "radial-gradient(ellipse at center, rgba(239,68,68,0.18) 0%, rgba(239,68,68,0.06) 60%, transparent 100%)"
                                : "radial-gradient(ellipse at center, rgba(239,68,68,0.06) 0%, transparent 70%)",
                              boxShadow: chainPlayer.unlocked
                                ? "0 0 40px rgba(239,68,68,0.35), inset 0 0 30px rgba(239,68,68,0.08)"
                                : "0 0 16px rgba(239,68,68,0.08)",
                            }}
                          >
                            {/* Crown */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl">👑</div>

                            {/* Lock icon */}
                            {!chainPlayer.unlocked && (
                              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center">
                                <Lock className="w-3 h-3 text-slate-500" />
                              </div>
                            )}

                            {/* Badge image */}
                            <div
                              className={twMerge("w-28 h-28 rounded-full mb-4 overflow-hidden", !chainPlayer.unlocked && "grayscale")}
                              style={chainPlayer.unlocked ? {
                                filter: "drop-shadow(0 0 16px rgba(239,68,68,0.7))",
                              } : undefined}
                            >
                              <Image
                                src={getAchievementImage(chainPlayer.id)}
                                alt={chainPlayer.name}
                                width={112}
                                height={112}
                                className="object-cover w-full h-full"
                              />
                            </div>

                            <p className={twMerge(
                              "text-sm font-black tracking-widest uppercase mb-1",
                              chainPlayer.unlocked ? "text-red-400" : "text-slate-500",
                            )}
                              style={chainPlayer.unlocked ? { textShadow: "0 0 10px rgba(239,68,68,0.8)" } : undefined}
                            >
                              {chainPlayer.name}
                            </p>

                            {chainPlayer.unlocked && chainPlayer.unlockedAt ? (
                              <p className="text-[11px] text-slate-500">
                                {new Date(chainPlayer.unlockedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                              </p>
                            ) : !chainPlayer.unlocked ? (
                              <p className="text-[10px] text-slate-600 leading-tight mt-1">{chainPlayer.description}</p>
                            ) : null}
                          </div>
                        </div>
    
                  )
                })()
              </div>
              
              {/* Help & Reports */}
              <div className="max-w-4xl mx-auto mt-12">
                <h3 className="text-2xl font-bold neon-pink mb-8 text-center">
                  Help &amp; Reports
                </h3>
                <div className="retro-card rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-white font-semibold mb-1">Report an Issue</p>
                    <p className="text-sm text-muted-foreground">
                      Encountered a bug, cheating, or harassment? Let us know.
                    </p>
                  </div>
                  <button
                    onClick={() => setReportOpen(true)}
                    className="retro-button shrink-0 px-5 py-2.5 text-sm text-white"
                  >
                    Submit Report
                  </button>
                </div>

                <div className="retro-card rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
                  <div>
                    <p className="text-white font-semibold mb-1">My Incidents</p>
                    <p className="text-sm text-muted-foreground">
                      Track the status of disputes and reports you&apos;ve filed.
                    </p>
                  </div>
                  <Link
                    href="/incidents"
                    className="retro-button shrink-0 px-5 py-2.5 text-sm text-center text-white"
                  >
                    View Incidents
                  </Link>
                </div>
              </div>

             
                    <div key={index} className="retro-card rounded-lg">
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
                            <Trophy className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">
                              {data.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {data?.info}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {/* <p className="font-bold ">{data.isConnected ? <span className="neon-cyan">Connected</span> : "Not Connected"}</p> */}
                          {data.isConnected ? 
                            <p className="font-bold "><span className="neon-cyan">Linked</span></p> :
                            <Button className="bg-slate-800 text-[0.9em] hover:bg-slate-600">coming soon</Button>}
                          
                          {/* <p className="text-sm text-accent">{data.rank}</p> */}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        </ProtectLayout>
      </HomeLayout>

      <ReportModal isOpen={reportOpen} onClose={() => setReportOpen(false)} />

      {selectedAchievement && (
        <AchievementDetailModal
          achievement={selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
        />
      )}
    </>
  )
}

export default Profile
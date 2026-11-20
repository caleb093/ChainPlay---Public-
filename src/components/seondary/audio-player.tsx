"use client";

import { useState, useEffect, useRef, useContext } from "react";
import { Volume2, VolumeX } from "lucide-react";
import Button from "../primary/Button";
import { appContext } from "@/contexts/appContext";
// import { Button } from "./ui/button";

export function AudioPlayer() {
  const {toggleMute , isMuted} = useContext(appContext)

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Button
        // variant="outline"
        // size="icon"
        className="rounded-full bg-background/80 backdrop-blur-sm border-cyan-500/50 hover:border-cyan-400 retro-glow px-3 py-3"
        onClick={toggleMute}
      >
        {isMuted ? (
          <VolumeX className="h-5 w-5 text-cyan-400" />
        ) : (
          <Volume2 className="h-5 w-5 text-cyan-400 pulse" />
        )}
      </Button>
    </div>
  );
}



    // 🪄 Unlock audio on first user interaction
  // useEffect(() => {
  //   const unlockAudio = () => {
  //     console.log("UNLOCK AUDIO")
  //     if (audioRef.current && isMuted) {
  //       audioRef.current.muted = false;
  //       setIsMuted(false);
  //       console.log("🔊 Audio unmuted after interaction");
  //     }
  //     // Remove listeners once triggered
  //     document.removeEventListener("click", unlockAudio);
  //     document.removeEventListener("scroll", unlockAudio);
  //     document.removeEventListener("keydown", unlockAudio);
  //     document.removeEventListener("mousemove", unlockAudio);
  //     document.removeEventListener("touchstart", unlockAudio);
  //   };

  //   document.addEventListener("click", unlockAudio);
  //   document.addEventListener("scroll", unlockAudio);
  //   document.addEventListener("keydown", unlockAudio);
  //   document.addEventListener("mousemove", unlockAudio);
  //   document.addEventListener("touchstart", unlockAudio);

  //   return () => {
  //     document.removeEventListener("click", unlockAudio);
  //     document.removeEventListener("scroll", unlockAudio);
  //     document.removeEventListener("keydown", unlockAudio);
  //     document.removeEventListener("mousemove", unlockAudio);
  //     document.removeEventListener("touchstart", unlockAudio);
  //   };
  // }, [isMuted]);
  
  // useEffect(() => {
  //   if (audioRef.current) {
  //     audioRef.current.volume = 0.3;
  //     audioRef.current.muted = isMuted;
  //     audioRef.current.src = songs[currentSongIndex];
  //   }
  // }, [isMuted, currentSongIndex]);

  // // ⏭️ Move to next song on end
  // useEffect(() => {
  //   if (audioRef.current) {
  //     const handleEnded = () => {
  //       setCurrentSongIndex((prev) => (prev + 1) % songs.length); // loop back
  //     };

  //     audioRef.current.addEventListener("ended", handleEnded);
  //     return () => {
  //       audioRef.current?.removeEventListener("ended", handleEnded);
  //     };
  //   }
  // }, []);

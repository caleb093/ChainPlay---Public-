import { useState, useEffect } from "react";
import Button from "../primary/Button";
import Modal from "../seondary/modal";
import useModal from "@/util/useModal";

export function WelcomeModal({handleClose, isOpen}: {handleClose: ()=> void, isOpen: boolean}) {

  return (
    <Modal showBot isOpen={isOpen} onClose={handleClose} containerClassname="md:w-[28em]">
        <h1 className="text-2xl font-bold text-center neon-purple leading-none tracking-tight">
        Welcome to ChainPlay
        </h1>
        <h1 className="text-center text-[#00f8fa] mt-2">How It Works</h1>
        <div className="space-y-4 py-4 mt-0">
            <ul className="space-y-5">
            <li className="flex items-start gap-2">
                <div className="h-6 w-6 flex items-center justify-center rounded-full bg-primary/20 text-primary text-sm">
                1
                </div>
                <p>Play Games to grow and unlock rewards</p>
            </li>
            <li className="flex items-start gap-2">
                <div className="h-6 w-6 flex items-center justify-center rounded-full bg-primary/20 text-primary text-sm">
                2
                </div>
                <p>Swap your tokens for <span className="text-[#00f8fa]">PLAY</span></p>
            </li>
            <li className="flex items-start gap-2">
                <div className="h-6 w-6 flex items-center justify-center rounded-full bg-primary/20 text-primary text-sm">
                3
                </div>
                <p>Use <span className="text-[#00f8fa]">PLAY</span> to access the arcade</p>
            </li>
            <li className="flex items-start gap-2">
                <div className="h-6 w-6 flex items-center justify-center rounded-full bg-primary/20 text-primary text-sm">
                4
                </div>
                <p>Wager <span className="text-[#00f8fa]">PLAY</span> against other players to earn</p>
            </li>
            <li className="flex items-start gap-2">
                <div className="h-6 w-6 flex items-center justify-center rounded-full bg-primary/20 text-primary text-sm">
                5
                </div>
                <p>Build <span className="text-red-600 font-bold">Rivalries</span> with other players</p>
            </li>
            </ul>
        </div>
        <Button onClick={handleClose} className="w-full retro-button mt-3">
            Let's Play!
        </Button>
    </Modal>
  );
}

import { ReactNode } from "react"
import { Inter } from "next/font/google";
import Link from "next/link";

const interfont = Inter({
    variable: "--",
    subsets: ["latin"]
});


const GamePlayer = ({children, movePlayer}: {children: ReactNode, movePlayer: (direction: "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight") => void}) => {
    if (window.innerWidth > 429) return children;

    return (
        <div className={`${interfont.className} h-screen w-screen fixed top-0 left-0 bg-[#101228]`}>
            <div className="border-slate-500 border-b-2 flex justify-between">
                <div className="border-slate-500 border-t-2 border-r-2 w-5 " />
                <p className="mr-auto ml-2 py-2 text-slate-300 font-[900]">Chain Play</p>
                <div className="border-slate-500 border-t-2 border-l-2 w-5 " />
            </div>
            <div className="bg-[#23252d] border-slate-500 border-b-2  w-full pt-2 px-4">
                {/* SCREEN */}
                {/* <div className="bg-red-500 w-full h-full absolute rounded-full left-0 top-[-40vh] scale-x-[2.5]" /> */}
                <div className="bg-[#929d97] relative z-[2] rounded-md py-1 ">
                    {children} 
                </div>
                <p className="text-[0.8em] my-auto pt-1 pb-2"><span className="text-[#9b4bf7]">Chain</span> <span className="text-[#00ffff]">Play</span></p>
            </div>
            <div className="flex justify-between px-2 pt-3 ">
                {/* BUTTONS */}
                <div className="flex justify-center items-center flex-col border-2 border-slate-500 rounded-full overflow-hidden">
                    <div onClick={() => movePlayer("ArrowUp")} className="bg-slate-800 h-11 w-11 active:scale-[1.1]" />
                    <div className="flex py-0">
                        <div onClick={() => movePlayer("ArrowLeft")} className="bg-slate-800 h-11 w-11 active:scale-[1.1]" />
                        <div className="bg-slate-500 w-11 h-full " />
                        <div onClick={() => movePlayer("ArrowRight")} className="bg-slate-800 h-11 w-11 active:scale-[1.1]" />
                    </div>
                    <div onClick={() => movePlayer("ArrowDown")} className="bg-slate-800 h-11 w-11 active:scale-[1.1]" />
                </div>
                <div className="my-auto flex flex-col gap-4">
                    <Link href={"/"}>
                        <div className="flex flex-col items-center text-[0.7em] text-slate-300">
                            <div className="bg-slate-500 w-[5em] h-2.5 rounded-lg mb-1" />
                            <p>Exit</p>
                        </div>
                    </Link>
                    <div className="flex flex-col items-center text-[0.7em] text-slate-300">
                        <div className="bg-slate-500 w-[5em] h-2.5 rounded-lg mb-1" />
                        <p>Leaderboard</p>
                    </div>
                </div>
            </div>

            {/* SPEAKER */}
            <div className="absolute bottom-5 right-5 flex gap-2 rotate-[-30deg]">
                <div className="w-[7px] h-16 bg-slate-800 rounded-md" />
                <div className="w-[7px] h-16 bg-slate-800 rounded-md" />
                <div className="w-[7px] h-16 bg-slate-800 rounded-md" />
                <div className="w-[7px] h-16 bg-slate-800 rounded-md" />
                <div className="w-[7px] h-16 bg-slate-800 rounded-md" />
                <div className="w-[7px] h-16 bg-slate-800 rounded-md" />
            </div>
        </div>
    )
}

export default GamePlayer
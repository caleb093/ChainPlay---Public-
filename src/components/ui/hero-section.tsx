import Image from "next/image";
import Link from "../../../node_modules/next/link";
import Button from "../primary/Button";
import Logo from "../seondary/Logo";
import { useRouter } from "next/navigation";

// import { Button } from "./ui/button";
// import Link from "next/link";
// import Link

export function HeroSection() {
  const router = useRouter();
  
  return ( 
    <section className="relative overflow-hidden bg-background pt-24 pb-12">
    {/* // <section className="relative overflow-hidden bg-midnight pt-24 pb-12"> */}
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="scanline" />
      <div className=" relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <Logo />
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl neon-purple mb-2">
            Chain<span className="neon-pink">Play</span>{" "}
          </h1>
          <p className="mt-3 text-xl text-cyan-300 retro-text">
              Tap In Arcadians!
            <br />
            {/* <span className="text-pink-400">
              Play. Wager. Compete
            </span> */}
          </p>
          <div className="mt-12 px-5 flex flex-wrap justify-center gap-6">
            {/* <Link href={"/swap"} > */}
              <Button
              //   asChild
              //   size="lg"
              //   variant="outline"
                onClick={() => router.push("/swap")}
                className="border-cyan-500/50 hover:border-cyan-400 text-lg retro-glow"
              >
                Get PLAY
              </Button>
            {/* </Link> */}
          </div>
        </div>
      </div>
      <div className="absolute -bottom-16 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}

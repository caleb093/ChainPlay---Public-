"use client"
import Image from "next/image";
import { HeroSection } from "@/components/ui/hero-section";
import Head from "next/head"
import Modal from "@/components/seondary/modal";
import { WelcomeModal } from "@/components/modals/welcome-modal";
import HomeLayout from "@/components/layouts/home-layout";
import FeaturedGames from "@/components/ui/featured-games";

// export const metadata = {
//   title: 'Chain Play - Retro Arcade Gaming Platform',
//   description: "Play retro arcade games and earn crypto rewards"
// }

export default function Home() {
  return (
    <HomeLayout> 
      <Head>
        <title>Chain Play - Retro Arcade Gaming Platform</title>
        <meta
          name="description"
          content="Play retro arcade games and earn crypto rewards"
        />
      </Head>
      <main className="min-h-screen relative scroll-smooth">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl" />
          <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-cyan-500/20 rounded-full filter blur-3xl" />
        </div>
        <HeroSection />
        <FeaturedGames />
      </main>
    </HomeLayout>
  );
}

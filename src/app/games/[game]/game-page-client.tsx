"use client"
import { useParams } from "next/navigation";
import Head from "next/head";
import dynamic from "next/dynamic";
import { RcpStakingContextProvider } from "@/contexts/rcpStakingContext";
import GamesLayout from "@/components/layouts/games-layout";
import ProtectLayout from "@/components/layouts/protect-layout";
import { MazeWagerContextProvider } from "@/contexts/mazeWagerContext";

// Browser-only game components — skip prerender so window/document refs
// at module/render time don't crash the static export build.
const FlappyBird = dynamic(() => import("@/components/Games/flapbounce"), { ssr: false });
const SnakeGame = dynamic(() => import("@/components/Games/snake/index"), { ssr: false });
const RockPaperScissors = dynamic(() => import("@/components/Games/rpc/index"), { ssr: false });
const WordleGame = dynamic(() => import("@/components/Games/wordle/wordle"), { ssr: false });
const MazeGame = dynamic(() => import("@/components/Games/maze/index"), { ssr: false });
const PenFight = dynamic(() => import("@/components/Games/pen-fight/index"), { ssr: false });

const games = [
  {
    slug: "flap-bounce",
    title: "Flap Bounce",
    description: "Navigate through pipes in this classic arcade game",
  },
  {
    slug: "snake-game",
    title: "Snake Game",
    description: "Grow your snake by eating food without hitting the walls",
  },
  {
    slug: "rock-paper-scissors",
    title: "Rock Paper Scissors",
    description: "Classic game of chance against the computer",
  },
  {
    slug: "maze",
    title: "Maze",
    description: "Navigate through the maze",
  },
  {
    slug: "wordix",
    title: "Wordix",
    description: "Guess the hidden word in six tries",
  },
  {
    slug: "pen-fight",
    title: "Pen Fight",
    description: "Flick your pen and knock your opponent's off the table",
  },
];

type GAME_TYPES = "flap-bounce" | "snake-game" | "rock-paper-scissors" | "maze" | "wordix" | "pen-fight"

const GamePageClient = () => {
  const {game: slug} = useParams() as {game: GAME_TYPES}

  if (!slug) {
    return <div className="min-h-screen pt-20 pb-16">Loading...</div>;
  }

  const game = games.find((game) => game.slug === slug);

  if (!game) {
    return (
      <div className="min-h-screen pt-20 pb-16">
        <div className="container">Game not found</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{`${game.title} - Chain Play Arcade`}</title>
        <meta name="description" content={game.description} />
      </Head>
      <ProtectLayout>
        <GamesLayout>
          {slug === "flap-bounce" && <FlappyBird />}
          {slug === "snake-game" && <SnakeGame />}
          {slug === "rock-paper-scissors" &&
            <RcpStakingContextProvider>
              <RockPaperScissors />
            </RcpStakingContextProvider> 
          }
          {slug === "wordix" && <WordleGame />}
          {slug === "maze" && 
            <MazeWagerContextProvider>
              <MazeGame />
            </MazeWagerContextProvider>
          }
          {slug === "pen-fight" && <PenFight />}
        </GamesLayout>
      </ProtectLayout>
    </>
  );
}

export default GamePageClient

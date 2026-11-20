// import { GameCard } from "./game-card";
// import { GameCard } from "./game-card";
import GameCard from "./game-card";

const games = [
  {
    title: "Chain Runnerz",
    description: "Find your way out of the maze in record time.",
    image:
      "/landing-page/maze.webp",
    slug: "maze",
    // wager: true
  },
  {
    title: "Rock Paper Scissors",
    description: "Classic game of chance.",
    image:
      "/landing-page/rpc.webp",
    slug: "rock-paper-scissors",
    // wager: 80
  },
  {
    title: "Wordix",
    description: "Guess the hidden word in six tries",
    image:
      "/landing-page/wordix.webp",
    slug: "wordix"
  },
  {
    title: "Snake Game",
    description: "Grow your snake by eating food without hitting the walls",
    image:
      "/landing-page/snake.webp",
    slug: "snake-game"
  },
  {
    title: "Flap Bounce",
    description: "Navigate through pipes in this classic arcade game",
    image:
      "/landing-page/flapBounce.webp",
    slug: "flap-bounce",
  },
  {
    title: "Pen Fight",
    description: "Flick your pen and knock your opponent's off the table.",
    image: "/landing-page/flapBounce.webp",
    slug: "pen-fight",
  },
];

const FeaturedGames = () => {
  return (
    <section id="featured-games" className="py-16 relative px-5 sm:px-20">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-cyan-900/10 pointer-events-none" />
      <div className="">
        <h2 className="text-4xl font-bold tracking-tight mb-3 text-center neon-purple">
          The Arcade
        </h2>
        <p className="text-center text-cyan-300 mb-10 max-w-2xl mx-auto">
          Play , Challenge & Compete
        </p>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 ">
          {games.map((game) => (
            <GameCard key={game.slug} {...game} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedGames
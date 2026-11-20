import GamePageClient from "./game-page-client";

// Statically generate one HTML file per game slug at build time.
// `generateStaticParams` cannot live in a "use client" file, so this page
// is a server component that renders the client component below.
export function generateStaticParams() {
  return [
    { game: "flap-bounce" },
    { game: "snake-game" },
    { game: "rock-paper-scissors" },
    { game: "maze" },
    { game: "wordix" },
    { game: "pen-fight" },
  ];
}

// Reject any param not listed above (no on-demand routes with static export).
export const dynamicParams = false;

export default function GamePage() {
  return <GamePageClient />;
}

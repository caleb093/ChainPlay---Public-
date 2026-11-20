import { appContext } from "@/contexts/appContext";
import Image from "next/image";
import Link from "next/link";
import { useContext } from "react";
import { twMerge } from "tailwind-merge";
// import { cn } from "@/lib/utils";

interface GameCardProps {
  title: string;
  description: string;
  image: string;
  slug: string;
  className?: string;
  free?: boolean;
  wager?: number | boolean;
}

const GameCard = ({
  title,
  description,
  image,
  slug,
  className,
  free,
  wager
}: GameCardProps) => {
  const {playSfx} = useContext(appContext)

  return (
    <Link
      onMouseEnter={() => playSfx("beamInteraction")}
      href={`/games/${slug}`}
      className={twMerge(
        "group relative overflow-hidden rounded-lg retro-card transition-all hover:scale-105",
        className,
      )}
    >
      <div className="aspect-[4/3] w-full overflow-hidden">
        <Image
          src={image}
          alt={title}
          width={400}
          height={300}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110 opacity-80 group-hover:opacity-100"
        />
      </div>
      <div className="bg-gradient-to-t from-purple-900/90 via-blue-900/70 to-transparent p-4 absolute bottom-0 left-0 right-0">
        <h3 className="text-xl font-bold text-white neon-cyan">{title}</h3>
        <p className="text-sm text-white/90 line-clamp-2">{description}</p>
      </div>
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-cyan-500/50 transition-all duration-300" />
      {free ?
        <div className="absolute top-2 right-2 bg-green-500/80 text-white text-xs px-2 py-1 rounded-full">
          FREE
        </div>
      : 
        <div className="absolute top-2 right-2 text-white text-xs px-2 py-1 rounded-full">
          PLAY
        </div>
      }

      {wager && (
        <div className="absolute top-2 left-2">
          <div className="relative overflow-hidden rounded-full bg-slate-900/80 px-3 py-1 min-w-[90px]">
            
            {/* progress fill */}
            {typeof wager === "number" && (
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
                style={{ width: `${Math.min(wager, 100)}%` }}
              />
            )}

            {/* shimmer / loading state */}
            {typeof wager !== "number" && (
              <div className="absolute inset-0 bg-slate-700 animate-pulse" />
            )}

            {/* text */}
            <p className="relative z-10 text-xs font-bold uppercase tracking-wide text-white">
              Wager {typeof wager === "number" ? `${wager}%` : "⏳"}
            </p>
          </div>
        </div>
      )}
      {/* {wager &&
        <div className={`absolute top-2 left-2 ${typeof wager === "number" ? `bg-red-600` : "bg-slate-700"} text-white text-xs px-2 py-1 rounded-full`}>
          <p>Wager {typeof wager === "number" ? `${wager}% ` : "⏳"}</p>
        </div>
      } */}
    </Link>
  );
}

export default GameCard
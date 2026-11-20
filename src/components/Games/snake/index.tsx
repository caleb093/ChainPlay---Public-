import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import GameButtons from "@/components/seondary/game-buttons";
import { appContext } from "@/contexts/appContext";
import WelcomeSnake from "./welcome";
import ErrorPopup from "@/components/seondary/error-popup";
import useGame from "@/util/useGame";
// import {} from "use-c"

export type SNAKE_GAME_MODES = "classic" | "crack" | "mirror"

const SnakeGame: React.FC = () => {
    const {isHighscore, onGameEnd, progressData, saveLoading, requirements, setIsHighscore, errorSaving, gameMode, gameModeRef, progressStatus, setGameMode} = useGame("snake")
    const {playSfx, userProfile} = useContext(appContext)
    const blockSize = useRef(25);
    const rows = useRef(22);
    const cols = useRef(22);
    const snakeColor = useRef("lime");
    // for background overlay
    const [updatedColor, setUpdatedColor] = useState("lime")
    const {isMobile} = useContext(appContext)

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const [gameOver, setGameOver] = useState(false);
    const gameOverRef = useRef(false);

    useEffect(() => {
        gameOverRef.current = gameOver;
    }, [gameOver]);


    const [isGameRunning, setIsGameRunning] = useState(false);
    const score = useRef(0);

    const snakeX = useRef<number>(blockSize.current * 5);
    const snakeY = useRef<number>(blockSize.current * 5);
    const velocityX = useRef<number>(0);
    const velocityY = useRef<number>(0);
    const snakeBody = useRef<[number, number][]>([]);

    const foodX = useRef<number>(0);
    const foodY = useRef<number>(0);

    const lastTimeRef = useRef(0);
    const animationFrameRef = useRef<number | null>(null);


    useEffect(() => {
        gameModeRef.current = gameMode;
    }, [gameMode]);

    const movePlayer = (direction: "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight") => {
        if (!isGameRunning) return;

        const isMirror = gameMode === "mirror";

        const up = isMirror ? "ArrowDown" : "ArrowUp";
        const down = isMirror ? "ArrowUp" : "ArrowDown";
        const left = isMirror ? "ArrowRight" : "ArrowLeft";
        const right = isMirror ? "ArrowLeft" : "ArrowRight";

        if (direction === up && velocityY.current !== 1) {
            velocityX.current = 0;
            velocityY.current = -1;
        } else if (direction === down && velocityY.current !== -1) {
            velocityX.current = 0;
            velocityY.current = 1;
        } else if (direction === left && velocityX.current !== 1) {
            velocityX.current = -1;
            velocityY.current = 0;
        } else if (direction === right && velocityX.current !== -1) {
            velocityX.current = 1;
            velocityY.current = 0;
        }
    };

    const resizeCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const minDimension = Math.min(window.innerWidth, window.innerHeight);
        const canvasSize = Math.floor(minDimension * 0.8); // 90% of smaller viewport side

        blockSize.current = Math.floor(canvasSize / 22); // maintain 22x22 grid
        cols.current = 22;
        rows.current = 22;

        canvas.width = blockSize.current * cols.current;
        canvas.height = blockSize.current * rows.current;

        // Align snake and body to new block grid
        snakeX.current = Math.floor(snakeX.current / blockSize.current) * blockSize.current;
        snakeY.current = Math.floor(snakeY.current / blockSize.current) * blockSize.current;

        snakeBody.current = snakeBody.current.map(([x, y]) => [
            Math.floor(x / blockSize.current) * blockSize.current,
            Math.floor(y / blockSize.current) * blockSize.current,
        ]);
    };

    useEffect(() => {
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        return () => {
            window.removeEventListener("resize", resizeCanvas);
        };
    }, []);

    // Cancel the game loop on unmount. The rAF is otherwise only stopped in
    // handleGameEnd, so navigating away mid-game leaves gameLoop rescheduling
    // itself forever — pinning the main thread long after the component is gone.
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = cols.current * blockSize.current;
        canvas.height = rows.current * blockSize.current;
    }, []);

    useEffect(() => {
        const handleKeyUp = (e: KeyboardEvent) => {
            movePlayer(e.key as "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight")
        };

        document.addEventListener("keydown", handleKeyUp);
        return () => {
        document.removeEventListener("keydown", handleKeyUp);
        };
    }, [isGameRunning]);

    // Swipe-to-move for mobile. Dynamic: a continuous touch can change direction
    // multiple times — once dx/dy exceeds the threshold we fire movePlayer and
    // reset the origin to the current finger position, so chained swipes work.
    useEffect(() => {
        if (!isGameRunning) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const SWIPE_THRESHOLD = 24; // px before a direction is committed
        let startX = 0;
        let startY = 0;
        let active = false;

        const handleTouchStart = (e: TouchEvent) => {
            const t = e.touches[0];
            if (!t) return;
            startX = t.clientX;
            startY = t.clientY;
            active = true;
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!active) return;
            e.preventDefault(); // stop page scroll while swiping over the board
            const t = e.touches[0];
            if (!t) return;
            const dx = t.clientX - startX;
            const dy = t.clientY - startY;
            if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;

            if (Math.abs(dx) > Math.abs(dy)) {
                movePlayer(dx > 0 ? "ArrowRight" : "ArrowLeft");
            } else {
                movePlayer(dy > 0 ? "ArrowDown" : "ArrowUp");
            }
            // Reset origin so the next swipe within the same gesture registers fresh
            startX = t.clientX;
            startY = t.clientY;
        };

        const endTouch = () => { active = false; };

        canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
        canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
        canvas.addEventListener("touchend", endTouch);
        canvas.addEventListener("touchcancel", endTouch);

        return () => {
            canvas.removeEventListener("touchstart", handleTouchStart);
            canvas.removeEventListener("touchmove", handleTouchMove);
            canvas.removeEventListener("touchend", endTouch);
            canvas.removeEventListener("touchcancel", endTouch);
        };
    }, [isGameRunning]);

    const placeFood = () => {
        const snakeSet = new Set<string>();

        // Add all snake body parts to the set
        for (const [x, y] of snakeBody.current) {
            snakeSet.add(`${x},${y}`);
        }
        // Also add the snake head
        snakeSet.add(`${snakeX.current},${snakeY.current}`);

        let newX: number;
        let newY: number;
        let key: string;

        do {
            newX = Math.floor(Math.random() * cols.current) * blockSize.current;
            newY = Math.floor(Math.random() * rows.current) * blockSize.current;
            key = `${newX},${newY}`;
        } while (snakeSet.has(key));

        foodX.current = newX;
        foodY.current = newY;
    };

    const gameLoop = (timestamp: number, mode: SNAKE_GAME_MODES) => {
        if (!canvasRef.current || gameOverRef.current) return;
        const context = canvasRef.current.getContext("2d");
        if (!context) return;

        const delta = timestamp - lastTimeRef.current;
        const interval = 1000 / (mode === "crack" ? 18 : 13); // move every few ms

        if (delta > interval) {
            update(context);
            lastTimeRef.current = timestamp;
        }

       // store the frame ID
        // animationFrameRef.current = requestAnimationFrame(gameLoop);
        animationFrameRef.current = requestAnimationFrame((t) => gameLoop(t, mode));
    };


    const startGame = useCallback((mode: SNAKE_GAME_MODES) => {
        if (!canvasRef.current) return;
        const context = canvasRef.current.getContext("2d");
        if (!context) return;
        // const startLength = 90; // starting body length
        // const initialX = blockSize.current * 5;
        // const initialY = blockSize.current * 5;

        // snakeX.current = initialX;
        // snakeY.current = initialY;
        // velocityX.current = 1;
        // velocityY.current = 0;

        // // Initialize snake body trailing behind the head to the left
        // snakeBody.current = Array.from({ length: startLength }, (_, i) => [
        //   initialX - blockSize.current * (i + 1),
        //   initialY
        // ]);
        setGameMode(mode)
        setIsGameRunning(true);
        setGameOver(false);
        placeFood();
        lastTimeRef.current = 0;

        // ✅ Wrap the callback so the mode is preserved
        const loop = (timestamp: number) => gameLoop(timestamp, mode);
        animationFrameRef.current = requestAnimationFrame(loop);
        // animationFrameRef.current = requestAnimationFrame(gameLoop);

        // intervalRef.current = setInterval(() => update(context), mode === "crack" ? 60 : 80); // 60: crack-head
    },[gameOver]);

    const resetGame = useCallback(() => {
        // Reset all refs and state
        snakeX.current = blockSize.current * 5;
        snakeY.current = blockSize.current * 5;
        velocityX.current = 0;
        velocityY.current = 0;
        snakeBody.current = [];
 
        score.current = 0
        setGameOver(false);
        setIsGameRunning(false);
        setIsHighscore(false)

        // if (intervalRef.current) {
        //     clearInterval(intervalRef.current);
        //     intervalRef.current = null;
        // }

        const context = canvasRef.current?.getContext("2d");
        if (context) {
            context.clearRect(0, 0, cols.current * blockSize.current, rows.current * blockSize.current);
        }
    },[]);

    const drawScore = (ctx: CanvasRenderingContext2D) => {
        ctx.font = "14px 'Press Start 2P', monospace"; // custom font
        ctx.fillStyle = "rgba(255, 255, 255, 0.34)"; // white at 60% opacity        
        ctx.textAlign = "left";
        ctx.fillText(`Score: ${score.current}`, 10, 30);
    };

    const update = (ctx: CanvasRenderingContext2D) => {
        if (gameOver) return;

        ctx.fillStyle = "#0b051d";
        ctx.fillRect(0, 0, cols.current * blockSize.current, rows.current * blockSize.current);


        // === NEON FOOD ===
        ctx.save(); // Save current canvas state
        ctx.shadowColor = "red";
        ctx.shadowBlur = 20;
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(
            foodX.current + blockSize.current / 2,
            foodY.current + blockSize.current / 2,
            blockSize.current / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        ctx.restore(); // Restore canvas to remove shadow for other drawings

        
        // ctx.fillStyle = "red";  
        // ctx.beginPath();
        // ctx.arc(
        //     foodX.current + blockSize / 2, // center X
        //     foodY.current + blockSize / 2, // center Y
        //     blockSize / 2,                 // radius
        //     0,
        //     Math.PI * 2                    // full circle
        // );
        // ctx.fill();

        if (snakeX.current === foodX.current && snakeY.current === foodY.current) {
            snakeBody.current.push([foodX.current, foodY.current]);
            placeFood();
            score.current = score.current + 1
            
            playSfx("eatFood")
            if (score.current !== 0 && score.current % 10 === 0) {
                const colors = ["limegreen", "blue", "#d633d0", "orange", "pink", "aqua", "white", "brown"];

                let newColor = snakeColor.current;

                // Keep generating until we get a different color
                while (newColor === snakeColor.current) {
                    newColor = colors[Math.floor(Math.random() * colors.length)];
                }

                snakeColor.current = newColor;
                // for State
                setUpdatedColor(newColor)
                // console.log("New snake color:", snakeColor.current);
            }
        }

        for (let i = snakeBody.current.length - 1; i > 0; i--) {
            snakeBody.current[i] = snakeBody.current[i - 1];
        }
        if (snakeBody.current.length > 0) {
            snakeBody.current[0] = [snakeX.current, snakeY.current];
        }

        snakeX.current += velocityX.current * blockSize.current;
        snakeY.current += velocityY.current * blockSize.current;

        // ctx.fillStyle = snakeColor.current;
        // ctx.fillRect(snakeX.current, snakeY.current, blockSize, blockSize);

        // for (const [x, y] of snakeBody.current) {
        //     ctx.fillRect(x, y, blockSize, blockSize);
        // }
        let gap = 2
        // === NEON SNAKE HEAD ===
        ctx.save();
        ctx.shadowColor = snakeColor.current;
        ctx.shadowBlur = 15;
        ctx.fillStyle = snakeColor.current;
        ctx.fillRect(snakeX.current, snakeY.current, blockSize.current, blockSize.current);
        ctx.restore();

        // === NEON SNAKE BODY ===
        for (const [x, y] of snakeBody.current) {
            ctx.save();
            ctx.fillStyle = snakeColor.current;
            ctx.fillRect(
                x + gap / 2,
                y + gap / 2,
                blockSize.current - gap,
                blockSize.current - gap
            );
            ctx.restore();
        }

        drawScore(ctx)

        if (
            snakeX.current < 0 ||
            snakeX.current >= cols.current * blockSize.current ||
            snakeY.current < 0 ||
            snakeY.current >= rows.current * blockSize.current
        ) {
           handleGameEnd()
        }

        for (const [x, y] of snakeBody.current) {
        if (snakeX.current === x && snakeY.current === y) {
            handleGameEnd()   
        }
        }
    };

    const handleGameEnd = useCallback(async () => {
        setGameOver(true);
        setIsGameRunning(false);

        // if (intervalRef.current) clearInterval(intervalRef.current);
        if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
        }


        onGameEnd(score.current)
    },[userProfile])

    return (
        <div 
            style={{ background: "linear-gradient(to right, #0b051d, #1f094e)" }} 
            className={`text-white h-screen relative flex flex-col ${isMobile ? "justify-start" : "justify-center"} items-center ${saveLoading && "pointer-events-none"}`}
        >
            <ErrorPopup show={errorSaving} callback={handleGameEnd} text="Error saving data" />
            <div className="flex justify-between px-4 py-5 absolute w-full top-0">
                <h1 
                    className="mx-auto"
                    style={{
                        transform: gameMode === "mirror" ? "scaleX(-1)" : "none",
                    }}
                >
                    <span className="tracking-tight neon-pink">Chain</span><span className="neon-cyan">Play</span>
                </h1>
            </div>
            
            {/* Welcome Overlay */}
            <WelcomeSnake gameModeRequirements={requirements} isHighscore={isHighscore} userData={progressData} gameMode={gameMode} disableStart={Boolean(progressStatus !== "fulfilled")} isGameRunning={isGameRunning} score={gameOver ? score.current : 0} startGame={startGame} gameOver={gameOver} resetGame={resetGame} />
            {/* <WelcomeSnake userData={progressData} gameMode={gameMode} isGameRunning={isGameRunning} score={score} startGame={startGame} gameOver={gameOver} resetGame={resetGame} /> */}

            <GameButtons movePlayer={movePlayer} />

            <canvas
                ref={canvasRef}
                id="board"
                className={`${isMobile ? "mt-16" : "mt-0"} touch-none select-none`}
                style={{
                    border: `8px solid ${updatedColor}`,
                    // borderRadius: "8px",
                    boxShadow: `
                    0 0 20px ${updatedColor},
                    0 0 20px ${updatedColor},
                    0 0 40px ${updatedColor},
                    inset 0 0 10px ${updatedColor},
                    inset 0 0 20px ${updatedColor}
                    `,
                    // backgroundColor: "black", // helps the glow pop
                }}
            />

        </div>
    );
};

export default React.memo(SnakeGame);

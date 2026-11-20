"use client"
import { FC, useCallback, useContext, useState } from "react"
import Image from "next/image"
import { Download, X } from "lucide-react"
import { AchievementItem, getAchievementImage } from "@/contexts/notifyContext"
import { appContext } from "@/contexts/appContext"

// ── Canvas helpers ──────────────────────────────────────────────────────────

function loadImg(src: string, cors = false): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new window.Image()
        // Timeout prevents the promise hanging forever on stalled mobile network requests.
        // allSettled() waits for every item — one hung request would freeze generateCard.
        const timer = setTimeout(
            () => reject(new Error(`Image load timeout: ${src}`)),
            6000,
        )
        if (cors) img.crossOrigin = "anonymous"
        img.onload  = () => { clearTimeout(timer); resolve(img) }
        img.onerror = () => { clearTimeout(timer); reject(new Error(`Image error: ${src}`)) }
        img.src     = src
    })
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(" ")
    const lines: string[] = []
    let current = ""
    for (const word of words) {
        const test = current ? `${current} ${word}` : word
        if (ctx.measureText(test).width > maxWidth && current) {
            lines.push(current)
            current = word
        } else {
            current = test
        }
    }
    if (current) lines.push(current)
    return lines
}


function drawStar(
    ctx: CanvasRenderingContext2D,
    cx: number, cy: number,
    outer: number,
    color: string,
    alpha = 1,
) {
    const inner = outer * 0.42
    const saved = ctx.globalAlpha
    ctx.globalAlpha = alpha
    ctx.beginPath()
    for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? outer : inner
        const a = (i * Math.PI / 5) - Math.PI / 2
        i === 0
            ? ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
            : ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
    }
    ctx.closePath()
    ctx.fillStyle = color
    ctx.fill()
    ctx.globalAlpha = saved
}

// ── Card generator ──────────────────────────────────────────────────────────

async function generateCard(
    achievement: AchievementItem,
    username: string,
    avatarUrl: string | null | undefined,
): Promise<Blob> {
    // ─────────────────────────────────────────────────────────────
    // LANDSCAPE CARD SIZE
    // ─────────────────────────────────────────────────────────────
    const W = 1600
    const H = 1000

    const canvas = document.createElement("canvas")
    canvas.width = W
    canvas.height = H

    const ctx = canvas.getContext("2d")!

    const ACCENT = "#c040ff"
    const CYAN   = "#00eaff"

    // ─────────────────────────────────────────────────────────────
    // BACKGROUND
    // ─────────────────────────────────────────────────────────────
    const bg = ctx.createLinearGradient(0, 0, 0, H)
    bg.addColorStop(0, "#06041a")
    bg.addColorStop(1, "#090021")

    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    // subtle glow background
    const radial = ctx.createRadialGradient(
        W * 0.5,
        H * 0.45,
        0,
        W * 0.5,
        H * 0.45,
        700,
    )

    radial.addColorStop(0, "rgba(192,64,255,0.18)")
    radial.addColorStop(0.4, "rgba(192,64,255,0.08)")
    radial.addColorStop(1, "rgba(0,0,0,0)")

    ctx.fillStyle = radial
    ctx.fillRect(0, 0, W, H)

    // ─────────────────────────────────────────────────────────────
    // OUTER BORDER
    // ─────────────────────────────────────────────────────────────
    ctx.strokeStyle = "#d050ff"
    ctx.lineWidth = 4

    const PAD = 24
    const R = 24

    ctx.beginPath()
    ctx.moveTo(PAD + R, PAD)

    ctx.lineTo(W - PAD - R, PAD)
    ctx.quadraticCurveTo(W - PAD, PAD, W - PAD, PAD + R)

    ctx.lineTo(W - PAD, H - PAD - R)
    ctx.quadraticCurveTo(W - PAD, H - PAD, W - PAD - R, H - PAD)

    ctx.lineTo(PAD + R, H - PAD)
    ctx.quadraticCurveTo(PAD, H - PAD, PAD, H - PAD - R)

    ctx.lineTo(PAD, PAD + R)
    ctx.quadraticCurveTo(PAD, PAD, PAD + R, PAD)

    ctx.stroke()

    // ─────────────────────────────────────────────────────────────
    // LOAD ASSETS
    // ─────────────────────────────────────────────────────────────
    const avatarSrc = avatarUrl?.trim() || "/user-avatar.png"
    const isExternalAvatar = avatarSrc.startsWith("http")

    const [badgeRes, pbotRes, rawAvatarRes] = await Promise.allSettled([
        loadImg(getAchievementImage(achievement.id)),
        loadImg("/assets/pbot/pbot-wave.png"),
        loadImg(avatarSrc, isExternalAvatar),
    ])

    // If the external avatar failed (CORS / network), fall back to the default local image
    const avatarRes =
        rawAvatarRes.status === "rejected" && isExternalAvatar
            ? await Promise.allSettled([loadImg("/user-avatar.png")]).then(r => r[0])
            : rawAvatarRes
    const playerImg = avatarRes.status === "fulfilled" ? avatarRes.value : null

    await Promise.race([
        document.fonts.ready,
        new Promise<void>((resolve) => setTimeout(resolve, 1500)),
    ])

    // ─────────────────────────────────────────────────────────────
    // TOP LEFT BRAND
    // ─────────────────────────────────────────────────────────────
    ctx.font = "bold 42px 'Press Start 2P', monospace"
    ctx.textAlign = "left"
    ctx.textBaseline = "middle"

    ctx.shadowBlur = 18

    ctx.fillStyle = CYAN
    ctx.shadowColor = CYAN
    ctx.fillText("CHAIN", 120, 90)

    const chainW = ctx.measureText("CHAIN ").width

    ctx.fillStyle = "#ff5eff"
    ctx.shadowColor = "#ff5eff"
    ctx.fillText("PLAY", 120 + chainW, 90)

    ctx.shadowBlur = 0

    // ─────────────────────────────────────────────────────────────
    // ACHIEVEMENT LABEL
    // ─────────────────────────────────────────────────────────────
    ctx.font = "32px Arial"
    ctx.fillStyle = "rgba(255,255,255,0.85)"
    ctx.fillText("ACHIEVEMENT", W - 420, 90)

    ctx.strokeStyle = "rgba(255,255,255,0.45)"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(W - 420, 115)
    ctx.lineTo(W - 180, 115)
    ctx.stroke()

    // ─────────────────────────────────────────────────────────────
    // PLAYER AVATAR GLOW
    // ─────────────────────────────────────────────────────────────
    const avatarX = 220
    const avatarY = 330
    const avatarR = 120

    ctx.beginPath()
    ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2)

    ctx.shadowColor = ACCENT
    ctx.shadowBlur = 35
    ctx.strokeStyle = "#d050ff"
    ctx.lineWidth = 5
    ctx.stroke()

    ctx.shadowBlur = 0

    // ─────────────────────────────────────────────────────────────
    // PLAYER IMAGE
    // ─────────────────────────────────────────────────────────────
    if (playerImg) {
        ctx.save()

        ctx.beginPath()
        ctx.arc(avatarX, avatarY, avatarR - 8, 0, Math.PI * 2)
        ctx.clip()

        const d = (avatarR - 8) * 2
        ctx.drawImage(playerImg, avatarX - (avatarR - 8), avatarY - (avatarR - 8), d, d)

        ctx.restore()
    }

    // ─────────────────────────────────────────────────────────────
    // PLAYER NAME
    // ─────────────────────────────────────────────────────────────
    ctx.textAlign = "left"

    ctx.font = "bold 62px Arial"
    ctx.fillStyle = "#ffffff"
    ctx.fillText(username || "Player", 110, 520, 340)

    ctx.font = "bold 30px Arial"
    ctx.fillStyle = CYAN
    ctx.fillText("ARCADIAN", 110, 580)

    if (achievement.unlockedAt) {
        const dateStr = new Date(achievement.unlockedAt)
            .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            .toUpperCase()
        ctx.font = "28px Arial"
        ctx.fillStyle = "rgba(255,255,255,0.72)"
        ctx.fillText(`UNLOCKED ${dateStr}`, 110, 625)
    }

    // ─────────────────────────────────────────────────────────────
    // CIRCLE BADGE
    // ─────────────────────────────────────────────────────────────
    const HEX_X = 820
    const HEX_Y = 320
    const HEX_R = 145
    const BADGE_GAP = 10   // space between border ring and image

    // glow
    const glow = ctx.createRadialGradient(HEX_X, HEX_Y, 0, HEX_X, HEX_Y, 280)
    glow.addColorStop(0, "rgba(192,64,255,0.35)")
    glow.addColorStop(1, "rgba(0,0,0,0)")
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, W, H)

    // badge image clipped to inner circle (leaving gap inside the border)
    if (badgeRes.status === "fulfilled") {
        ctx.save()
        ctx.beginPath()
        ctx.arc(HEX_X, HEX_Y, HEX_R - BADGE_GAP, 0, Math.PI * 2)
        ctx.clip()
        const imgD = (HEX_R - BADGE_GAP) * 2
        ctx.drawImage(badgeRes.value, HEX_X - (HEX_R - BADGE_GAP), HEX_Y - (HEX_R - BADGE_GAP), imgD, imgD)
        ctx.restore()
    }

    // circle border
    ctx.beginPath()
    ctx.arc(HEX_X, HEX_Y, HEX_R, 0, Math.PI * 2)
    ctx.strokeStyle = "#d050ff"
    ctx.lineWidth = 10
    ctx.shadowColor = "#d050ff"
    ctx.shadowBlur = 25
    ctx.stroke()

    ctx.shadowBlur = 0

    // ─────────────────────────────────────────────────────────────
    // TITLE — dynamic from achievement.name
    // ─────────────────────────────────────────────────────────────
    ctx.textAlign = "left"
    ctx.shadowColor = "#d050ff"
    ctx.shadowBlur = 35
    ctx.fillStyle = "#ffffff"

    const TITLE_X = 1060
    const MAX_TITLE_W = 460
    let titleSize = 96

    // Shrink font until the longest single word fits in the available width
    ctx.font = `900 ${titleSize}px 'Arial Black', Arial`
    while (titleSize > 44) {
        ctx.font = `900 ${titleSize}px 'Arial Black', Arial`
        const longestWord = achievement.name.toUpperCase().split(" ")
            .reduce((max, w) => Math.max(max, ctx.measureText(w).width), 0)
        if (longestWord <= MAX_TITLE_W) break
        titleSize -= 4
    }

    const titleLines = wrapText(ctx, achievement.name.toUpperCase(), MAX_TITLE_W)
    const titleLineH = Math.round(titleSize * 1.1)
    titleLines.slice(0, 3).forEach((line, i) => {
        ctx.fillText(line, TITLE_X, 270 + i * titleLineH)
    })

    ctx.shadowBlur = 0
    const titleEndY = 270 + Math.min(titleLines.length, 3) * titleLineH

    // Description — dynamic from achievement.description
    ctx.font = "40px Arial"
    ctx.fillStyle = "rgba(255,255,255,0.82)"
    const descLines = wrapText(ctx, achievement.description, MAX_TITLE_W)
    descLines.slice(0, 4).forEach((line, i) => {
        ctx.fillText(line, TITLE_X, titleEndY + 24 + i * 52)
    })

    // ─────────────────────────────────────────────────────────────
    // BOTTOM PANEL
    // ─────────────────────────────────────────────────────────────
    ctx.beginPath()

    ctx.moveTo(60, 760)
    ctx.lineTo(720, 760)

    ctx.lineTo(780, 710)

    ctx.lineTo(W - 60, 710)
    ctx.lineTo(W - 60, H - 60)

    ctx.lineTo(60, H - 60)
    ctx.closePath()

    const panelGrad = ctx.createLinearGradient(0, 760, 0, H)

    panelGrad.addColorStop(0, "rgba(35,20,90,0.65)")
    panelGrad.addColorStop(1, "rgba(20,10,50,0.85)")

    ctx.fillStyle = panelGrad
    ctx.fill()

    ctx.strokeStyle = "rgba(180,120,255,0.45)"
    ctx.lineWidth = 2
    ctx.stroke()

    // tagline — bottom left of panel
    ctx.textAlign = "left"
    ctx.textBaseline = "middle"
    ctx.font = "32px Orbitron"
    ctx.fillStyle = "rgba(3, 252, 244, 0.65)"
    ctx.fillText("Where Fun Meets Rivalry", 80, H - 92)

    // ─────────────────────────────────────────────────────────────
    // BOTTOM RIGHT PBOT
    // ─────────────────────────────────────────────────────────────
    if (pbotRes.status === "fulfilled") {
        ctx.drawImage(
            pbotRes.value,
            W - 400,
            H - 390,
            350,
            350,
        )
    }

    return new Promise((resolve, reject) =>
        canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
            "image/png",
        ),
    )
}
// ── Tweet URL ───────────────────────────────────────────────────────────────

function buildShareUrl(achievement: AchievementItem): string {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://app.chainplay.games"
    const text = [
        `🏆 Just unlocked "${achievement.name}" on Chain Play!`,
        ``,
        `${achievement.description}`,
        ``,
        `Play simple games and compete 👉 ${origin}`,
        ``,
        `#ChainPlay #Solana #Gaming`,
    ].join("\n")
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
}

// ── Modal ───────────────────────────────────────────────────────────────────

interface Props {
    achievement: AchievementItem
    onClose: () => void
}

const AchievementDetailModal: FC<Props> = ({ achievement, onClose }) => {
    const { userProfile } = useContext(appContext)
    const [downloading, setDownloading] = useState(false)

    const isChain     = achievement.id === "chain_player"
    const borderColor = isChain ? "rgba(250,204,21,0.5)"  : "rgba(192,64,255,0.5)"
    const glowColor   = isChain ? "rgba(250,204,21,0.3)"  : "rgba(192,64,255,0.3)"
    const accentColor = isChain ? "#facc15" : "#c040ff"

    const handleDownload = useCallback(async () => {
        setDownloading(true)
        let blob: Blob | null = null
        try {
            blob = await generateCard(achievement, userProfile?.username || "Player", userProfile?.avatar)
            const filename = `chainplay-${achievement.id}.png`

            // Mobile / in-app browsers: use the native share sheet.
            // Guard with (hover: none) so desktop Chrome/Edge (which also support canShare)
            // don't land here — their share sheet has no "Save file" option.
            const isTouchDevice = window.matchMedia("(hover: none)").matches
            const file = new File([blob], filename, { type: "image/png" })
            if (
                isTouchDevice &&
                typeof navigator.canShare === "function" &&
                navigator.canShare({ files: [file] })
            ) {
                await navigator.share({ files: [file], title: achievement.name })
                return
            }

            // Desktop: programmatic anchor download.
            // Append to DOM — required by Firefox and some Chromium builds.
            // Delay revocation so the browser has time to start the download before
            // the blob URL is invalidated (immediate revoke causes ERR_FILE_NOT_FOUND on mobile).
            const url = URL.createObjectURL(blob)
            const a   = document.createElement("a")
            a.href     = url
            a.download = filename
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            setTimeout(() => URL.revokeObjectURL(url), 2000)
        } catch (err) {
            // User dismissed the native share sheet — not an error
            if (err instanceof Error && err.name === "AbortError") return
            console.error("Card generation failed", err)
            // Last-resort fallback: open the image in a new tab so the user can long-press to save
            if (blob) {
                const url = URL.createObjectURL(blob)
                window.open(url, "_blank")
                setTimeout(() => URL.revokeObjectURL(url), 10000)
            }
        } finally {
            setDownloading(false)
        }
    }, [achievement])

    return (
        <div
            className="fixed inset-0 z-[300] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
        >
            <div
                className="relative flex flex-col items-center text-center gap-4 p-8 rounded-2xl max-w-sm w-full"
                style={{
                    background: "rgba(10,8,28,0.98)",
                    border: `1px solid ${borderColor}`,
                    boxShadow: `0 0 40px ${glowColor}, inset 0 0 30px ${glowColor.replace("0.3", "0.05")}`,
                }}
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                {isChain && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl select-none">👑</div>
                )}

                <div
                    className="w-28 h-28 rounded-full overflow-hidden shrink-0 mt-2"
                    style={{ filter: `drop-shadow(0 0 18px ${glowColor})` }}
                >
                    <Image
                        src={getAchievementImage(achievement.id)}
                        alt={achievement.name}
                        width={112}
                        height={112}
                        className="object-cover w-full h-full"
                    />
                </div>

                <p
                    className="text-[10px] uppercase tracking-[0.25em] font-black"
                    style={{ color: accentColor, textShadow: `0 0 8px ${accentColor}` }}
                >
                    Achievement Unlocked
                </p>

                <h2 className="text-lg font-black text-white leading-tight -mt-2">
                    {achievement.name}
                </h2>

                <p className="text-sm text-slate-400 leading-relaxed">
                    {achievement.description}
                </p>

                {achievement.unlockedAt && (
                    <p className="text-xs text-slate-600">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString(undefined, {
                            month: "long", day: "numeric", year: "numeric",
                        })}
                    </p>
                )}

                <div className="w-full flex flex-col gap-2 mt-1">
                    <a
                        href={buildShareUrl(achievement)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-sm tracking-wide transition-opacity hover:opacity-80"
                        style={{ background: "#000", border: "1px solid #333", color: "#fff" }}
                    >
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden>
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        Share on X
                    </a>

                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-sm tracking-wide transition-opacity hover:opacity-80 disabled:opacity-50"
                        style={{
                            background: `${accentColor}18`,
                            border: `1px solid ${accentColor}55`,
                            color: accentColor,
                        }}
                    >
                        <Download className="w-4 h-4" />
                        {downloading ? "Generating…" : "Download Card"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AchievementDetailModal

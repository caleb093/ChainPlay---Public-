function loadImg(src: string, cors = false): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new window.Image()
        const timer = setTimeout(() => reject(new Error(`timeout: ${src}`)), 6000)
        if (cors) img.crossOrigin = "anonymous"
        img.onload  = () => { clearTimeout(timer); resolve(img) }
        img.onerror = () => { clearTimeout(timer); reject(new Error(`error: ${src}`)) }
        img.src = src
    })
}

// Color tier based on payout amount — consistent cross-game
function accentForPayout(payout: number, isDraw: boolean): string {
    if (isDraw)           return "#00ffe1"  // cyan   — draw/refund
    if (payout >= 5000)   return "#c040ff"  // purple — 5000+
    if (payout >= 1000)   return "#ff2d6e"  // red    — 1000-4999
    if (payout >= 200)    return "#ff8c00"  // orange — 200-999
    return "#00ffe1"                         // cyan   — <200
}

export interface WagerCardParams {
    game: "rpc" | "maze"
    winnerUsername: string
    winnerAvatar?: string | null
    stake: number
    payout: number
    isDraw: boolean
}

const GAME_META = {
    rpc:  { lines: ["ROCK PAPER", "SCISSORS"], cardImg: "/assets/game-cards/rps.webp" },
    maze: { lines: ["MAZE", "RUNNER"],          cardImg: "/assets/game-cards/maze-small.png" },
}

export async function generateWagerCard(params: WagerCardParams): Promise<Blob> {
    const { game, winnerUsername, winnerAvatar, stake, payout, isDraw } = params
    const meta   = GAME_META[game]
    const ACCENT = accentForPayout(payout, isDraw)
    const CYAN   = "#00eaff"

    const W = 1600, H = 1000
    const canvas = document.createElement("canvas")
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext("2d")!

    // ── Background ──────────────────────────────────────────────────────────
    const bg = ctx.createLinearGradient(0, 0, 0, H)
    bg.addColorStop(0, "#06041a"); bg.addColorStop(1, "#090021")
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

    const radial = ctx.createRadialGradient(W * 0.65, H * 0.4, 0, W * 0.65, H * 0.4, 680)
    radial.addColorStop(0, `${ACCENT}28`); radial.addColorStop(0.5, `${ACCENT}0c`); radial.addColorStop(1, "rgba(0,0,0,0)")
    ctx.fillStyle = radial; ctx.fillRect(0, 0, W, H)

    // ── Outer border ────────────────────────────────────────────────────────
    const PAD = 24, BR = 24
    ctx.beginPath()
    ctx.moveTo(PAD + BR, PAD)
    ctx.lineTo(W - PAD - BR, PAD);     ctx.quadraticCurveTo(W - PAD, PAD, W - PAD, PAD + BR)
    ctx.lineTo(W - PAD, H - PAD - BR); ctx.quadraticCurveTo(W - PAD, H - PAD, W - PAD - BR, H - PAD)
    ctx.lineTo(PAD + BR, H - PAD);     ctx.quadraticCurveTo(PAD, H - PAD, PAD, H - PAD - BR)
    ctx.lineTo(PAD, PAD + BR);         ctx.quadraticCurveTo(PAD, PAD, PAD + BR, PAD)
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 4
    ctx.shadowColor = ACCENT; ctx.shadowBlur = 14
    ctx.stroke(); ctx.shadowBlur = 0

    // ── Load assets ─────────────────────────────────────────────────────────
    const avatarSrc  = winnerAvatar?.trim() || "/user-avatar.png"
    const isExternal = avatarSrc.startsWith("http")
    const [pbotRes, gameCardRes, rawAvRes] = await Promise.allSettled([
        loadImg("/assets/pbot/pbot-wave.png"),
        loadImg(meta.cardImg),
        loadImg(avatarSrc, isExternal),
    ])
    const avRes      = rawAvRes.status === "rejected" && isExternal
        ? await Promise.allSettled([loadImg("/user-avatar.png")]).then(r => r[0])
        : rawAvRes
    const avatarImg   = avRes.status        === "fulfilled" ? avRes.value        : null
    const gameCardImg = gameCardRes.status  === "fulfilled" ? gameCardRes.value  : null

    await Promise.race([document.fonts.ready, new Promise<void>(r => setTimeout(r, 1500))])

    // ── CHAIN PLAY brand (top-left) ─────────────────────────────────────────
    ctx.font = "bold 42px 'Press Start 2P', monospace"
    ctx.textAlign = "left"; ctx.textBaseline = "middle"
    ctx.shadowBlur = 18
    ctx.fillStyle = CYAN;     ctx.shadowColor = CYAN;     ctx.fillText("CHAIN", 120, 88)
    const chainW = ctx.measureText("CHAIN ").width
    ctx.fillStyle = "#ff5eff"; ctx.shadowColor = "#ff5eff"; ctx.fillText("PLAY", 120 + chainW, 88)
    ctx.shadowBlur = 0

    // Header rule
    ctx.strokeStyle = `${ACCENT}40`; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(60, 130); ctx.lineTo(W - 60, 130); ctx.stroke()

    // ── Left column: winner avatar ───────────────────────────────────────────
    const AX = 250, AY = 385, AR = 155

    ctx.beginPath(); ctx.arc(AX, AY, AR + 10, 0, Math.PI * 2)
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 6
    ctx.shadowColor = ACCENT; ctx.shadowBlur = 32
    ctx.stroke(); ctx.shadowBlur = 0

    if (avatarImg) {
        ctx.save()
        ctx.beginPath(); ctx.arc(AX, AY, AR, 0, Math.PI * 2); ctx.clip()
        ctx.drawImage(avatarImg, AX - AR, AY - AR, AR * 2, AR * 2)
        ctx.restore()
    } else {
        ctx.beginPath(); ctx.arc(AX, AY, AR, 0, Math.PI * 2)
        ctx.fillStyle = `${ACCENT}1a`; ctx.fill()
        ctx.font = `bold ${Math.round(AR * 0.88)}px Arial`
        ctx.textAlign = "center"; ctx.textBaseline = "middle"
        ctx.fillStyle = ACCENT
        ctx.fillText((winnerUsername[0] ?? "?").toUpperCase(), AX, AY)
    }

    // WINNER badge pill
    const BADGE_Y = AY + AR + 44
    ctx.textAlign = "center"; ctx.textBaseline = "middle"
    ctx.font = "bold 26px Arial"
    const badgeText = isDraw ? "DRAW" : "WINNER 🏆"
    const bw = ctx.measureText(badgeText).width + 44, bh = 46
    ctx.fillStyle = `${ACCENT}20`
    ctx.beginPath(); ctx.roundRect(AX - bw / 2, BADGE_Y - bh / 2, bw, bh, bh / 2); ctx.fill()
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 2
    ctx.shadowColor = ACCENT; ctx.shadowBlur = 8; ctx.stroke(); ctx.shadowBlur = 0
    ctx.fillStyle = ACCENT; ctx.fillText(badgeText, AX, BADGE_Y)

    // Winner username
    ctx.font = "bold 60px Arial"; ctx.fillStyle = "#ffffff"
    ctx.shadowColor = ACCENT; ctx.shadowBlur = 14
    ctx.fillText(winnerUsername.length > 14 ? winnerUsername.slice(0, 13) + "…" : winnerUsername, AX, BADGE_Y + 74)
    ctx.shadowBlur = 0

    // ── Vertical divider ────────────────────────────────────────────────────
    const DIV_X = 530
    const divG = ctx.createLinearGradient(DIV_X, 148, DIV_X, 720)
    divG.addColorStop(0, "rgba(0,0,0,0)"); divG.addColorStop(0.2, `${ACCENT}55`)
    divG.addColorStop(0.8, `${ACCENT}55`); divG.addColorStop(1, "rgba(0,0,0,0)")
    ctx.strokeStyle = divG; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(DIV_X, 148); ctx.lineTo(DIV_X, 720); ctx.stroke()

    // ── Right column: amount ─────────────────────────────────────────────────
    const RX = 1085
    ctx.font = "bold 28px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle"
    ctx.fillStyle = `${ACCENT}bb`
    ctx.fillText(isDraw ? "REFUNDED" : "AMOUNT WON", RX, 210)

    const amountText = isDraw ? `${stake} PLAY` : `+${stake * 2} PLAY`
    let amtSize = 144
    ctx.font = `900 ${amtSize}px 'Arial Black', Arial`
    while (amtSize > 60 && ctx.measureText(amountText).width > 920) {
        amtSize -= 6; ctx.font = `900 ${amtSize}px 'Arial Black', Arial`
    }
    ctx.fillStyle = "#ffffff"; ctx.shadowColor = ACCENT; ctx.shadowBlur = 42
    ctx.fillText(amountText, RX, 375); ctx.shadowBlur = 0

    const stakeY = 375 + Math.round(amtSize * 0.62) + 22
    // ctx.font = "32px Arial"; ctx.fillStyle = "rgba(255,255,255,0.45)"
    // ctx.fillText(`Each wagered: ${stake} PLAY`, RX, stakeY)
    ctx.font = "26px Arial"; ctx.fillStyle = "rgba(255,255,255,0.25)"
    ctx.fillText(`Date: ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase()}`, RX, stakeY + 50)

    // ── Bottom panel — rectangular ───────────────────────────────────────────
    const PANEL_Y = 750
    const PANEL_H = H - 60 - PANEL_Y   // 190px

    // Background fill
    ctx.save()
    ctx.beginPath(); ctx.roundRect(60, PANEL_Y, W - 120, PANEL_H, [0, 0, 20, 20]); ctx.clip()
    const panelG = ctx.createLinearGradient(0, PANEL_Y, 0, H - 60)
    panelG.addColorStop(0, "rgba(18,10,48,0.85)"); panelG.addColorStop(1, "rgba(10,5,28,0.95)")
    ctx.fillStyle = panelG; ctx.fillRect(60, PANEL_Y, W - 120, PANEL_H)
    ctx.restore()

    // Top border line (accent gradient)
    const borderG = ctx.createLinearGradient(60, 0, W - 60, 0)
    borderG.addColorStop(0, "rgba(0,0,0,0)"); borderG.addColorStop(0.08, `${ACCENT}88`)
    borderG.addColorStop(0.92, `${ACCENT}88`); borderG.addColorStop(1, "rgba(0,0,0,0)")
    ctx.strokeStyle = borderG; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(60, PANEL_Y); ctx.lineTo(W - 60, PANEL_Y); ctx.stroke()

    // Outer panel rect stroke
    ctx.strokeStyle = `${ACCENT}28`; ctx.lineWidth = 1
    ctx.beginPath(); ctx.roundRect(60, PANEL_Y, W - 120, PANEL_H, [0, 0, 20, 20]); ctx.stroke()

    // ── Game label block: "GAME:" header + name lines (left-aligned) ─────────
    const HEADER_SIZE    = 24
    const HEADER_GAP     = 12
    const NAME_FONT_SIZE = 52
    const LINE_H         = 56
    const TEXT_X         = 90

    const linesH   = meta.lines.length * LINE_H
    const blockH   = HEADER_SIZE + HEADER_GAP + linesH
    const blockTop = PANEL_Y + (PANEL_H - blockH) / 2

    ctx.shadowBlur = 0   // explicitly no glow on any of this block

    // "GAME:" header — small, cyan, readable
    ctx.font = `bold ${HEADER_SIZE}px Arial`
    ctx.textAlign    = "left"
    ctx.textBaseline = "top"
    ctx.fillStyle    = CYAN
    ctx.fillText("GAME:", TEXT_X, blockTop)

    // Game name lines — plain white
    ctx.font = `bold ${NAME_FONT_SIZE}px orbitron`
    ctx.textBaseline = "alphabetic"
    ctx.fillStyle    = "#ffffff"

    let maxLineW = 0
    for (const line of meta.lines) {
        const w = ctx.measureText(line).width
        if (w > maxLineW) maxLineW = w
    }
    const linesTop = blockTop + HEADER_SIZE + HEADER_GAP + NAME_FONT_SIZE * 0.82
    meta.lines.forEach((line, i) => {
        ctx.fillText(line, TEXT_X, linesTop + i * LINE_H)
    })

    // ── Game card image — immediately right of the text, smaller & centered ──
    const IMG_GAP  = 30
    const IMG_SIZE = PANEL_H - 76   // smaller than the panel so it isn't stretched edge-to-edge
    const IMG_X    = TEXT_X + maxLineW + IMG_GAP
    const IMG_Y    = PANEL_Y + (PANEL_H - IMG_SIZE) / 2

    if (gameCardImg) {
        ctx.save()
        ctx.beginPath(); ctx.roundRect(IMG_X, IMG_Y, IMG_SIZE, IMG_SIZE, 10); ctx.clip()
        ctx.drawImage(gameCardImg, IMG_X, IMG_Y, IMG_SIZE, IMG_SIZE)
        ctx.restore()
        // subtle accent border on image
        ctx.strokeStyle = `${ACCENT}66`; ctx.lineWidth = 2
        ctx.beginPath(); ctx.roundRect(IMG_X, IMG_Y, IMG_SIZE, IMG_SIZE, 10); ctx.stroke()
    }

    // ── P-bot (bottom-right, overlaps panel) ────────────────────────────────
    if (pbotRes.status === "fulfilled") {
        ctx.drawImage(pbotRes.value, W - 390, H - 380, 340, 340)
    }

    return new Promise((resolve, reject) =>
        canvas.toBlob(b => b ? resolve(b) : reject(new Error("toBlob failed")), "image/png")
    )
}

export async function downloadWagerCard(params: WagerCardParams, filename: string): Promise<void> {
    const blob = await generateWagerCard(params)
    const isTouchDevice = window.matchMedia("(hover: none)").matches
    const file = new File([blob], filename, { type: "image/png" })
    if (isTouchDevice && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Chain Play Match Card" })
        return
    }
    const url = URL.createObjectURL(blob)
    const a   = document.createElement("a")
    a.href = url; a.download = filename
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export function buildWagerShareUrl(
    game: "rpc" | "maze",
    stake: number,
    payout: number,
    userWon: boolean,
    isDraw: boolean,
): string {
    const origin   = typeof window !== "undefined" ? window.location.origin : "https://app.chainplay.games"
    const gameName = game === "rpc" ? "Rock Paper Scissors" : "Maze Runner"
    let text: string
    if (isDraw) {
        text = [`🤝 I just played a draw in ${gameName} on Chain Play!`, ``, `Play and compete 👉 ${origin}`, `#ChainPlay #Solana #Gaming`].join("\n")
    } else if (userWon) {
        text = [`🏆 I just flipped ${stake} USDC playing ${gameName} on Chain Play!`, ``, `Won ${stake * 2} PLAY 🎉`, ``, `Play and compete 👉 ${origin}`, `#ChainPlay #Solana #Gaming`].join("\n")
    } else {
        text = [`😤 I played ${gameName} on Chain Play — GG to my opponent!`, ``, `Play and compete 👉 ${origin}`, `#ChainPlay #Solana #Gaming`].join("\n")
    }
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
}

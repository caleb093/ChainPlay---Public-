import { useCallback, useEffect, useRef, useState } from "react";

export interface SFXType {
    beamInteraction: string,
    gameOver: string,
    normalInteraction: string,
    shuffle: string,
    highscore: string,
    eatFood: string
}

const sfxs = {
    beamInteraction: "/sfx-audio/beam_interaction.wav",
    gameOver: "/sfx-audio/gameover.wav",
    normalInteraction: "/sfx-audio/interaction.wav",
    shuffle: "/sfx-audio/shuffle.wav",
    highscore: "/sfx-audio/highscore.m4a",
    eatFood: "/sfx-audio/snake_eat.wav"
};

const songs = [
    "/bg-music/Chill Lofi Retro Synthwave.mp3",
    "/bg-music/Chill Upbeat Retro Synthwave.mp3",
    "/bg-music/Retro Synthwave Arcade.mp3"
];

const useAudio = () => {
    const [isMuted, setIsMuted] = useState(false);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    // `started` flips to true on the first user gesture. Until then we never set
    // the audio `src` / call `.load()`, so the (multi-MB) bg-music mp3 is NOT
    // downloaded on initial page load — it was the single largest payload and
    // was competing with the LCP image for bandwidth. Browsers block autoplay
    // without a gesture anyway, so deferring costs us nothing behaviourally.
    const [started, setStarted] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const sfxAudioRef = useRef<HTMLAudioElement | null>(null);

    const playSfx = useCallback((type: keyof SFXType) => {
        if (sfxAudioRef.current) {

            sfxAudioRef.current.volume = 0.5;
            sfxAudioRef.current.src = sfxs[type];
            sfxAudioRef.current.load();

            // if (!isMuted) {
            sfxAudioRef.current
            .play()
            .catch((err) => console.warn("Playback blocked:", err));
            // }
        }
    }, [isMuted])

    // 🎲 Pick random song on mount
    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * songs.length);
        setCurrentSongIndex(randomIndex);
    }, []);

    
    // 🎵 Update audio whenever song/mute changes — but only after the first
    // user gesture, otherwise the mp3 would download on initial page load.
    useEffect(() => {
        if (!started) return;
        if (audioRef.current) {
            audioRef.current.volume = 0.3;
            audioRef.current.muted = isMuted;
            audioRef.current.src = songs[currentSongIndex];
            audioRef.current.load();

            if (!isMuted) {
                audioRef.current.play().catch(() => {});
            }
        }
    }, [started, isMuted, currentSongIndex]);

    // Start (and download) bg music on the first user interaction. Flipping
    // `started` triggers the effect above with the current song/mute state.
    useEffect(() => {
        if (started) return;
        const unlock = () => setStarted(true);

        document.addEventListener("click", unlock);
        document.addEventListener("keydown", unlock);
        document.addEventListener("touchstart", unlock);

        return () => {
            document.removeEventListener("click", unlock);
            document.removeEventListener("keydown", unlock);
            document.removeEventListener("touchstart", unlock);
        };
    }, [started]);

    const requestSong = (index: 0 | 1 | 2) => {
        setCurrentSongIndex(index)
    }

    // ⏭️ Go to next song on "ended"
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
    
        const handleEnded = () => {
        setCurrentSongIndex((prev) => (prev + 1) % songs.length);
        };
    
        audio.addEventListener("ended", handleEnded);
        return () => {
        audio.removeEventListener("ended", handleEnded);
        };
    }, [songs.length]);
    
    const toggleMute = useCallback(() => {
        // setIsMuted((prev) => !prev);
    
        // if (audioRef.current && isMuted) {
        // audioRef.current
        //     .play()
        //     .catch((error) => console.error("Audio playback failed:", error));
        // }
        setIsMuted(prev => {
            const next = !prev;
            if (audioRef.current && next === false) { // only when unmuting
            audioRef.current.play().catch(err => console.error("Audio playback failed:", err));
            }
            return next;
        });
    },[]);

    return {audioRef, sfxAudioRef, playSfx, isMuted, requestSong, toggleMute}
}

export default useAudio



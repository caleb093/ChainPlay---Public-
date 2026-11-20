"use client"
import { useRouter } from "next/navigation"
import { useLayoutEffect } from "react"

const GameIndex = () => {
    const router = useRouter()

    useLayoutEffect(() => {
        // No standalone /games view — bounce to home without leaving a history entry.
        router.replace("/")
    },[])

    return null
}

export default GameIndex
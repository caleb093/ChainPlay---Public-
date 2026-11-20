import { FC } from "react"

const Loading:FC<{small?: boolean, color?: string}> = ({small, color = "#cbd5e1"}) => {
    return (
        <div className={`${small ? "w-5 h-5 border-2" : "w-16 h-16 border-4 mb-4 "} mx-auto border-t-transparent border-[${color}] rounded-full animate-spin `}></div>
    )
}

export default Loading
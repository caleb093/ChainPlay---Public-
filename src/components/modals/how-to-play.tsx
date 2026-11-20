import { FC, ReactNode } from "react"
import Modal from "../seondary/modal"
import { Inter } from "next/font/google"

const interfont = Inter({
    variable: "--",
    subsets: ["latin"]
});

const HowToPlay:FC<{children: ReactNode, isOpen: boolean, onClose: () => void}> = ({children, isOpen, onClose}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className={interfont.className}>
                <h2 className="text-2xl font-bold mb-4 text-center">How to Play?</h2>
                {children}
            </div>
        </Modal>
    )
}

export default HowToPlay
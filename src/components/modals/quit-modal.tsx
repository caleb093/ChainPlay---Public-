import { FC, ReactNode } from "react"
import Modal from "../seondary/modal"
import Button from "../primary/Button"
import Link from "next/link"
import { Inter } from "next/font/google"

const interfont = Inter({
    variable: "--",
    subsets: ["latin"]
});

const QuitModal:FC<{isOpen: boolean, onClose: () => void}> = ({isOpen, onClose}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className={interfont.className}>
                <h1 className="text-2xl font-bold">Quit Game?</h1>
                <p className="py-3" >Quitting will forfeit your score and any token used.</p>
                <div className="flex  items-center gap-4">
                    <Link className="bg-red-600 flex-1 py-2 rounded-md" href={"/"}>Quit</Link>
                    <Button onClick={onClose} className="flex-1 cursor-pointer hover:bg-transparent">keep playing</Button>
                </div>
            </div>
        </Modal>
    )
}

export default QuitModal
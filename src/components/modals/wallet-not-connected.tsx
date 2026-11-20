import { FileWarningIcon, Info } from "lucide-react"
import Modal from "../seondary/modal"
import Link from "next/link"
import { Inter } from "next/font/google"
import { ReactNode } from "react";

const interfont = Inter({
    variable: "--",
    subsets: ["latin"]
});

const WarningModal = ({handleClose, children, isOpen, header}: {handleClose: ()=> void, children: ReactNode, isOpen: boolean, header: string}) => {
    return (
        <Modal isOpen={isOpen} onClose={handleClose} containerClassname="md:w-[28em] text-center" hideCloseIcon>
            <div className={interfont.className}>
                <h1 className="text-[1.5em]">{header}</h1>
                <Info className="rotate-[180deg] mx-auto my-4 text-red-600" height={40} width={40} />
                {children}
                {/* <p>wallet already linked? <br/> connect on <Link className="border-b text-teal-600 bottom-[2px] relative" href={"/"}>home</Link> ( avatar, top-right ) </p>
                <br />
                <p>wallet not linked? <br /> Link wallet on <Link className="border-b text-teal-600 bottom-[2px] relative" href={"/profile"}>profile page</Link></p> */}
            </div>
        </Modal>
    )
}

export default WarningModal
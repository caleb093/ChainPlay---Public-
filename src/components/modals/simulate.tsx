import { FC } from "react"
import Modal from "../seondary/modal"
import Loading from "../seondary/Loading"

const Simulate:FC<{isOpen: boolean, onClose: () => void}> = ({isOpen, onClose}) => {
    return (
        <Modal isOpen={isOpen} onClose={() => {}} hideCloseIcon>
            <div className="text-center flex flex-col gap-10">
                <h1>Simulating blockchain interaction</h1>
                <Loading />
                <p className="text-red-600 italic">-0.05$</p>
            </div>
        </Modal>
    )
}

export default Simulate
import { FC, useContext } from "react"
import Modal from "../seondary/modal"
import Button from "../primary/Button"
import useProgramInstructions from "@/util/useProgramInstructions"
import { useLoading } from "@/util/hooks"
import { Info } from "lucide-react"
import { solanaProgramContext } from "@/contexts/anchorProvider"
import toast from "react-hot-toast"
import { usePostOnchainAccountInitializedMutation } from "../../../api-feature/apiSlice"
import { useWallet } from "@solana/wallet-adapter-react"
import { appContext } from "@/contexts/appContext"

const InitializeAccountModal:FC<{isOpen: boolean, onClose: () => void}> = ({isOpen, onClose}) => {
    const {initializeUser} = useProgramInstructions()
    const {loading, startLoading, stopLoading} = useLoading()
    const {walletAddress} = useContext(appContext)
    const {getUserOnchainData} = useContext(solanaProgramContext)
    const [accountInitialized] = usePostOnchainAccountInitializedMutation()

    const handleInitialize = async () => {
        try {
            startLoading()
            await initializeUser()
            walletAddress && accountInitialized({walletAddress: walletAddress})
            toast.success("Account Initialized, fetching data...")
            await getUserOnchainData()
        } catch (error) {
            console.log(error)
        } finally {
            stopLoading()
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={() => {}} hideCloseIcon loading={loading}>
            <div className="text-[#a1a1aa] text-center">
                <p className="text-[1.5em] ">Initialize Account</p>

                <Info className="rotate-[180deg] mx-auto my-4 text-red-600" height={40} width={40} />

                <p className="text-[0.9em] w-[70%] mx-auto">initialize your account to start interacting on the platform</p>

                <Button onClick={handleInitialize} className="w-full retro-button mt-9">Intiailize</Button>
            </div>
        </Modal>
    )
}

export default InitializeAccountModal
import toast from "react-hot-toast"
import useModal from "./useModal"
import useProgramInstructions from "./useProgramInstructions"
import { useLoading } from "./hooks"
import { useContext } from "react"
import { solanaProgramContext } from "@/contexts/anchorProvider"
import { useLazyGetGameStartQuery } from "../../api-feature/apiSlice"
import { GAME_NAMES } from "../../api-feature/types"
import { appContext } from "@/contexts/appContext"

const useSimulateContract = (callBack: () => void, gameName: GAME_NAMES) => {
    // const {modalOpen: simulateOpen, closeModal: closeSimulateModal, openModal: openSimulateModal} = useModal()
    const {loading: interactionLoading, startLoading, stopLoading} = useLoading()
    const {gameInteraction} = useProgramInstructions()
    const {getUserOnchainData} = useContext(solanaProgramContext)
    const {gameSessionToken, isGuest} = useContext(appContext)
    const [triggerStartGame, {data, status, error}] = useLazyGetGameStartQuery()

    const contractInteract = async () => {
        // Guests skip the game-start endpoint entirely — just launch the game.
        if (isGuest) {
            callBack()
            return
        }

        const toastId = toast
        startLoading()

        try {
            toastId.loading("starting game")
            const data = await triggerStartGame({gameName: gameName, txSignature: ""})
            gameSessionToken.current = data?.data?.gameSessionToken
            toastId.dismiss()
            callBack()
        } catch (error) {
            console.error(error)
            toast.error("Error starting Game")
            toastId.dismiss()
        } finally{
            stopLoading()
        }
            
        // try {
        //     toastId.loading("interacting")
        //     const txSignature = await gameInteraction()
        //     if (txSignature) {
        //         const data = await triggerStartGame({gameName: gameName, txSignature: txSignature})
        //         console.log(data?.data?.gameSessionToken)
        //         gameSessionToken.current = data?.data?.gameSessionToken
        //         toastId.dismiss()
        //         callBack()
        //         getUserOnchainData()
        //     }
        // } catch (error) {
        //     console.error(error)
        //     toastId.dismiss()
        //     toast.error("Transaction Failed")
        //     throw error
        // } finally {
        //     stopLoading()
        // }
    }

    return {contractInteract, interactionLoading}
}

export default useSimulateContract
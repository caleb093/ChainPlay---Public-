import { useCallback, useState } from "react"

const useModal = () => {
    const [modalOpen, setModalOpen] = useState(false)
    
    const closeModal = useCallback(() => {
        setModalOpen(false);
    },[]);

    const openModal = useCallback(() => {
        setModalOpen(true);
    },[]);

    const toggleModal = useCallback(() =>{
        setModalOpen(prev => !prev)
    },[])

    return {modalOpen, closeModal, openModal, toggleModal}
}

export default useModal
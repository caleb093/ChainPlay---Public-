import { useState } from "react"

const useDropdown = () => {
    const [dropOpen, setDropOpen] = useState(false)

    const toggleDropdown = () => {
        setDropOpen(prev => !prev)
    }

    const openDropDown = () => {
        setDropOpen(true)
    }

    const closeDropDown = () => {
        setDropOpen(false)
    }

    return {dropOpen, toggleDropdown, closeDropDown, openDropDown}
}

const useLoading = () => {
    const [loading, setLoading] = useState(false)

    const startLoading = () => {
        setLoading(true)
    }

    const stopLoading = () => {
        setLoading(false)
    }

    return {loading, startLoading, stopLoading}
}

export {useDropdown, useLoading}

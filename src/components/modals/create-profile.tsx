import { FC, useContext, useState } from "react"
import Modal from "../seondary/modal"
import { Input } from "../primary/Input"
import ImageUpload from "../seondary/imageUpload"
import useImageUpload from "@/util/useImageUpload"
import Button from "../primary/Button"
import { appContext } from "@/contexts/appContext"
import { globalState } from "../../../api-feature/apiSlice"
import { useLoading } from "@/util/hooks"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

function isReferralValidFormat(input: string): boolean {
  const regex = /^PLAY-\d{3}[A-Za-z]{4}$/;
  return regex.test(input);
}

const CreateProfileModal:FC<{isOpen: boolean, onClose: () => void}> = ({isOpen, onClose}) => {
    const {loading, startLoading, stopLoading} = useLoading()
    const {syncUserProfile} = useContext(appContext)
    const router = useRouter()
    const [inputData, setInputData] = useState({
        username: "",
        refferalCode: ""
    })
    const [errors, setErrors] = useState({username: "", refferalCode: ""})
    const {selectedImage, handleSelectImage, fileIsTooLarge, imageFile} = useImageUpload()
    const {setSignedIn, appCloseModalHandler} = useContext(appContext)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setErrors({username: "", refferalCode: ""})
        console.log(globalState)
        console.log(inputData.username)
        if (inputData.username.length <= 2){
            setErrors(prev => ({...prev, username: "length must be greater than 2"}))
            return
        }

        if (inputData.refferalCode.length >= 1){
            if (!isReferralValidFormat(inputData.refferalCode)) {
                setErrors(prev => ({...prev, refferalCode: "Invalid format. PLAY-000AAAA"}))
                return
            }
        }

        startLoading()

        const formData = new FormData()
        formData.append("username", inputData.username)
        if (inputData.refferalCode) formData.append("referralCode", inputData.refferalCode)
        if (imageFile) formData.append("avatar", imageFile)

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/onboard`, {
                method: "POST",
                headers: { Authorization: `Bearer ${globalState.authorizationToken}` },
                body: formData,
            })
            const data = await res.json()
            if (!res.ok) throw { data }

            syncUserProfile({username: inputData.username, ...(data.avatar ? {avatar: data.avatar} : {})})
            toast.success("onboarding complete")
            appCloseModalHandler("profile")
            router.push("/profile")
        } catch (error: any) {
            console.error(error)
            if (error?.data?.message === "username already taken") {
                setErrors(prev => ({...prev, username: "username is taken"}))
            } else {
                toast.error(
                    typeof error?.data?.message === "string"
                        ? error.data.message
                        : "Error, reload page"
                );
            }
        } finally {
            stopLoading()
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={() => {}} loading={loading} hideCloseIcon>
            <div className="text-[#a1a1aa]">
                <h1
                    className="text-2xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ff] via-[#ff00ff] to-[#00f2ff] mb-4"
                    style={{
                        textShadow: '0 0 4px #00f2ff',
                    }}
                >
                    Create Profile
                </h1>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <Input 
                        required
                        value={inputData.username}
                        onChange={(e) => setInputData(prev => ({...prev, username: e.target.value}))}
                        label={<label className=" font-medium text-[0.9em] mb-2">username</label>}
                        type="text"
                        helperText={errors.username}
                    />

                    <div className="">
                        <p className="text-[0.9em]">upload avatar (optional)</p>
                        <ImageUpload selectedImage={selectedImage} handleSelectImage={handleSelectImage} fileIsTooLarge={fileIsTooLarge}>
                            <div className="py-10">
                                <p className="text-[14px] font-[500]">Click to upload</p>
                                <p className="text-[12px] font-[500]">(PNG, JPEG, JPG)</p>
                            </div> 
                        </ImageUpload>
                    </div>

                    <Input 
                        value={inputData.refferalCode}
                        onChange={(e) => setInputData(prev => ({...prev, refferalCode: e.target.value}))}
                        label={<label className=" font-medium text-[0.9em] mb-2">Referral code (optional)</label>}
                        type="text"
                        placeholder="PLAY-000AAAA"
                        helperText={errors.refferalCode}
                    />

                    <Button type={"sumbit"} className="w-full retro-button mt-2">
                        Continue
                    </Button>

                </form>
                {/* <Button onClick={() => {setSignedIn(true), onClose()}} className="w-full retro-button mt-4">
                    Continue
                </Button> */}
            </div>
        </Modal>
    )
}

export default CreateProfileModal
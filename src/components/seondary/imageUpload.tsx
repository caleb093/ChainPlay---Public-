import { FC, ReactNode, useRef } from "react"
import Image from "next/image"
import { twMerge } from "tailwind-merge";

interface props {
    selectedImage: string;
    handleSelectImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
    fileIsTooLarge: boolean;
    className?: string;
    children: ReactNode
}

const ImageUpload:FC<props> = ({selectedImage, handleSelectImage, fileIsTooLarge, className, children}) => {
    const inputRef = useRef(null)

    return (
        <>
            {/* @ts-ignore */}
            <div onClick={() => inputRef.current?.click()} className={twMerge(` overflow-hidden flex flex-col justify-center mx-auto items-center rounded-xl w-[15em] h-[7.5em] my-3 border-2 border-white border-dashed ${className} `)}>
                {!selectedImage ? 
                        children
                    :
                    <>
                        <Image
                            width={100}
                            height={100}
                            src={selectedImage}
                            alt="Thumbnail"
                            className="w-full h-full object-contain"
                        />
                    </>
                }
                <div>
                    <input ref={inputRef} type="file" className="hidden" accept="image/*" onChange={handleSelectImage} />
                </div>
            </div>
            {fileIsTooLarge && (
                <p className="text-[12px] text-red-700 text-center ">
                    ❗File is too large (4mb)
                </p>
            )}
        </>
    )
}

export default ImageUpload
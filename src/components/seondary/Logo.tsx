import Image from "next/image"

const Logo = () => {
    return (
        <div className="mb-6 flex justify-center">
            <div className="h-28 w-28 rounded-full bg-[#09091e] border border-slate-800 flex items-center justify-center overflow-hidden">
                <Image src={"/icons/logo_bold.webp"} className="rounded-full scale-[1.2]" alt="logo" width={112} height={112} />
            </div>
        </div>
    )
}

export default Logo
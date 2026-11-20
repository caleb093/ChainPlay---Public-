import { XCircle } from "lucide-react";
import { Inter } from "next/font/google"

const interfont = Inter({
    variable: "--",
    subsets: ["latin"]
});

const ErrorPopup = ({show, callback, text}: {show: boolean, callback: () => void, text: string}) => {
    if (show)

    return (
        <div className={` ${interfont.className} fixed top-5 right-5 z-[50] animate-slideIn`}>
            <div className="flex items-center gap-3 bg-red-600 text-white rounded-xl shadow-lg px-4 py-3 ">
                {/* <XCircle className="w-5 h-5 text-white shrink-0" /> */}
                <p className="text-sm flex-1">{text}</p>
                <button
                    onClick={callback}
                    className="bg-white text-red-600 text-xs font-medium rounded-md px-2 py-1 hover:bg-gray-100 transition"
                >
                    Retry
                </button>
            </div>
        </div>
    )
}

export default ErrorPopup
import Loading from "./Loading"

const LoadingOverlay = () => {
    return (
        <div className="fixed flex items-center justify-center h-screen w-screen z-[120] bg-black/50">
            <Loading  />
        </div>
    )
}

export default LoadingOverlay
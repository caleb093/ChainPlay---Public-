const VersusComponent = () => {
    return (
        <div className="fixed flex flex-col items-center justify-center w-screen h-screen bg-[#3835c0] z-[5]">
            <div className="flex items-center justify-center h-[70%] bg-red-500">
                <p className="relative bottom-0">Player 1</p>
                <div className="flex gap-2 items-center justify-center">
                    <h1>V</h1>
                    <h1>S</h1>
                </div>
                <p>Player 2</p>
            </div>
        </div>
    )
}

export default VersusComponent
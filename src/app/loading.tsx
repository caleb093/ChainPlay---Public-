// Route-transition fallback. Rendered instantly by the App Router while the
// destination route segment loads/renders, so navigation gives immediate
// feedback instead of appearing to hang on the previous page.
export default function Loading() {
  return (
    <div className="fixed inset-0 z-[50] flex items-center justify-center bg-[#06060f]">
      <div className="flex flex-col items-center gap-5">
        <div className="relative h-14 w-14">
          <span className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
          <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#00ffe1] border-r-[#00ffe1] animate-spin [box-shadow:0_0_14px_rgba(0,255,225,0.5)]" />
        </div>
        <p
          className="text-[10px] tracking-[0.5em] uppercase text-[#00ffe1]"
          style={{ textShadow: "0 0 10px #00ffe1" }}
        >
          Loading...
        </p>
      </div>
    </div>
  );
}

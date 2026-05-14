export default function Navbar({ onStart }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3.5 bg-[#0b0719]/90 backdrop-blur-sm border-b border-white/5">
      <div className="flex items-center gap-2">
        <span className="font-bold text-base tracking-tight text-white">PPTSD</span>
      </div>
      <div className="hidden md:flex items-center gap-6 text-sm text-white/60">
        <span className="cursor-default">발표 준비</span>
        <span className="cursor-default">기록</span>
        <span className="cursor-default">리포트</span>
        <span className="cursor-default">설정</span>
      </div>
      {onStart && (
        <button
          onClick={onStart}
          className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          무료로 시작하기
        </button>
      )}
    </nav>
  )
}

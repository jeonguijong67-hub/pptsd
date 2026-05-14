import Navbar from '../components/Navbar'

function ScoreRingPreview() {
  const score = 71
  const r = 50
  const circ = 2 * Math.PI * r
  return (
    <div className="bg-[#150c2b] border border-white/10 rounded-2xl p-6 shadow-2xl shadow-violet-900/30">
      <p className="text-white/40 text-xs mb-5">나의 발표 점수 리포트</p>
      <div className="flex items-center gap-6 mb-6">
        <div className="relative w-28 h-28 shrink-0">
          <svg width="112" height="112" viewBox="0 0 120 120" className="-rotate-90">
            <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
            <circle
              cx="60" cy="60" r={r} fill="none" strokeWidth="8"
              stroke="url(#lgLanding)" strokeLinecap="round"
              strokeDasharray={`${(score / 100) * circ} ${circ}`}
            />
            <defs>
              <linearGradient id="lgLanding" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white">{score}</span>
            <span className="text-white/40 text-xs">점</span>
          </div>
        </div>
        <div className="text-sm">
          <p className="text-white font-semibold mb-0.5">전체적으로 양호해요</p>
          <p className="text-white/50 text-xs leading-relaxed">말 속도와 필러워드를<br />조금 더 다듬어보세요</p>
        </div>
      </div>
      <div className="space-y-3">
        {[
          { label: '말 속도', score: 72, color: '#8b5cf6' },
          { label: '반복 표현', score: 61, color: '#ec4899' },
        ].map(item => (
          <div key={item.label}>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-white/60">{item.label}</span>
              <span className="text-white font-medium">{item.score}<span className="text-white/40">/100</span></span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${item.score}%`, background: item.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function LandingPage({ onStart }) {
  return (
    <div className="min-h-screen bg-[#0b0719] text-white">
      <Navbar onStart={onStart} />

      <div className="pt-24 px-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-16 min-h-[calc(100vh-6rem)] py-16">
          {/* Left */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              ✦ AI 발표 분석 서비스
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-[1.2] mb-5 tracking-tight">
              발표 PTSD를 줄이는
              <br />
              <span className="gradient-text">AI 리허설 코치</span>
              <br />
              — PPTSD
            </h1>
            <p className="text-white/55 text-lg mb-8 leading-relaxed">
              발표 연습 영상을 AI가 분석하여
              <br />
              필러워드, 말 속도를 데이터로 알려드립니다.
              <br />
              발표 트라우마, 이제 데이터로 해결하세요.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={onStart}
                className="bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-violet-500/25 cursor-pointer"
              >
                무료로 시작하기 →
              </button>
              <span className="text-white/35 text-sm">OpenAI Whisper 기반</span>
            </div>

            <div className="mt-12 flex items-center gap-6">
              {[
                { num: '95%', label: '발표 정확도' },
                { num: '5가지', label: '필러워드 감지' },
                { num: '실시간', label: '타임스탬프' },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xl font-bold gradient-text">{item.num}</p>
                  <p className="text-white/40 text-xs mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Preview */}
          <div className="flex-1 max-w-sm w-full">
            <ScoreRingPreview />
          </div>
        </div>
      </div>
    </div>
  )
}

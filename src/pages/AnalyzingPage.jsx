import { useState, useEffect } from 'react'

const STEPS = [
  { id: 1, label: '녹음 텍스트 정리 중', desc: 'Web Speech API 결과를 정리하고 있어요' },
  { id: 2, label: '필러워드 분석 중', desc: '음·어·그·약간·이제 등을 집계하고 있어요' },
  { id: 3, label: '말 속도 측정 중', desc: '분당 어절 수를 계산하고 있어요' },
  { id: 4, label: '리포트 생성 중', desc: '분석 결과를 정리하고 있어요' },
]

export default function AnalyzingPage() {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const duration = 850
    const interval = 40
    const step = 100 / (duration / interval)
    let current = 0

    const timer = setInterval(() => {
      current = Math.min(current + step, 96)
      setProgress(Math.round(current))
      setCurrentStep(Math.min(Math.floor(current / 25), STEPS.length - 1))
    }, interval)

    return () => clearInterval(timer)
  }, [])

  const r = 54
  const circ = 2 * Math.PI * r

  return (
    <div className="min-h-screen bg-[#0b0719] text-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-lg text-center">
        <div className="mb-2 text-violet-400 text-sm font-medium">분석 진행 중</div>
        <h1 className="text-2xl font-bold mb-8">AI가 발표를 분석하고 있어요</h1>

        {/* Progress ring */}
        <div className="flex justify-center mb-10">
          <div className="relative w-36 h-36">
            <svg width="144" height="144" viewBox="0 0 120 120" className="-rotate-90">
              <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
              <circle
                cx="60" cy="60" r={r} fill="none" strokeWidth="7"
                stroke="url(#analyzeGrad)" strokeLinecap="round"
                strokeDasharray={`${(progress / 100) * circ} ${circ}`}
                style={{ transition: 'stroke-dasharray 0.08s linear' }}
              />
              <defs>
                <linearGradient id="analyzeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{progress}</span>
              <span className="text-white/40 text-sm">%</span>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-[#150c2b] border border-white/8 rounded-2xl p-5 text-left space-y-3">
          {STEPS.map((step, i) => {
            const done = i < currentStep
            const active = i === currentStep
            return (
              <div key={step.id} className={`flex items-center gap-3 transition-opacity ${done || active ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  done ? 'bg-violet-500 text-white' : active ? 'bg-violet-500/20 border border-violet-500 text-violet-400' : 'bg-white/5 text-white/30'
                }`}>
                  {done ? '✓' : step.id}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${active ? 'text-white' : done ? 'text-white/70' : 'text-white/30'}`}>
                    {step.label}
                  </p>
                  {active && (
                    <p className="text-white/40 text-xs mt-0.5">{step.desc}</p>
                  )}
                </div>
                {active && (
                  <div className="flex gap-1 shrink-0">
                    {[0, 1, 2].map(d => (
                      <span
                        key={d}
                        className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${d * 0.15}s` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <p className="text-white/30 text-xs mt-6">
          발표 길이에 따라 30초~2분 정도 소요됩니다
        </p>
      </div>
    </div>
  )
}

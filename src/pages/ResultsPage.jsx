import { useState } from 'react'
import Navbar from '../components/Navbar'

const FILLER_WORDS = ['음', '어', '그', '약간', '이제']

function ScoreRing({ score, size = 144 }) {
  const r = 50
  const circ = 2 * Math.PI * r
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 120 120" className="-rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={r} fill="none" strokeWidth="8"
          stroke="url(#resGrad)" strokeLinecap="round"
          strokeDasharray={`${(score / 100) * circ} ${circ}`}
        />
        <defs>
          <linearGradient id="resGrad" x1="0%" y1="0%" x2="100%" y2="0%">
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
  )
}

function MetricBar({ value, max = 100, color = '#8b5cf6' }) {
  return (
    <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${(value / max) * 100}%`, background: color }}
      />
    </div>
  )
}

function SpeechRateDetail({ results }) {
  const { wpm, speechRateScore, speechRateStatus, speechRateTip, totalWords, durationStr } = results
  const IDEAL_MIN = 130, IDEAL_MAX = 180

  const markers = [
    { wpm: 80, label: '80' },
    { wpm: IDEAL_MIN, label: String(IDEAL_MIN) },
    { wpm: IDEAL_MAX, label: String(IDEAL_MAX) },
    { wpm: 230, label: '230' },
  ]
  const scaleMin = 60, scaleMax = 250
  const toPercent = (v) => ((Math.min(Math.max(v, scaleMin), scaleMax) - scaleMin) / (scaleMax - scaleMin)) * 100

  return (
    <div className="bg-[#120a24] border border-white/8 rounded-2xl p-6 mt-3">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-white font-semibold mb-1">말 속도 세부 분석</p>
          <p className="text-white/50 text-sm">{speechRateStatus} — 분당 {wpm}어절</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-bold text-white">{speechRateScore}</p>
          <p className="text-white/40 text-xs">/100</p>
        </div>
      </div>

      {/* Speed gauge bar */}
      <div className="mb-6">
        <div className="relative h-3 bg-white/5 rounded-full overflow-visible mb-1">
          {/* Ideal zone */}
          <div
            className="absolute h-full bg-violet-500/20 rounded"
            style={{
              left: `${toPercent(IDEAL_MIN)}%`,
              width: `${toPercent(IDEAL_MAX) - toPercent(IDEAL_MIN)}%`,
            }}
          />
          {/* Current position */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg shadow-violet-500/50 -translate-x-1/2 z-10"
            style={{ left: `${toPercent(wpm)}%` }}
          />
        </div>
        <div className="relative flex justify-between text-[10px] text-white/30 mt-3">
          {markers.map(m => (
            <div key={m.wpm} className="flex flex-col items-center" style={{ position: 'absolute', left: `${toPercent(m.wpm)}%`, transform: 'translateX(-50%)' }}>
              <span>{m.label}</span>
            </div>
          ))}
          <div style={{ visibility: 'hidden', fontSize: '10px' }}>placeholder</div>
        </div>
        <div className="flex justify-center mt-6 gap-4 text-xs text-white/40">
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-violet-500/40 rounded-sm inline-block" /> 적정 구간 ({IDEAL_MIN}–{IDEAL_MAX})</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-white rounded-full inline-block" /> 내 속도 ({wpm})</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: '분당 어절', value: `${wpm}어절` },
          { label: '총 어절', value: `${totalWords}개` },
          { label: '발표 시간', value: durationStr },
        ].map(s => (
          <div key={s.label} className="bg-white/4 rounded-xl p-3 text-center">
            <p className="text-white font-semibold text-lg">{s.value}</p>
            <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Coaching */}
      <div className="bg-violet-500/8 border border-violet-500/15 rounded-xl p-4">
        <p className="text-violet-300 text-xs font-semibold mb-1">💡 코치 피드백</p>
        <p className="text-white/70 text-sm leading-relaxed">{speechRateTip}</p>
      </div>
    </div>
  )
}

function FillerDetail({ results }) {
  const { fillersByType, totalFillers, fillersPerMinute, fillerScore, fillerTip, durationStr } = results
  const maxCount = Math.max(...FILLER_WORDS.map(fw => fillersByType[fw]?.length || 0), 1)

  return (
    <div className="bg-[#120a24] border border-white/8 rounded-2xl p-6 mt-3">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-white font-semibold mb-1">반복 표현 세부 분석</p>
          <p className="text-white/50 text-sm">총 {totalFillers}회 감지 — 분당 {fillersPerMinute}회</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-bold text-white">{fillerScore}</p>
          <p className="text-white/40 text-xs">/100</p>
        </div>
      </div>

      {/* Filler word bars */}
      <div className="space-y-3 mb-6">
        {FILLER_WORDS.map(fw => {
          const items = fillersByType[fw] || []
          const count = items.length
          return (
            <div key={fw}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="bg-white/8 text-white/80 text-xs font-mono px-2 py-0.5 rounded">&quot;{fw}&quot;</span>
                  {count > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {items.slice(0, 6).map((item, i) => (
                        <span key={i} className="bg-pink-500/10 text-pink-300 text-[10px] px-1.5 py-0.5 rounded">
                          {item.timeStr}
                        </span>
                      ))}
                      {items.length > 6 && (
                        <span className="text-white/30 text-[10px] py-0.5">+{items.length - 6}</span>
                      )}
                    </div>
                  )}
                </div>
                <span className={`text-sm font-semibold shrink-0 ${count > 0 ? 'text-pink-400' : 'text-white/20'}`}>
                  {count}회
                </span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: count > 0 ? `${(count / maxCount) * 100}%` : '0%',
                    background: count > 0 ? 'linear-gradient(90deg, #7c3aed, #ec4899)' : 'transparent',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: '총 필러워드', value: `${totalFillers}회` },
          { label: '분당 빈도', value: `${fillersPerMinute}회` },
          { label: '발표 시간', value: durationStr },
        ].map(s => (
          <div key={s.label} className="bg-white/4 rounded-xl p-3 text-center">
            <p className={`font-semibold text-lg ${totalFillers > 0 ? 'text-pink-400' : 'text-white'}`}>{s.value}</p>
            <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Coaching */}
      <div className="bg-pink-500/8 border border-pink-500/15 rounded-xl p-4">
        <p className="text-pink-300 text-xs font-semibold mb-1">💡 코치 피드백</p>
        <p className="text-white/70 text-sm leading-relaxed">{fillerTip}</p>
      </div>
    </div>
  )
}

function MetricCard({ title, score, sub, color, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 text-left bg-[#150c2b] border rounded-2xl p-5 transition-all cursor-pointer ${
        active ? 'border-violet-500/50 bg-[#1c1040]' : 'border-white/8 hover:border-white/15'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-white font-semibold">{title}</p>
          <p className="text-white/50 text-xs mt-0.5">{sub}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-white">{score}</span>
          <span className="text-white/40 text-sm">/100</span>
        </div>
      </div>
      <MetricBar value={score} color={color} />
      <p className={`text-xs mt-3 font-medium ${active ? 'text-violet-400' : 'text-white/30'}`}>
        {active ? '세부 분석 닫기 ↑' : '세부 분석 보기 ↓'}
      </p>
    </button>
  )
}

export default function ResultsPage({ results, onReset }) {
  const [openDetail, setOpenDetail] = useState(null)

  const toggle = (key) => setOpenDetail(prev => prev === key ? null : key)

  const overallLabel =
    results.overallScore >= 80 ? '훌륭한 발표예요!' :
    results.overallScore >= 60 ? '조금만 다듬으면 완벽해요' :
    '개선할 포인트가 있어요'

  return (
    <div className="min-h-screen bg-[#0b0719] text-white">
      <Navbar />

      <div className="pt-24 pb-16 px-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-violet-400 text-sm font-medium mb-1">분석 완료</p>
            <h1 className="text-2xl font-bold">발표 분석 리포트</h1>
          </div>
          <button
            onClick={onReset}
            className="text-sm text-white/40 hover:text-white/80 transition-colors border border-white/10 hover:border-white/20 px-4 py-2 rounded-lg cursor-pointer"
          >
            새 영상 분석
          </button>
        </div>

        {/* Overall score */}
        <div className="bg-[#150c2b] border border-white/8 rounded-2xl p-6 mb-6 flex items-center gap-6">
          <ScoreRing score={results.overallScore} />
          <div className="flex-1">
            <p className="text-white/50 text-sm mb-1">전체 점수</p>
            <p className="text-xl font-bold text-white mb-2">{overallLabel}</p>
            <p className="text-white/50 text-sm leading-relaxed">
              말 속도 {results.speechRateScore}점, 반복 표현 {results.fillerScore}점을 기록했습니다.
              {results.totalFillers > 0
                ? ` 필러워드 "${Object.entries(results.fillersByType).sort((a, b) => b[1].length - a[1].length)[0]?.[0]}"의 빈도를 줄이는 것이 핵심 과제입니다.`
                : ' 필러워드 없이 깔끔하게 발표했습니다!'}
            </p>
            <div className="flex gap-4 mt-3">
              <span className="bg-white/5 text-white/60 text-xs px-2.5 py-1 rounded-full">
                발표 시간 {results.durationStr}
              </span>
              <span className="bg-white/5 text-white/60 text-xs px-2.5 py-1 rounded-full">
                총 {results.totalWords}어절
              </span>
              <span className="bg-white/5 text-white/60 text-xs px-2.5 py-1 rounded-full">
                필러워드 {results.totalFillers}회
              </span>
            </div>
          </div>
        </div>

        {/* Metric cards */}
        <p className="text-white/50 text-sm font-medium mb-3">항목별 점수</p>
        <div className="flex flex-col md:flex-row gap-4 mb-2">
          <MetricCard
            title="말 속도"
            score={results.speechRateScore}
            sub={`${results.wpm}어절/분 · ${results.speechRateStatus}`}
            color="#8b5cf6"
            active={openDetail === 'speech'}
            onClick={() => toggle('speech')}
          />
          <MetricCard
            title="반복 표현"
            score={results.fillerScore}
            sub={`총 ${results.totalFillers}회 · 분당 ${results.fillersPerMinute}회`}
            color="#ec4899"
            active={openDetail === 'filler'}
            onClick={() => toggle('filler')}
          />
        </div>

        {/* Detail panels */}
        {openDetail === 'speech' && <SpeechRateDetail results={results} />}
        {openDetail === 'filler' && <FillerDetail results={results} />}

        {/* Transcript */}
        <details className="mt-6 group">
          <summary className="cursor-pointer text-white/40 text-sm hover:text-white/70 transition-colors select-none flex items-center gap-2">
            <span className="group-open:rotate-90 transition-transform inline-block">›</span>
            전체 텍스트 보기
          </summary>
          <div className="mt-3 bg-[#150c2b] border border-white/8 rounded-xl p-4 text-white/60 text-sm leading-relaxed">
            {results.transcript || '(텍스트 없음)'}
          </div>
        </details>
      </div>
    </div>
  )
}

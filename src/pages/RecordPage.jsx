import { useState, useRef, useEffect } from 'react'
import Navbar from '../components/Navbar'

const FILLER_WORDS = ['음', '어', '그', '약간', '이제']

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function MicIcon({ recording }) {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0014 0M12 19v3M8 22h8" />
    </svg>
  )
}

export default function RecordPage({ onAnalyze, onBack, error: propError }) {
  const [status, setStatus] = useState('idle') // idle | recording | done
  const [transcript, setTranscript] = useState('')
  const [interimText, setInterimText] = useState('')
  const [duration, setDuration] = useState(0)
  const [fillerCounts, setFillerCounts] = useState({})
  const [fillerTimestamps, setFillerTimestamps] = useState([])
  const [error, setError] = useState(propError || null)
  const [supported, setSupported] = useState(null)

  const recognitionRef = useRef(null)
  const isRecordingRef = useRef(false)
  const startTimeRef = useRef(null)
  const timerRef = useRef(null)
  const transcriptRef = useRef('')
  const fillerTimestampsRef = useRef([])
  const transcriptEndRef = useRef(null)

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    setSupported(!!SR)
    if (!SR) return

    const recognition = new SR()
    recognition.lang = 'ko-KR'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          const text = result[0].transcript.trim()
          transcriptRef.current += text + ' '
          setTranscript(transcriptRef.current)

          // Filler word detection with approximate timestamp
          const elapsed = (Date.now() - startTimeRef.current) / 1000
          const words = text.split(/\s+/)
          const newCounts = {}
          words.forEach(w => {
            const clean = w.replace(/[.,!?~。]/g, '')
            if (FILLER_WORDS.includes(clean)) {
              newCounts[clean] = (newCounts[clean] || 0) + 1
              const ts = { word: clean, timeStr: formatTime(elapsed), timeSeconds: elapsed }
              fillerTimestampsRef.current = [...fillerTimestampsRef.current, ts]
              setFillerTimestamps(prev => [...prev, ts])
            }
          })
          if (Object.keys(newCounts).length > 0) {
            setFillerCounts(prev => {
              const next = { ...prev }
              Object.entries(newCounts).forEach(([k, v]) => { next[k] = (next[k] || 0) + v })
              return next
            })
          }
        } else {
          interim += result[0].transcript
        }
      }
      setInterimText(interim)
    }

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError('마이크 권한이 거부됐습니다. 브라우저 설정에서 마이크를 허용해주세요.')
        stopRecording(false)
      } else if (event.error === 'no-speech') {
        // silence — ignore, onend will restart
      } else {
        setError(`음성 인식 오류: ${event.error}`)
      }
    }

    recognition.onend = () => {
      if (isRecordingRef.current) {
        try { recognition.start() } catch (_) {}
      }
    }

    recognitionRef.current = recognition
    return () => { recognition.stop(); clearInterval(timerRef.current) }
  }, [])

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcript, interimText])

  const startRecording = () => {
    setError(null)
    transcriptRef.current = ''
    fillerTimestampsRef.current = []
    setTranscript('')
    setInterimText('')
    setFillerCounts({})
    setFillerTimestamps([])
    setDuration(0)
    setStatus('recording')
    isRecordingRef.current = true
    startTimeRef.current = Date.now()

    timerRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 500)

    try {
      recognitionRef.current.start()
    } catch (e) {
      setError('음성 인식을 시작할 수 없습니다. 마이크 권한을 확인해주세요.')
      setStatus('idle')
      clearInterval(timerRef.current)
    }
  }

  const stopRecording = (submit = true) => {
    isRecordingRef.current = false
    clearInterval(timerRef.current)
    try { recognitionRef.current?.stop() } catch (_) {}
    setInterimText('')

    if (submit) {
      const finalDuration = (Date.now() - startTimeRef.current) / 1000
      setStatus('done')
      onAnalyze({
        transcript: transcriptRef.current.trim(),
        duration: finalDuration,
        fillerTimestamps: fillerTimestampsRef.current,
      })
    } else {
      setStatus('idle')
    }
  }

  const totalFillers = Object.values(fillerCounts).reduce((s, n) => s + n, 0)

  if (supported === false) {
    return (
      <div className="min-h-screen bg-[#0b0719] text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="text-5xl mb-4">😢</div>
            <h2 className="text-xl font-bold mb-2">브라우저가 지원되지 않아요</h2>
            <p className="text-white/50 text-sm leading-relaxed">
              Web Speech API는 Chrome 또는 Edge 브라우저에서만 지원됩니다.
              Chrome을 사용해 다시 시도해주세요.
            </p>
            <button onClick={onBack} className="mt-6 text-sm text-violet-400 hover:text-violet-300 cursor-pointer">
              ← 돌아가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0b0719] text-white">
      <Navbar />

      <div className="pt-24 px-6 max-w-5xl mx-auto py-16">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/40 hover:text-white/80 text-sm mb-8 transition-colors cursor-pointer"
        >
          ← 돌아가기
        </button>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-10">
          {['발표 녹음', 'AI 분석', '결과 확인'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${i === 0 ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/30'}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${i === 0 ? 'bg-white text-violet-600' : 'bg-white/10 text-white/40'}`}>{i + 1}</span>
                {step}
              </div>
              {i < 2 && <span className="text-white/20 text-xs">›</span>}
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: Main recording area */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">발표를 녹음해주세요</h1>
            <p className="text-white/50 text-sm mb-6">
              버튼을 눌러 발표 연습을 시작하세요. AI가 실시간으로 음성을 인식합니다.
            </p>

            {/* Mic button + timer */}
            <div className="bg-[#150c2b] border border-white/8 rounded-2xl p-8 flex flex-col items-center mb-4">
              {/* Pulsing mic button */}
              <div className="relative mb-6">
                {status === 'recording' && (
                  <>
                    <span className="absolute inset-0 rounded-full bg-violet-500/20 animate-ping" />
                    <span className="absolute inset-[-8px] rounded-full bg-violet-500/10 animate-ping [animation-delay:0.3s]" />
                  </>
                )}
                <button
                  onClick={status === 'recording' ? () => stopRecording() : startRecording}
                  className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    status === 'recording'
                      ? 'bg-red-500 hover:bg-red-400 shadow-lg shadow-red-500/40'
                      : 'bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-500/30'
                  }`}
                >
                  {status === 'recording' ? (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                  ) : (
                    <span className="text-white"><MicIcon /></span>
                  )}
                </button>
              </div>

              {/* Timer */}
              <div className={`text-3xl font-mono font-bold tabular-nums mb-1 ${status === 'recording' ? 'text-white' : 'text-white/30'}`}>
                {formatTime(duration)}
              </div>
              <p className="text-white/40 text-sm">
                {status === 'idle' && '녹음 버튼을 눌러 시작하세요'}
                {status === 'recording' && '녹음 중 — 멈추려면 버튼을 다시 누르세요'}
                {status === 'done' && '녹음 완료, 분석 중...'}
              </p>

              {/* Live filler word badges */}
              {status === 'recording' && totalFillers > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {Object.entries(fillerCounts).map(([fw, count]) => count > 0 && (
                    <span key={fw} className="bg-pink-500/15 border border-pink-500/25 text-pink-300 text-xs px-2.5 py-1 rounded-full font-medium">
                      "{fw}" {count}회
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Live transcript */}
            {(transcript || interimText) && (
              <div className="bg-[#120a24] border border-white/8 rounded-2xl p-4 max-h-48 overflow-y-auto">
                <p className="text-white/40 text-xs mb-2 font-medium">실시간 텍스트</p>
                <p className="text-white/80 text-sm leading-relaxed">
                  {transcript}
                  {interimText && (
                    <span className="text-white/35 italic">{interimText}</span>
                  )}
                </p>
                <div ref={transcriptEndRef} />
              </div>
            )}

            {error && (
              <div className="mt-3 flex items-start gap-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                <span className="shrink-0">⚠</span>
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Right: Guide */}
          <div className="md:w-72 shrink-0 space-y-4">
            <div className="bg-[#150c2b] border border-white/8 rounded-2xl p-5">
              <p className="text-sm font-semibold mb-4 text-white/80">녹음 전 확인하세요</p>
              <ul className="space-y-3 text-sm text-white/50">
                {[
                  'Chrome 또는 Edge 브라우저를 사용해주세요',
                  '마이크가 연결되어 있고 권한이 허용되어 있는지 확인하세요',
                  '조용한 환경에서 발표하면 인식 정확도가 높아집니다',
                  '30초 이상 발표해야 정확한 분석이 가능합니다',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-violet-400 shrink-0 mt-0.5">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#150c2b] border border-white/8 rounded-2xl p-5">
              <p className="text-xs font-semibold text-white/60 mb-2">감지하는 필러워드</p>
              <div className="flex flex-wrap gap-2">
                {FILLER_WORDS.map(w => (
                  <span key={w} className="bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs px-2.5 py-1 rounded-full">
                    "{w}"
                  </span>
                ))}
              </div>
            </div>

            {status === 'recording' && (
              <div className="bg-[#150c2b] border border-violet-500/20 rounded-2xl p-4">
                <p className="text-xs font-semibold text-violet-400 mb-3">실시간 감지 현황</p>
                <div className="space-y-2">
                  {FILLER_WORDS.map(fw => (
                    <div key={fw} className="flex items-center justify-between text-sm">
                      <span className="text-white/50 font-mono">"{fw}"</span>
                      <span className={fillerCounts[fw] > 0 ? 'text-pink-400 font-semibold' : 'text-white/20'}>
                        {fillerCounts[fw] || 0}회
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

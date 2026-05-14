import { useState, useRef } from 'react'
import Navbar from '../components/Navbar'

const ACCEPTED = ['video/mp4', 'video/quicktime', 'video/webm', 'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/m4a', 'audio/x-m4a']
const MAX_MB = 24

function FileIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="rgba(124,58,237,0.15)" />
      <path d="M13 10h10l7 7v13a2 2 0 01-2 2H13a2 2 0 01-2-2V12a2 2 0 012-2z" stroke="#a78bfa" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M23 10v7h7" stroke="#a78bfa" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M17 22l3 3 3-3M20 25v-6" stroke="#ec4899" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function UploadPage({ onAnalyze, onBack, error: propError }) {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState(propError || null)
  const inputRef = useRef(null)

  const validate = (f) => {
    if (!f) return '파일을 선택해주세요.'
    if (f.size > MAX_MB * 1024 * 1024) return `파일 크기가 너무 큽니다. ${MAX_MB}MB 이하로 사용해주세요.`
    return null
  }

  const handleFile = (f) => {
    const err = validate(f)
    if (err) { setError(err); return }
    setError(null)
    setFile(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleSubmit = () => {
    if (!file) { setError('파일을 먼저 업로드해주세요.'); return }
    onAnalyze(file)
  }

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
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
          {['영상 업로드', 'AI 분석', '결과 확인'].map((step, i) => (
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
          {/* Left: Upload area */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">발표 영상을 업로드하세요</h1>
            <p className="text-white/50 text-sm mb-6">발표 연습 영상을 올려주세요. AI가 분석할게요.</p>

            {/* File drop area */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => !file && inputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer ${
                dragging
                  ? 'border-violet-500 bg-violet-500/10'
                  : file
                  ? 'border-violet-500/40 bg-[#150c2b]'
                  : 'border-white/10 bg-[#120a24] hover:border-violet-500/30 hover:bg-[#150c2b]'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept="video/*,audio/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files[0]; if (f) handleFile(f) }}
              />

              {file ? (
                <div className="flex items-center gap-4">
                  <FileIcon />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{file.name}</p>
                    <p className="text-white/40 text-sm mt-0.5">{formatSize(file.size)}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); setError(null) }}
                    className="text-white/30 hover:text-white/70 transition-colors p-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center py-4">
                  <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                  </div>
                  <p className="text-white font-medium mb-1">파일을 드래그하거나 클릭해서 업로드</p>
                  <p className="text-white/40 text-sm">MP4, MP3, M4A, WAV — 최대 {MAX_MB}MB</p>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-3 flex items-start gap-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                <span className="shrink-0">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!file}
              className={`mt-6 w-full py-3.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                file
                  ? 'bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white shadow-lg shadow-violet-500/25'
                  : 'bg-white/5 text-white/30 cursor-not-allowed'
              }`}
            >
              분석 시작하기 →
            </button>
          </div>

          {/* Right: Tips */}
          <div className="md:w-72 shrink-0">
            <div className="bg-[#150c2b] border border-white/8 rounded-2xl p-5">
              <p className="text-sm font-semibold mb-4 text-white/80">업로드 전 확인하세요</p>
              <ul className="space-y-3 text-sm text-white/50">
                {[
                  '발표 음성이 선명하게 들리는지 확인하세요',
                  '주변 소음이 적은 환경에서 녹화된 파일을 권장합니다',
                  '30초 이상의 영상을 사용하면 정확도가 높아집니다',
                  `파일 크기는 ${MAX_MB}MB 이하여야 합니다 (Vercel 제한)`,
                  '영상보다 MP3/M4A 음성 파일이 더 빠릅니다',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-violet-400 shrink-0 mt-0.5">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 bg-[#150c2b] border border-white/8 rounded-2xl p-5">
              <p className="text-xs font-semibold text-white/60 mb-2">감지하는 필러워드</p>
              <div className="flex flex-wrap gap-2">
                {['음', '어', '그', '약간', '이제'].map(w => (
                  <span key={w} className="bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs px-2.5 py-1 rounded-full">
                    "{w}"
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

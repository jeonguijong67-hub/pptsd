const FILLER_WORDS = ['음', '어', '그', '약간', '이제']

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// Analyzes data from Web Speech API
// { transcript: string, duration: number, fillerTimestamps: [{word, timeStr, timeSeconds}] }
export function analyzeWebSpeech({ transcript, duration, fillerTimestamps }) {
  const words = transcript.trim().split(/\s+/).filter(Boolean)
  const totalWords = words.length
  const durationMinutes = Math.max(duration / 60, 0.01)
  const wpm = Math.round(totalWords / durationMinutes)

  // Korean presentation ideal speed: 130–180 어절/분
  const IDEAL_MIN = 100
  const IDEAL_MAX = 150
  let speechRateScore
  if (wpm >= IDEAL_MIN && wpm <= IDEAL_MAX) {
    speechRateScore = 100
  } else if (wpm < IDEAL_MIN) {
    speechRateScore = Math.max(30, 100 - Math.round((IDEAL_MIN - wpm) / 3))
  } else {
    speechRateScore = Math.max(30, 100 - Math.round((wpm - IDEAL_MAX) / 2))
  }

  // Group filler timestamps by word type
  const fillersByType = {}
  FILLER_WORDS.forEach(fw => { fillersByType[fw] = [] })
  ;(fillerTimestamps || []).forEach(({ word, timeStr, timeSeconds }) => {
    if (fillersByType[word] !== undefined) {
      fillersByType[word].push({ timeStr, start: timeSeconds })
    }
  })

  const totalFillers = Object.values(fillersByType).reduce((s, a) => s + a.length, 0)
  const fillersPerMinute = Math.round((totalFillers / durationMinutes) * 10) / 10
  const fillerScore = Math.max(0, Math.round(100 - fillersPerMinute * (100 / 15)))

  const overallScore = Math.round((speechRateScore + fillerScore) / 2)

  let speechRateStatus, speechRateTip
  if (wpm < IDEAL_MIN) {
    speechRateStatus = '느린 편이에요'
    speechRateTip = `분당 ${wpm}어절로 조금 느립니다. 발표 초반 30초 동안 의식적으로 속도를 높여 자신감 있는 첫인상을 만들어보세요. (적정: 100–150어절/분)`
  } else if (wpm > IDEAL_MAX) {
    speechRateStatus = '빠른 편이에요'
    speechRateTip = `분당 ${wpm}어절로 다소 빠릅니다. 핵심 키워드 앞뒤에 짧은 침묵(1–2초)을 추가해 청중이 따라올 수 있게 해주세요. (적정: 100–150어절/분)`
  } else {
    speechRateStatus = '딱 좋아요'
    speechRateTip = `분당 ${wpm}어절로 발표에 적합한 속도입니다. 이 속도를 유지하세요! (적정: 100–150어절/분)`
  }

  const topFiller = Object.entries(fillersByType).sort((a, b) => b[1].length - a[1].length)[0]
  let fillerTip
  if (totalFillers === 0) {
    fillerTip = '불필요한 필러워드가 없었습니다. 깔끔한 발표입니다!'
  } else if (topFiller) {
    fillerTip = `"${topFiller[0]}"을 ${topFiller[1].length}회 사용했습니다. 필러워드 대신 짧은 침묵(1–2초)을 활용하면 더 자신감 있어 보입니다.`
  }

  return {
    wpm,
    totalWords,
    duration,
    durationStr: formatTime(duration),
    speechRateScore,
    speechRateStatus,
    speechRateTip,
    fillersByType,
    totalFillers,
    fillersPerMinute,
    fillerScore,
    fillerTip,
    overallScore,
    transcript,
  }
}

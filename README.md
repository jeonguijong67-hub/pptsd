# PPTSD — AI 발표 분석 코치

> 발표 PTSD를 줄이는 AI 리허설 코치  
> PPT + PTSD — 발표 트라우마를 데이터로 해결한다

## 소개

발표 연습을 녹음하면 AI가 실시간으로 분석해서 어디서 무엇이 아쉬웠는지 알려주는 서비스입니다.

## 기능

- **발표 녹음** — 브라우저 마이크로 바로 녹음 (별도 앱 불필요)
- **필러워드 분석** — "음", "어", "그", "약간", "이제" 횟수 및 타임스탬프
- **말 속도 분석** — 분당 어절 수 측정, 적정 구간(100–150어절/분) 대비 점수화
- **종합 점수** — 말 속도 + 반복 표현 평균 점수

## 기술 스택

- Vite + React
- Tailwind CSS
- Web Speech API (`ko-KR`) — 브라우저 내장, 별도 API 키 불필요

## 브라우저 지원

| 브라우저 | 지원 |
|---|---|
| Chrome | ✅ |
| Edge | ✅ |
| Firefox | ❌ |
| Safari | ❌ |

Web Speech API 특성상 Chrome / Edge에서만 작동합니다.

## 로컬 실행

```bash
npm install
npm run dev
```

## 배포

Vercel 배포 기준으로 설정되어 있습니다.

```bash
npx vercel
```

또는 GitHub 레포를 Vercel에 연결하면 `git push`시 자동 재배포됩니다.

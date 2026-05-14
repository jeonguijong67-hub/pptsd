import { useState } from 'react'
import LandingPage from './pages/LandingPage'
import RecordPage from './pages/RecordPage'
import AnalyzingPage from './pages/AnalyzingPage'
import ResultsPage from './pages/ResultsPage'
import { analyzeWebSpeech } from './utils/analyze'

export default function App() {
  const [page, setPage] = useState('landing')
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  const handleRecord = async (webSpeechData) => {
    setError(null)
    setPage('analyzing')
    // Brief pause so the analyzing screen is visible
    await new Promise(resolve => setTimeout(resolve, 900))
    setResults(analyzeWebSpeech(webSpeechData))
    setPage('results')
  }

  const handleReset = () => {
    setPage('landing')
    setResults(null)
    setError(null)
  }

  return (
    <>
      {page === 'landing' && <LandingPage onStart={() => setPage('record')} />}
      {page === 'record' && (
        <RecordPage onAnalyze={handleRecord} onBack={() => setPage('landing')} error={error} />
      )}
      {page === 'analyzing' && <AnalyzingPage />}
      {page === 'results' && results && (
        <ResultsPage results={results} onReset={handleReset} />
      )}
    </>
  )
}

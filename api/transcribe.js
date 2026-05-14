import formidable from 'formidable'
import OpenAI from 'openai'
import { createReadStream } from 'fs'

export const config = {
  api: { bodyParser: false },
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY가 설정되지 않았습니다.' })

  const form = formidable({ maxFileSize: 25 * 1024 * 1024 })

  let files
  try {
    ;[, files] = await new Promise((resolve, reject) =>
      form.parse(req, (err, fields, f) => (err ? reject(err) : resolve([fields, f])))
    )
  } catch (err) {
    const msg = err.code === 1009
      ? '파일이 너무 큽니다. 25MB 이하의 파일을 사용해주세요.'
      : `파일 파싱 오류: ${err.message}`
    return res.status(400).json({ error: msg })
  }

  const fileArr = files?.file
  if (!fileArr || fileArr.length === 0) {
    return res.status(400).json({ error: '파일이 없습니다.' })
  }

  const file = fileArr[0]

  try {
    const openai = new OpenAI({ apiKey })
    const transcription = await openai.audio.transcriptions.create({
      file: createReadStream(file.filepath),
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['word'],
      language: 'ko',
    })
    res.status(200).json(transcription)
  } catch (err) {
    const msg = err?.error?.message || err.message || '분석 오류가 발생했습니다.'
    res.status(500).json({ error: msg })
  }
}

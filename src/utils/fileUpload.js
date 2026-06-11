import { extractDataFromUpload } from './dataQuality'
import { parseUploadedValue } from '../data/knowledgeData'

function parseFileContent(text, filename) {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext === 'json') {
    return JSON.parse(text)
  }
  if (ext === 'csv') {
    const lines = text.trim().split('\n')
    const headers = lines[0].split(',').map((h) => h.trim())
    const values = lines[1]?.split(',').map((v) => v.trim()) ?? []
    const obj = {}
    headers.forEach((h, i) => {
      obj[h] = values[i]
    })
    return obj
  }
  throw new Error('Unsupported format — use JSON or CSV')
}

export async function processUploadedFile(file, onUploadComplete) {
  const text = await file.text()
  const parsed = parseFileContent(text, file.name)
  const extracted = extractDataFromUpload(parsed)

  const normalized = {}
  Object.entries(extracted).forEach(([key, raw]) => {
    normalized[key] = parseUploadedValue(key, raw)
  })

  onUploadComplete(normalized, file.name)
}

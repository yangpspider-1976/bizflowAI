'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default function ReportsPage() {
  const params = useParams()
  const id = params.id as string
  const [client, setClient] = useState<any>(null)
  const [score, setScore] = useState<any>(null)
  const [reports, setReports] = useState<any[]>([])
  const [language, setLanguage] = useState<'ko' | 'en'>('ko')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [{ data: c }, { data: s }, { data: r }] = await Promise.all([
        supabase.from('clients').select('*').eq('id', id).single(),
        supabase.from('audit_scores').select('*').eq('client_id', id).single(),
        supabase.from('reports').select('*').eq('client_id', id).order('created_at', { ascending: false }),
      ])
      setClient(c)
      setScore(s)
      setReports(r || [])
    }
    load()
  }, [id])

  async function handleGenerate() {
    setGenerating(true)
    setError('')
    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: id, language, reportType: 'free' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      const supabase = createClient()
      const { data: r } = await supabase.from('reports').select('*').eq('client_id', id).order('created_at', { ascending: false })
      setReports(r || [])
    } catch (e: any) {
      setError(e.message)
    }
    setGenerating(false)
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <Link href={`/clients/${id}`} className="text-sm text-gray-500 hover:text-gray-700">← Back to Client</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">{client?.business_name} — Reports</h1>
      </div>

      <div className="flex gap-3 mb-6">
        <Link href={`/clients/${id}`} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">Profile</Link>
        <Link href={`/clients/${id}/audit`} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">Audit Scoring</Link>
        <Link href={`/clients/${id}/reports`} className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium">Reports</Link>
        <Link href={`/clients/${id}/followup`} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">Follow-up</Link>
      </div>

      {!score && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 text-sm">No audit scores found. <Link href={`/clients/${id}/audit`} className="underline">Complete the audit scoring first.</Link></p>
        </div>
      )}

      {score && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Audit Summary</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div><p className="text-xs text-gray-500">Total Score</p><p className="text-xl font-bold">{score.total_score}/100</p></div>
            <div><p className="text-xs text-gray-500">Grade</p><p className="text-xl font-bold">{score.grade}</p></div>
            <div><p className="text-xs text-gray-500">Package</p><p className="text-sm font-semibold">{score.recommended_package}</p></div>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Language</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as 'ko' | 'en')}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ko">Korean (한국어)</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="mt-5">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {generating ? 'Generating...' : reports.length > 0 ? 'Regenerate Report' : 'Generate Report'}
              </button>
            </div>
          </div>
          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
          {generating && <p className="text-blue-600 text-sm mt-3">Generating report with OpenAI... This may take 30-60 seconds.</p>}
        </div>
      )}

      {reports.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Generated Reports</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {reports.map(report => (
              <div key={report.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{report.title || 'Marketing Audit Report'}</p>
                  <p className="text-sm text-gray-500">
                    {report.language === 'ko' ? 'Korean' : 'English'} · v{report.version} · {formatDate(report.created_at)}
                  </p>
                </div>
                <Link
                  href={`/reports/${report.id}`}
                  className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Preview & Print
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

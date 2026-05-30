'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { SCORE_AREAS, calculateGrade, calculateLowestAreas, calculateRecommendedPackage } from '@/lib/scoring'

export default function AuditPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [client, setClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [existingScoreId, setExistingScoreId] = useState<string | null>(null)

  const [scores, setScores] = useState({
    sns_presence: 0,
    content_quality: 0,
    google_maps_visibility: 0,
    website_landing_flow: 0,
    ad_readiness: 0,
    inquiry_lead_flow: 0,
    competitor_appeal: 0,
  })

  const [observations, setObservations] = useState({
    sns_observation: '',
    content_observation: '',
    google_maps_observation: '',
    website_landing_observation: '',
    ad_readiness_observation: '',
    inquiry_flow_observation: '',
    competitor_observation: '',
    key_strengths: '',
    key_weaknesses: '',
  })

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0)
  const grade = calculateGrade(totalScore)
  const lowestAreas = calculateLowestAreas(scores)
  const recommendedPackage = calculateRecommendedPackage(totalScore, grade, lowestAreas, scores.ad_readiness)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [{ data: c }, { data: s }] = await Promise.all([
        supabase.from('clients').select('id, business_name').eq('id', id).single(),
        supabase.from('audit_scores').select('*').eq('client_id', id).single(),
      ])
      setClient(c)
      if (s) {
        setExistingScoreId(s.id)
        setScores({
          sns_presence: s.sns_presence || 0,
          content_quality: s.content_quality || 0,
          google_maps_visibility: s.google_maps_visibility || 0,
          website_landing_flow: s.website_landing_flow || 0,
          ad_readiness: s.ad_readiness || 0,
          inquiry_lead_flow: s.inquiry_lead_flow || 0,
          competitor_appeal: s.competitor_appeal || 0,
        })
        setObservations({
          sns_observation: s.sns_observation || '',
          content_observation: s.content_observation || '',
          google_maps_observation: s.google_maps_observation || '',
          website_landing_observation: s.website_landing_observation || '',
          ad_readiness_observation: s.ad_readiness_observation || '',
          inquiry_flow_observation: s.inquiry_flow_observation || '',
          competitor_observation: s.competitor_observation || '',
          key_strengths: s.key_strengths || '',
          key_weaknesses: s.key_weaknesses || '',
        })
      }
      setLoading(false)
    }
    load()
  }, [id])

  async function handleSave() {
    setSaving(true)
    setError('')
    setSuccess(false)
    const supabase = createClient()

    const data = {
      client_id: id,
      ...scores,
      ...observations,
      total_score: totalScore,
      grade,
      lowest_area_1: lowestAreas[0]?.area || null,
      lowest_area_2: lowestAreas[1]?.area || null,
      lowest_area_3: lowestAreas[2]?.area || null,
      recommended_package: recommendedPackage,
      updated_at: new Date().toISOString(),
    }

    let result
    if (existingScoreId) {
      result = await supabase.from('audit_scores').update(data).eq('id', existingScoreId)
    } else {
      result = await supabase.from('audit_scores').insert(data)
    }

    if (result.error) {
      setError(result.error.message)
    } else {
      setSuccess(true)
      await supabase.from('clients').update({ lead_status: 'Scoring Done', updated_at: new Date().toISOString() }).eq('id', id)
      router.refresh()
    }
    setSaving(false)
  }

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>

  const observationLabels: Record<string, string> = {
    sns_observation: 'SNS Observation',
    content_observation: 'Content Observation',
    google_maps_observation: 'Google Maps Observation',
    website_landing_observation: 'Website / Landing Observation',
    ad_readiness_observation: 'Ad Readiness Observation',
    inquiry_flow_observation: 'Inquiry Flow Observation',
    competitor_observation: 'Competitor Observation',
    key_strengths: 'Key Strengths',
    key_weaknesses: 'Key Weaknesses',
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <Link href={`/clients/${id}`} className="text-sm text-gray-500 hover:text-gray-700">← Back to Client</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">{client?.business_name} — Audit Scoring</h1>
      </div>

      <div className="flex gap-3 mb-6">
        <Link href={`/clients/${id}`} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">Profile</Link>
        <Link href={`/clients/${id}/audit`} className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium">Audit Scoring</Link>
        <Link href={`/clients/${id}/reports`} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">Reports</Link>
        <Link href={`/clients/${id}/followup`} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">Follow-up</Link>
      </div>

      {/* Live Score Summary */}
      <div className="bg-blue-50 rounded-lg p-6 mb-6 grid grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-blue-600 font-medium">Total Score</p>
          <p className="text-3xl font-bold text-blue-900">{totalScore}<span className="text-lg">/100</span></p>
        </div>
        <div>
          <p className="text-xs text-blue-600 font-medium">Grade</p>
          <p className="text-3xl font-bold text-blue-900">{grade}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-blue-600 font-medium">Recommended Package</p>
          <p className="text-sm font-semibold text-blue-900 mt-1">{recommendedPackage}</p>
          <p className="text-xs text-blue-600 mt-1">Lowest: {lowestAreas.map(a => a.area).join(', ')}</p>
        </div>
      </div>

      {/* Score Inputs */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Score Input</h2>
        <div className="space-y-4">
          {SCORE_AREAS.map(area => (
            <div key={area.key} className="flex items-center gap-4">
              <div className="w-52 text-sm font-medium text-gray-700">{area.label}</div>
              <input
                type="number"
                min={0}
                max={area.max}
                value={scores[area.key as keyof typeof scores]}
                onChange={e => setScores(prev => ({ ...prev, [area.key]: Math.min(area.max, Math.max(0, parseInt(e.target.value) || 0)) }))}
                className="w-20 border border-gray-300 rounded-md px-3 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="text-sm text-gray-500">/ {area.max}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${(scores[area.key as keyof typeof scores] / area.max) * 100}%` }}
                />
              </div>
              <div className="text-sm text-gray-500 w-10 text-right">
                {Math.round((scores[area.key as keyof typeof scores] / area.max) * 100)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Observations */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Operator Observations</h2>
        <div className="space-y-4">
          {Object.entries(observations).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{observationLabels[key]}</label>
              <textarea
                value={value}
                onChange={e => setObservations(prev => ({ ...prev, [key]: e.target.value }))}
                rows={2}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {success && <p className="text-green-600 text-sm mb-4">Audit scores saved successfully.</p>}

      <div className="flex gap-3">
        <button onClick={handleSave} disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {saving ? 'Saving...' : 'Save Audit Scores'}
        </button>
        <Link href={`/clients/${id}/reports`} className="bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-700 transition-colors">
          Generate Report →
        </Link>
      </div>
    </div>
  )
}

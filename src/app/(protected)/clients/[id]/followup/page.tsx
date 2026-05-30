'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const SALES_STATUSES = ['Not Started', 'Follow-up Needed', 'Contacted', 'Interested', 'Meeting Scheduled', 'Proposal Sent', 'Negotiating', 'Won', 'Lost', 'Later']
const SENT_METHODS = ['KakaoTalk', 'WhatsApp', 'Email', 'Facebook', 'Instagram', 'Other']

export default function FollowupPage() {
  const params = useParams()
  const id = params.id as string
  const [client, setClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [existingId, setExistingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    report_sent_date: '',
    sent_method: '',
    client_response: '',
    follow_up_date: '',
    follow_up_result: '',
    proposed_package: '',
    proposed_price: '',
    sales_status: 'Not Started',
    next_action: '',
    notes: '',
  })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [{ data: c }, { data: f }] = await Promise.all([
        supabase.from('clients').select('id, business_name').eq('id', id).single(),
        supabase.from('followups').select('*').eq('client_id', id).single(),
      ])
      setClient(c)
      if (f) {
        setExistingId(f.id)
        setForm({
          report_sent_date: f.report_sent_date || '',
          sent_method: f.sent_method || '',
          client_response: f.client_response || '',
          follow_up_date: f.follow_up_date || '',
          follow_up_result: f.follow_up_result || '',
          proposed_package: f.proposed_package || '',
          proposed_price: f.proposed_price || '',
          sales_status: f.sales_status || 'Not Started',
          next_action: f.next_action || '',
          notes: f.notes || '',
        })
      }
      setLoading(false)
    }
    load()
  }, [id])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    const supabase = createClient()
    const data = { client_id: id, ...form, updated_at: new Date().toISOString() }
    let result
    if (existingId) {
      result = await supabase.from('followups').update(data).eq('id', existingId)
    } else {
      result = await supabase.from('followups').insert(data)
    }
    if (result.error) setError(result.error.message)
    else setSuccess(true)
    setSaving(false)
  }

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <Link href={`/clients/${id}`} className="text-sm text-gray-500 hover:text-gray-700">← Back to Client</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">{client?.business_name} — Follow-up</h1>
      </div>

      <div className="flex gap-3 mb-6">
        <Link href={`/clients/${id}`} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">Profile</Link>
        <Link href={`/clients/${id}/audit`} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">Audit Scoring</Link>
        <Link href={`/clients/${id}/reports`} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">Reports</Link>
        <Link href={`/clients/${id}/followup`} className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium">Follow-up</Link>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Report Delivery</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Sent Date</label>
              <input type="date" name="report_sent_date" value={form.report_sent_date} onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sent Method</label>
              <select name="sent_method" value={form.sent_method} onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select method</option>
                {SENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Response</label>
            <textarea name="client_response" value={form.client_response} onChange={handleChange} rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Follow-up Tracking</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
              <input type="date" name="follow_up_date" value={form.follow_up_date} onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sales Status</label>
              <select name="sales_status" value={form.sales_status} onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {SALES_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Package</label>
              <input type="text" name="proposed_package" value={form.proposed_package} onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Price</label>
              <input type="text" name="proposed_price" value={form.proposed_price} onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Result</label>
            <textarea name="follow_up_result" value={form.follow_up_result} onChange={handleChange} rows={2}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Next Action</label>
            <input type="text" name="next_action" value={form.next_action} onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">Follow-up saved successfully.</p>}

        <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {saving ? 'Saving...' : 'Save Follow-up'}
        </button>
      </form>
    </div>
  )
}

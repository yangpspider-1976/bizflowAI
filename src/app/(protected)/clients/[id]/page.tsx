import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ClientEditForm from './ClientEditForm'

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: client } = await supabase.from('clients').select('*').eq('id', id).single()
  if (!client) notFound()

  const { data: score } = await supabase.from('audit_scores').select('*').eq('client_id', id).single()

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/clients" className="text-sm text-gray-500 hover:text-gray-700">← Back to Clients</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">{client.business_name}</h1>
        {client.lead_id && <p className="text-sm text-gray-500">Lead ID: {client.lead_id}</p>}
      </div>

      <div className="flex gap-3 mb-6">
        <Link href={`/clients/${id}`} className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium">Profile</Link>
        <Link href={`/clients/${id}/audit`} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">Audit Scoring</Link>
        <Link href={`/clients/${id}/reports`} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">Reports</Link>
        <Link href={`/clients/${id}/followup`} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">Follow-up</Link>
      </div>

      {score && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6 flex gap-6">
          <div><p className="text-xs text-blue-600 font-medium">Total Score</p><p className="text-2xl font-bold text-blue-900">{score.total_score}/100</p></div>
          <div><p className="text-xs text-blue-600 font-medium">Grade</p><p className="text-2xl font-bold text-blue-900">{score.grade || '-'}</p></div>
          <div><p className="text-xs text-blue-600 font-medium">Recommended Package</p><p className="text-sm font-semibold text-blue-900 mt-1">{score.recommended_package || '-'}</p></div>
        </div>
      )}

      <ClientEditForm client={client} />
    </div>
  )
}

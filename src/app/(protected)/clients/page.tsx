import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { getGradeColor, getStatusColor, formatDate } from '@/lib/utils'

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('clients')
    .select(`
      id, lead_id, business_name, industry, location, contact_name,
      lead_status, priority, updated_at,
      audit_scores(total_score, grade, recommended_package)
    `)
    .order('updated_at', { ascending: false })

  if (params.search) {
    query = query.ilike('business_name', `%${params.search}%`)
  }
  if (params.status) {
    query = query.eq('lead_status', params.status)
  }

  const { data: clients } = await query

  const LEAD_STATUSES = ['New', 'Reviewing', 'Scoring Done', 'Report Generated', 'Sent', 'Follow-up', 'Meeting Booked', 'Converted', 'Lost', 'On Hold']

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 mt-1">{clients?.length || 0} total clients</p>
        </div>
        <Link
          href="/clients/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Add Client
        </Link>
      </div>

      <form className="mb-6 flex gap-3" method="GET">
        <input
          name="search"
          defaultValue={params.search}
          placeholder="Search by business name..."
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          name="status"
          defaultValue={params.status}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button type="submit" className="bg-gray-100 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200">
          Filter
        </button>
        <Link href="/clients" className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900">
          Clear
        </Link>
      </form>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Business Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Industry</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Contact</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Score</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Grade</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Updated</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clients && clients.length > 0 ? clients.map((client: any) => {
              const score = Array.isArray(client.audit_scores) ? client.audit_scores[0] : client.audit_scores
              return (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/clients/${client.id}`} className="font-medium text-blue-600 hover:underline">
                      {client.business_name}
                    </Link>
                    {client.lead_id && <p className="text-xs text-gray-400">{client.lead_id}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{client.industry || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{client.contact_name || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(client.lead_status)}`}>
                      {client.lead_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{score?.total_score ?? '-'}</td>
                  <td className="px-4 py-3">
                    {score?.grade ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getGradeColor(score.grade)}`}>
                        {score.grade}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(client.updated_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/clients/${client.id}/audit`} className="text-xs text-purple-600 hover:underline">Audit</Link>
                      <Link href={`/clients/${client.id}/reports`} className="text-xs text-green-600 hover:underline">Report</Link>
                    </div>
                  </td>
                </tr>
              )
            }) : (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  No clients found. <Link href="/clients/new" className="text-blue-600 hover:underline">Add your first client</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

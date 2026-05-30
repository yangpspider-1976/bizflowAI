import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: totalClients },
    { count: newLeads },
    { count: reportsGenerated },
    { data: recentClients },
  ] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('lead_status', 'New'),
    supabase.from('reports').select('*', { count: 'exact', head: true }),
    supabase.from('clients').select('id, business_name, lead_status, priority, created_at').order('created_at', { ascending: false }).limit(5),
  ])

  const today = new Date().toISOString().split('T')[0]
  const { count: followupsDue } = await supabase
    .from('followups')
    .select('*', { count: 'exact', head: true })
    .lte('follow_up_date', today)
    .not('sales_status', 'in', '("Won","Lost")')

  const stats = [
    { label: 'Total Clients', value: totalClients || 0, color: 'bg-blue-50 text-blue-700' },
    { label: 'New Leads', value: newLeads || 0, color: 'bg-green-50 text-green-700' },
    { label: 'Reports Generated', value: reportsGenerated || 0, color: 'bg-purple-50 text-purple-700' },
    { label: 'Follow-ups Due', value: followupsDue || 0, color: 'bg-orange-50 text-orange-700' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">BizFlow AI Marketing Audit Overview</p>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className={`rounded-lg p-6 ${stat.color}`}>
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-sm mt-1 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Clients</h2>
          <Link href="/clients" className="text-sm text-blue-600 hover:underline">View All</Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentClients && recentClients.length > 0 ? recentClients.map(client => (
            <div key={client.id} className="px-6 py-4 flex items-center justify-between">
              <Link href={`/clients/${client.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                {client.business_name}
              </Link>
              <span className="text-sm text-gray-500">{client.lead_status}</span>
            </div>
          )) : (
            <div className="px-6 py-8 text-center text-gray-400">
              No clients yet. <Link href="/clients/new" className="text-blue-600 hover:underline">Add your first client</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { marked } from 'marked'
import PrintButton from './PrintButton'
import ReportStyles from './ReportStyles'

export default async function ReportPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: report } = await supabase.from('reports').select('*, clients(business_name, contact_name)').eq('id', id).single()
  if (!report) notFound()

  const htmlContent = report.content_markdown ? await marked(report.content_markdown) : report.content_html || ''

  return (
    <div className="min-h-screen bg-gray-100">
      <ReportStyles />
      <div className="no-print sticky top-0 bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between z-10">
        <div>
          <h1 className="font-semibold text-gray-900">{report.title || 'Marketing Audit Report'}</h1>
          <p className="text-sm text-gray-500">{(report.clients as any)?.business_name}</p>
        </div>
        <div className="flex gap-3">
          <PrintButton />
          <a href={`/clients/${report.client_id}/reports`} className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
            Back to Reports
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto my-8 px-4">
        <div
          id="report-content"
          className="bg-white shadow-lg rounded-lg p-16 prose-report max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  )
}

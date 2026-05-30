'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient as createSupabaseClient } from '@/lib/supabase/client'
import { Client } from '@/types'

const LEAD_STATUSES = ['New', 'Reviewing', 'Scoring Done', 'Report Generated', 'Sent', 'Follow-up', 'Meeting Booked', 'Converted', 'Lost', 'On Hold']
const PRIORITIES = ['High', 'Medium', 'Low']
const AUDIT_TYPES = ['Free', 'Full', 'Monthly Support Candidate', 'Existing Client']

export default function ClientEditForm({ client }: { client: Client }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    business_name: client.business_name || '',
    industry: client.industry || '',
    location: client.location || '',
    business_type: client.business_type || '',
    main_product_service: client.main_product_service || '',
    target_customers: (client.target_customers || []).join(', '),
    current_marketing_goal: client.current_marketing_goal || '',
    main_challenge: client.main_challenge || '',
    contact_name: client.contact_name || '',
    contact_role: client.contact_role || '',
    phone: client.phone || '',
    email: client.email || '',
    preferred_contact_method: client.preferred_contact_method || '',
    facebook_url: client.facebook_url || '',
    instagram_url: client.instagram_url || '',
    google_maps_url: client.google_maps_url || '',
    website_url: client.website_url || '',
    other_channels: client.other_channels || '',
    lead_status: client.lead_status,
    priority: client.priority,
    audit_type: client.audit_type,
    assigned_operator: client.assigned_operator || '',
    notes: client.notes || '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)
    const supabase = createSupabaseClient()
    const { error } = await supabase.from('clients').update({
      ...form,
      target_customers: form.target_customers ? form.target_customers.split(',').map((s: string) => s.trim()) : [],
      updated_at: new Date().toISOString(),
    }).eq('id', client.id)
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Section title="Business Information">
        <Field label="Business Name *" name="business_name" value={form.business_name} onChange={handleChange} required />
        <Field label="Industry" name="industry" value={form.industry} onChange={handleChange} />
        <Field label="Location" name="location" value={form.location} onChange={handleChange} />
        <Field label="Business Type" name="business_type" value={form.business_type} onChange={handleChange} />
        <Field label="Main Product/Service" name="main_product_service" value={form.main_product_service} onChange={handleChange} />
        <Field label="Target Customers (comma-separated)" name="target_customers" value={form.target_customers} onChange={handleChange} />
        <TextArea label="Current Marketing Goal" name="current_marketing_goal" value={form.current_marketing_goal} onChange={handleChange} />
        <TextArea label="Main Challenge" name="main_challenge" value={form.main_challenge} onChange={handleChange} />
      </Section>
      <Section title="Contact Information">
        <Field label="Contact Name" name="contact_name" value={form.contact_name} onChange={handleChange} />
        <Field label="Contact Role" name="contact_role" value={form.contact_role} onChange={handleChange} />
        <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} />
        <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
        <Field label="Preferred Contact Method" name="preferred_contact_method" value={form.preferred_contact_method} onChange={handleChange} />
      </Section>
      <Section title="Online Channels">
        <Field label="Facebook URL" name="facebook_url" value={form.facebook_url} onChange={handleChange} />
        <Field label="Instagram URL" name="instagram_url" value={form.instagram_url} onChange={handleChange} />
        <Field label="Google Maps URL" name="google_maps_url" value={form.google_maps_url} onChange={handleChange} />
        <Field label="Website URL" name="website_url" value={form.website_url} onChange={handleChange} />
        <TextArea label="Other Channels" name="other_channels" value={form.other_channels} onChange={handleChange} />
      </Section>
      <Section title="Admin Settings">
        <SelectField label="Lead Status" name="lead_status" value={form.lead_status} onChange={handleChange} options={LEAD_STATUSES} />
        <SelectField label="Priority" name="priority" value={form.priority} onChange={handleChange} options={PRIORITIES} />
        <SelectField label="Audit Type" name="audit_type" value={form.audit_type} onChange={handleChange} options={AUDIT_TYPES} />
        <Field label="Assigned Operator" name="assigned_operator" value={form.assigned_operator} onChange={handleChange} />
        <TextArea label="Notes" name="notes" value={form.notes} onChange={handleChange} />
      </Section>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">Client updated successfully.</p>}
      <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="grid grid-cols-2 gap-4">{children}</div>
    </div>
  )
}

function Field({ label, name, value, onChange, type = 'text', required = false }: {
  label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}

function TextArea({ label, name, value, onChange }: {
  label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}) {
  return (
    <div className="col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={3}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}

function SelectField({ label, name, value, onChange, options }: {
  label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[]
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Admin Account</h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-sm font-medium text-gray-900">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">User ID</p>
            <p className="text-sm font-mono text-gray-600">{user?.id}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
        <h2 className="font-semibold text-gray-900 mb-4">Database Schema</h2>
        <p className="text-sm text-gray-600 mb-3">Run this SQL in your Supabase SQL editor to set up the required tables:</p>
        <a
          href="https://supabase.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-sm"
        >
          Open Supabase Dashboard →
        </a>
      </div>
    </div>
  )
}

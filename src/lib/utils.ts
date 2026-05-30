import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | null): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function getGradeColor(grade: string | null): string {
  switch (grade) {
    case 'A': return 'text-green-600 bg-green-50'
    case 'B': return 'text-blue-600 bg-blue-50'
    case 'C': return 'text-yellow-600 bg-yellow-50'
    case 'D': return 'text-orange-600 bg-orange-50'
    case 'E': return 'text-red-600 bg-red-50'
    default: return 'text-gray-600 bg-gray-50'
  }
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'New': 'bg-blue-100 text-blue-800',
    'Reviewing': 'bg-purple-100 text-purple-800',
    'Scoring Done': 'bg-yellow-100 text-yellow-800',
    'Report Generated': 'bg-orange-100 text-orange-800',
    'Sent': 'bg-green-100 text-green-800',
    'Follow-up': 'bg-pink-100 text-pink-800',
    'Meeting Booked': 'bg-indigo-100 text-indigo-800',
    'Converted': 'bg-emerald-100 text-emerald-800',
    'Lost': 'bg-red-100 text-red-800',
    'On Hold': 'bg-gray-100 text-gray-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

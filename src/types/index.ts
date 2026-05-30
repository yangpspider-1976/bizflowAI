export type LeadStatus = 'New' | 'Reviewing' | 'Scoring Done' | 'Report Generated' | 'Sent' | 'Follow-up' | 'Meeting Booked' | 'Converted' | 'Lost' | 'On Hold'
export type Priority = 'High' | 'Medium' | 'Low'
export type AuditType = 'Free' | 'Full' | 'Monthly Support Candidate' | 'Existing Client'
export type ReportStatus = 'Not Started' | 'Drafting' | 'Needs Review' | 'Finalized' | 'Sent' | 'Revision Needed' | 'Closed'
export type SalesStatus = 'Not Started' | 'Follow-up Needed' | 'Contacted' | 'Interested' | 'Meeting Scheduled' | 'Proposal Sent' | 'Negotiating' | 'Won' | 'Lost' | 'Later'

export interface Client {
  id: string
  lead_id: string | null
  business_name: string
  industry: string | null
  location: string | null
  business_type: string | null
  main_product_service: string | null
  target_customers: string[] | null
  current_marketing_goal: string | null
  main_challenge: string | null
  contact_name: string | null
  contact_role: string | null
  phone: string | null
  email: string | null
  preferred_contact_method: string | null
  facebook_url: string | null
  instagram_url: string | null
  google_maps_url: string | null
  website_url: string | null
  other_channels: string | null
  lead_status: LeadStatus
  priority: Priority
  audit_type: AuditType
  assigned_operator: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface AuditScore {
  id: string
  client_id: string
  sns_presence: number
  content_quality: number
  google_maps_visibility: number
  website_landing_flow: number
  ad_readiness: number
  inquiry_lead_flow: number
  competitor_appeal: number
  total_score: number
  grade: string | null
  lowest_area_1: string | null
  lowest_area_2: string | null
  lowest_area_3: string | null
  recommended_package: string | null
  sns_observation: string | null
  content_observation: string | null
  google_maps_observation: string | null
  website_landing_observation: string | null
  ad_readiness_observation: string | null
  inquiry_flow_observation: string | null
  competitor_observation: string | null
  key_strengths: string | null
  key_weaknesses: string | null
  created_at: string
  updated_at: string
}

export interface Report {
  id: string
  client_id: string
  report_type: string
  language: string
  status: ReportStatus
  title: string | null
  content_markdown: string | null
  content_html: string | null
  version: number
  created_by: string | null
  created_at: string
  updated_at: string
  sent_at: string | null
}

export interface Followup {
  id: string
  client_id: string
  report_sent_date: string | null
  sent_method: string | null
  client_response: string | null
  follow_up_date: string | null
  follow_up_result: string | null
  proposed_package: string | null
  proposed_price: string | null
  sales_status: SalesStatus
  next_action: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

-- BizFlow AI Marketing Audit Generator - Database Schema
-- Run this in your Supabase SQL editor

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id TEXT,
  business_name TEXT NOT NULL,
  industry TEXT,
  location TEXT,
  business_type TEXT,
  main_product_service TEXT,
  target_customers TEXT[],
  current_marketing_goal TEXT,
  main_challenge TEXT,
  contact_name TEXT,
  contact_role TEXT,
  phone TEXT,
  email TEXT,
  preferred_contact_method TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  google_maps_url TEXT,
  website_url TEXT,
  other_channels TEXT,
  lead_status TEXT NOT NULL DEFAULT 'New',
  priority TEXT NOT NULL DEFAULT 'Medium',
  audit_type TEXT NOT NULL DEFAULT 'Free',
  assigned_operator TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit scores table
CREATE TABLE IF NOT EXISTS audit_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  sns_presence INTEGER DEFAULT 0,
  content_quality INTEGER DEFAULT 0,
  google_maps_visibility INTEGER DEFAULT 0,
  website_landing_flow INTEGER DEFAULT 0,
  ad_readiness INTEGER DEFAULT 0,
  inquiry_lead_flow INTEGER DEFAULT 0,
  competitor_appeal INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  grade TEXT,
  lowest_area_1 TEXT,
  lowest_area_2 TEXT,
  lowest_area_3 TEXT,
  recommended_package TEXT,
  sns_observation TEXT,
  content_observation TEXT,
  google_maps_observation TEXT,
  website_landing_observation TEXT,
  ad_readiness_observation TEXT,
  inquiry_flow_observation TEXT,
  competitor_observation TEXT,
  key_strengths TEXT,
  key_weaknesses TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL DEFAULT 'free',
  language TEXT NOT NULL DEFAULT 'ko',
  status TEXT NOT NULL DEFAULT 'Not Started',
  title TEXT,
  content_markdown TEXT,
  content_html TEXT,
  version INTEGER DEFAULT 1,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

-- Followups table
CREATE TABLE IF NOT EXISTS followups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  report_sent_date DATE,
  sent_method TEXT,
  client_response TEXT,
  follow_up_date DATE,
  follow_up_result TEXT,
  proposed_package TEXT,
  proposed_price TEXT,
  sales_status TEXT NOT NULL DEFAULT 'Not Started',
  next_action TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (adjust policies as needed for your auth setup)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE followups ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to access all data (admin-only app)
CREATE POLICY "Authenticated users can do everything on clients"
  ON clients FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can do everything on audit_scores"
  ON audit_scores FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can do everything on reports"
  ON reports FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can do everything on followups"
  ON followups FOR ALL TO authenticated USING (true) WITH CHECK (true);

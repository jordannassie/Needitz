-- NeedItz Database Schema
-- Run this in your Supabase SQL editor (or use the Supabase CLI)

-- Requests table
CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT NOT NULL UNIQUE,
  item_request TEXT NOT NULL,
  budget TEXT NOT NULL,
  budget_numeric NUMERIC,
  deadline DATE,
  deadline_is_flexible BOOLEAN NOT NULL DEFAULT false,
  delivery_location TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company_name TEXT,
  additional_details TEXT,
  confirmed_legitimate BOOLEAN NOT NULL DEFAULT false,
  agreed_to_terms BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','reviewing','needs_information','potential_match','accepted','not_a_fit','closed')),
  priority TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('normal','high','urgent')),
  ai_summary TEXT,
  ai_score NUMERIC,
  ai_category TEXT,
  ai_clarity_score INTEGER,
  ai_seriousness_score INTEGER,
  ai_profitability_score INTEGER,
  ai_risk_flags TEXT[],
  ai_recommended_questions TEXT[],
  ai_recommendation TEXT CHECK (ai_recommendation IN ('pursue','manually_review','not_a_fit')),
  fallback_score INTEGER,
  admin_notes TEXT,
  source TEXT DEFAULT 'web',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  blocked BOOLEAN NOT NULL DEFAULT false,
  viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_requests_updated_at
  BEFORE UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  request_id_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security
-- Disable public access; all reads/writes go through the service role key (server-side only)
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- No public policies — all access is via service role key in API routes

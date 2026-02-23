-- ============================================================================
-- Customer Leads CRM System
-- ============================================================================
-- This migration creates the infrastructure for capturing and managing leads
-- from Dr. Rose chatbot interactions for retargeting and follow-up marketing.
-- ============================================================================

-- Create enum for lead status
CREATE TYPE public.lead_status AS ENUM (
  'new',           -- Just captured, not contacted yet
  'contacted',     -- Team has reached out
  'interested',    -- Customer showed interest after follow-up
  'converted',     -- Lead made a purchase
  'not_interested', -- Customer declined
  'inactive'       -- No response after multiple attempts
);

-- Create enum for contact type
CREATE TYPE public.contact_type AS ENUM (
  'email',
  'phone'
);

-- ============================================================================
-- Table: customer_leads
-- Stores leads captured from Dr. Rose chatbot conversations
-- ============================================================================
CREATE TABLE public.customer_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Contact information
  contact_type contact_type NOT NULL,
  contact_value TEXT NOT NULL,
  original_contact_value TEXT,
  
  -- Chat context
  last_chat_history JSONB,
  recommended_products TEXT[],
  concerns TEXT[],
  
  -- Lead metadata
  source TEXT DEFAULT 'dr_rose_chat',
  status lead_status DEFAULT 'new',
  
  -- Interaction tracking
  interaction_count INTEGER DEFAULT 1,
  first_interaction_at TIMESTAMP WITH TIME ZONE,
  last_interaction_at TIMESTAMP WITH TIME ZONE,
  
  -- Follow-up tracking
  follow_up_count INTEGER DEFAULT 0,
  last_follow_up_at TIMESTAMP WITH TIME ZONE,
  next_follow_up_at TIMESTAMP WITH TIME ZONE,
  follow_up_notes TEXT,
  
  -- Conversion tracking
  converted_at TIMESTAMP WITH TIME ZONE,
  conversion_order_id TEXT,
  conversion_value DECIMAL(10,2),
  
  -- Admin notes
  internal_notes TEXT,
  assigned_to TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique contact per type
  CONSTRAINT unique_lead_contact UNIQUE (contact_type, contact_value)
);

-- Create indexes for efficient querying
CREATE INDEX idx_leads_status ON public.customer_leads(status);
CREATE INDEX idx_leads_contact_value ON public.customer_leads(contact_value);
CREATE INDEX idx_leads_created_at ON public.customer_leads(created_at DESC);
CREATE INDEX idx_leads_last_interaction ON public.customer_leads(last_interaction_at DESC);
CREATE INDEX idx_leads_concerns ON public.customer_leads USING GIN(concerns);
CREATE INDEX idx_leads_products ON public.customer_leads USING GIN(recommended_products);
CREATE INDEX idx_leads_next_followup ON public.customer_leads(next_follow_up_at) WHERE status IN ('new', 'contacted', 'interested');

-- Enable Row Level Security
ALTER TABLE public.customer_leads ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything (for Edge Functions)
CREATE POLICY "Service role full access to leads"
ON public.customer_leads FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy: Authenticated admins can read and manage leads
CREATE POLICY "Admins can manage leads"
ON public.customer_leads FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_customer_leads_updated_at
BEFORE UPDATE ON public.customer_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- View: leads_summary
-- Quick overview of lead statistics for dashboard
-- ============================================================================
CREATE VIEW public.leads_summary AS
SELECT 
  status,
  COUNT(*) as count,
  COUNT(DISTINCT concerns) as unique_concerns,
  AVG(interaction_count) as avg_interactions,
  MAX(last_interaction_at) as latest_interaction
FROM public.customer_leads
GROUP BY status;

-- Grant access to the view
GRANT SELECT ON public.leads_summary TO authenticated;

-- ============================================================================
-- Function: get_leads_for_followup
-- Returns leads that need follow-up attention
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_leads_for_followup(
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  contact_type contact_type,
  contact_value TEXT,
  status lead_status,
  concerns TEXT[],
  recommended_products TEXT[],
  last_interaction_at TIMESTAMP WITH TIME ZONE,
  follow_up_count INTEGER,
  days_since_last_contact INTEGER
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cl.id,
    cl.contact_type,
    cl.contact_value,
    cl.status,
    cl.concerns,
    cl.recommended_products,
    cl.last_interaction_at,
    cl.follow_up_count,
    EXTRACT(DAY FROM NOW() - COALESCE(cl.last_follow_up_at, cl.last_interaction_at))::INTEGER as days_since_last_contact
  FROM public.customer_leads cl
  WHERE cl.status IN ('new', 'contacted', 'interested')
    AND (
      cl.next_follow_up_at IS NULL 
      OR cl.next_follow_up_at <= NOW()
      OR (cl.status = 'new' AND cl.follow_up_count = 0)
    )
  ORDER BY 
    CASE cl.status 
      WHEN 'new' THEN 1 
      WHEN 'interested' THEN 2 
      WHEN 'contacted' THEN 3 
    END,
    cl.last_interaction_at DESC
  LIMIT limit_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_leads_for_followup(INTEGER) TO authenticated;

-- ============================================================================
-- Function: mark_lead_contacted
-- Updates lead status after follow-up attempt
-- ============================================================================
CREATE OR REPLACE FUNCTION public.mark_lead_contacted(
  lead_id UUID,
  notes TEXT DEFAULT NULL,
  next_followup_days INTEGER DEFAULT 3
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  UPDATE public.customer_leads
  SET 
    status = CASE 
      WHEN status = 'new' THEN 'contacted'::lead_status 
      ELSE status 
    END,
    follow_up_count = follow_up_count + 1,
    last_follow_up_at = NOW(),
    next_follow_up_at = NOW() + (next_followup_days || ' days')::INTERVAL,
    follow_up_notes = COALESCE(follow_up_notes || E'\n', '') || 
      '[' || TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI') || '] ' || COALESCE(notes, 'Contacted'),
    updated_at = NOW()
  WHERE id = lead_id
  RETURNING jsonb_build_object(
    'id', id,
    'status', status,
    'follow_up_count', follow_up_count,
    'next_follow_up_at', next_follow_up_at
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.mark_lead_contacted(UUID, TEXT, INTEGER) TO authenticated;

-- ============================================================================
-- Function: convert_lead
-- Marks a lead as converted when they make a purchase
-- ============================================================================
CREATE OR REPLACE FUNCTION public.convert_lead(
  lead_id UUID,
  order_id TEXT DEFAULT NULL,
  order_value DECIMAL DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  UPDATE public.customer_leads
  SET 
    status = 'converted'::lead_status,
    converted_at = NOW(),
    conversion_order_id = order_id,
    conversion_value = order_value,
    updated_at = NOW()
  WHERE id = lead_id
  RETURNING jsonb_build_object(
    'id', id,
    'status', status,
    'converted_at', converted_at,
    'conversion_value', conversion_value
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.convert_lead(UUID, TEXT, DECIMAL) TO authenticated;

-- ============================================================================
-- Comments for documentation
-- ============================================================================
COMMENT ON TABLE public.customer_leads IS 'CRM table for leads captured from Dr. Rose chatbot conversations';
COMMENT ON FUNCTION public.get_leads_for_followup(INTEGER) IS 'Returns leads that need follow-up attention, prioritized by status and recency';
COMMENT ON FUNCTION public.mark_lead_contacted(UUID, TEXT, INTEGER) IS 'Updates lead after a follow-up attempt, scheduling next contact';
COMMENT ON FUNCTION public.convert_lead(UUID, TEXT, DECIMAL) IS 'Marks a lead as converted when they complete a purchase';

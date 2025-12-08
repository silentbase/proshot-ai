-- Add script_settings table for dynamic cookie/script management
CREATE TABLE IF NOT EXISTS public.script_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    script_id TEXT UNIQUE NOT NULL,
    script_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('essential', 'analytics', 'marketing')),
    enabled BOOLEAN DEFAULT false,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default script configurations
INSERT INTO public.script_settings (script_id, script_name, category, enabled, config) VALUES
('google-analytics', 'Google Analytics', 'analytics', false, '{"measurementId": ""}'),
('stripe-pricing-table', 'Stripe Pricing Table', 'marketing', false, '{}'),
('facebook-pixel', 'Facebook Pixel', 'marketing', false, '{"pixelId": ""}')
ON CONFLICT (script_id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.script_settings ENABLE ROW LEVEL SECURITY;

-- Public can read script settings
CREATE POLICY "Anyone can read script settings" ON public.script_settings
    FOR SELECT USING (true);

-- Only authenticated users can update (you can restrict to admin role later)
CREATE POLICY "Authenticated users can update script settings" ON public.script_settings
    FOR UPDATE TO authenticated USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_script_settings_updated_at
    BEFORE UPDATE ON public.script_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

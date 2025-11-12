-- Migration: Add feature toggles table and event management switch
CREATE TABLE IF NOT EXISTS public.feature_toggles (
    feature TEXT PRIMARY KEY,
    description TEXT,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.feature_toggles (feature, description, is_enabled)
VALUES (
    'event_management',
    'Controls the visibility of the event management experience across NCIT Hub.',
    TRUE
)
ON CONFLICT (feature) DO NOTHING;

ALTER TABLE public.feature_toggles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Feature toggles are readable by everyone"
ON public.feature_toggles FOR SELECT
USING (true);

CREATE POLICY "Only admins can insert feature toggles"
ON public.feature_toggles FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
));

CREATE POLICY "Only admins can update feature toggles"
ON public.feature_toggles FOR UPDATE
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
));

CREATE POLICY "Only admins can delete feature toggles"
ON public.feature_toggles FOR DELETE
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
));

CREATE TRIGGER set_timestamp_feature_toggles
    BEFORE UPDATE ON public.feature_toggles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

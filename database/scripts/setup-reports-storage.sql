-- Setup storage bucket for financial reports
-- Run this in Supabase SQL Editor

-- Create storage bucket for financial reports
INSERT INTO storage.buckets (id, name, public)
VALUES ('financial-reports', 'financial-reports', false)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the financial-reports bucket
CREATE POLICY "Users can upload their own reports"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'financial-reports' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own reports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'financial-reports' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own reports"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'financial-reports' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Grant necessary permissions
GRANT SELECT, INSERT, DELETE ON storage.objects TO authenticated;
GRANT SELECT ON storage.buckets TO authenticated;

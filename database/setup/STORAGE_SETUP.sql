-- ============================================
-- Supabase Storage Setup for Vault
-- ============================================
-- Run these commands in Supabase Dashboard > Storage > Policies
-- after creating the 'vault' bucket (set to PRIVATE)
-- ============================================

-- Policy 1: Users can view their own files
create policy "Users can view own files"
on storage.objects for select
using (
  bucket_id = 'vault' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 2: Users can upload their own files
create policy "Users can upload own files"
on storage.objects for insert
with check (
  bucket_id = 'vault' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Users can delete their own files
create policy "Users can delete own files"
on storage.objects for delete
using (
  bucket_id = 'vault' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Users can update their own files
create policy "Users can update own files"
on storage.objects for update
using (
  bucket_id = 'vault' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- Assets Document Storage Policies
-- ============================================

-- Policy 1: Users can view their own asset documents
create policy "Users can view own asset docs"
on storage.objects for select
using (
  bucket_id = 'assets-docs' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 2: Users can upload their own asset documents
create policy "Users can upload own asset docs"
on storage.objects for insert
with check (
  bucket_id = 'assets-docs' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Users can delete their own asset documents
create policy "Users can delete own asset docs"
on storage.objects for delete
using (
  bucket_id = 'assets-docs' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Users can update their own asset documents
create policy "Users can update own asset docs"
on storage.objects for update
using (
  bucket_id = 'assets-docs' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- Manual Steps in Dashboard:
-- ============================================
-- 1. Go to Storage section
-- 2. Click "Create bucket"
-- 3. Name: vault (PRIVATE)
-- 4. Name: assets-docs (PRIVATE)
-- 5. Set both to PRIVATE (not public)
-- 6. Click "Create bucket"
-- 7. Go to Storage > Policies
-- 8. Click "New policy" for storage.objects
-- 9. Copy each policy above individually
-- ============================================

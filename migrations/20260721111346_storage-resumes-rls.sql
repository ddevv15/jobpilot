-- Storage access control for the resumes bucket — Feature 04.
--
-- This backend reported storage.objects with RLS disabled and zero policies, so
-- "private bucket" alone would only mean "any signed-in user", not "own files
-- only" as architecture.md requires. These policies are path-scoped: ownership is
-- the first path segment of the key ({user_id}/resume.pdf), which prevents a user
-- from reading OR writing into another user's folder.
--
-- Policies are scoped to bucket = 'resumes'. Any future bucket therefore starts
-- with no matching policy and is denied until its own policies are written.

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY resumes_owner_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket = 'resumes'
    AND (storage.foldername(key))[1] = (SELECT auth.jwt() ->> 'sub')
  );

-- Also pins uploaded_by so a row cannot be attributed to another user.
CREATE POLICY resumes_owner_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket = 'resumes'
    AND (storage.foldername(key))[1] = (SELECT auth.jwt() ->> 'sub')
    AND uploaded_by = (SELECT auth.jwt() ->> 'sub')
  );

CREATE POLICY resumes_owner_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket = 'resumes'
    AND (storage.foldername(key))[1] = (SELECT auth.jwt() ->> 'sub')
  )
  WITH CHECK (
    bucket = 'resumes'
    AND (storage.foldername(key))[1] = (SELECT auth.jwt() ->> 'sub')
  );

-- DELETE is required, not optional: storage auto-renames on key collision, so
-- keeping one active resume per user means removing the old object before
-- uploading a replacement.
CREATE POLICY resumes_owner_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket = 'resumes'
    AND (storage.foldername(key))[1] = (SELECT auth.jwt() ->> 'sub')
  );

GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;

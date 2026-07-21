-- JobPilot schema — Feature 04.
-- Four owner-isolated tables. Every table keys ownership directly on auth.users(id)
-- so each RLS policy is a direct auth.uid() comparison with no cross-table lookup,
-- which also means no table depends on another existing first.

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

CREATE TABLE public.profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name           TEXT,
  email               TEXT,
  phone               TEXT,
  location            TEXT,
  current_title       TEXT,
  experience_level    TEXT CHECK (experience_level IN ('junior', 'mid', 'senior', 'lead')),
  years_experience    INTEGER CHECK (years_experience >= 0),
  skills              TEXT[] NOT NULL DEFAULT '{}',
  industries          TEXT[] NOT NULL DEFAULT '{}',
  work_experience     JSONB NOT NULL DEFAULT '[]'::jsonb,
  education           JSONB NOT NULL DEFAULT '{}'::jsonb,
  job_titles_seeking  TEXT[] NOT NULL DEFAULT '{}',
  remote_preference   TEXT CHECK (remote_preference IN ('remote', 'onsite', 'hybrid', 'any')),
  preferred_locations TEXT[] NOT NULL DEFAULT '{}',
  salary_expectation  TEXT,
  cover_letter_tone   TEXT CHECK (cover_letter_tone IN ('formal', 'casual', 'enthusiastic')),
  linkedin_url        TEXT,
  portfolio_url       TEXT,
  work_authorization  TEXT CHECK (work_authorization IN ('citizen', 'permanent_resident', 'visa_required')),
  resume_pdf_url      TEXT,
  -- Storage auto-renames on key collision, so the key is not derivable from the
  -- user id and must be persisted from the upload response.
  resume_pdf_key      TEXT,
  is_complete         BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

-- ---------------------------------------------------------------------------
-- agent_runs
-- ---------------------------------------------------------------------------

CREATE TABLE public.agent_runs (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status             TEXT NOT NULL DEFAULT 'running'
                       CHECK (status IN ('running', 'completed', 'failed')),
  job_title_searched TEXT,
  location_searched  TEXT,
  jobs_found         INTEGER NOT NULL DEFAULT 0 CHECK (jobs_found >= 0),
  started_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at       TIMESTAMPTZ
);

CREATE INDEX idx_agent_runs_user_id ON public.agent_runs (user_id);
CREATE INDEX idx_agent_runs_user_started ON public.agent_runs (user_id, started_at DESC);

-- ---------------------------------------------------------------------------
-- jobs
-- ---------------------------------------------------------------------------

CREATE TABLE public.jobs (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id             UUID REFERENCES public.agent_runs(id) ON DELETE SET NULL,
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source             TEXT NOT NULL DEFAULT 'search' CHECK (source IN ('search', 'url')),
  source_url         TEXT,
  external_apply_url TEXT,
  title              TEXT NOT NULL,
  company            TEXT NOT NULL,
  location           TEXT,
  salary             TEXT,
  -- Intentionally unconstrained: this is mapped straight from Adzuna's
  -- contract_type, which emits values outside the fulltime/parttime/contract set.
  job_type           TEXT,
  about_role         TEXT,
  responsibilities   TEXT[] NOT NULL DEFAULT '{}',
  requirements       TEXT[] NOT NULL DEFAULT '{}',
  nice_to_have       TEXT[] NOT NULL DEFAULT '{}',
  benefits           TEXT[] NOT NULL DEFAULT '{}',
  about_company      TEXT,
  match_score        INTEGER CHECK (match_score BETWEEN 0 AND 100),
  match_reason       TEXT,
  matched_skills     TEXT[] NOT NULL DEFAULT '{}',
  missing_skills     TEXT[] NOT NULL DEFAULT '{}',
  company_research   JSONB,
  found_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_jobs_user_id ON public.jobs (user_id);
CREATE INDEX idx_jobs_user_match_score ON public.jobs (user_id, match_score DESC);
CREATE INDEX idx_jobs_user_found_at ON public.jobs (user_id, found_at DESC);
CREATE INDEX idx_jobs_run_id ON public.jobs (run_id);
CREATE INDEX idx_jobs_user_researched ON public.jobs (user_id)
  WHERE company_research IS NOT NULL;

-- ---------------------------------------------------------------------------
-- agent_logs
-- ---------------------------------------------------------------------------

CREATE TABLE public.agent_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id     UUID REFERENCES public.agent_runs(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message    TEXT NOT NULL,
  level      TEXT NOT NULL DEFAULT 'info'
               CHECK (level IN ('info', 'success', 'warning', 'error')),
  job_id     UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_logs_user_id ON public.agent_logs (user_id);
CREATE INDEX idx_agent_logs_run_id ON public.agent_logs (run_id);
CREATE INDEX idx_agent_logs_job_id ON public.agent_logs (job_id);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles owner select" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "profiles owner insert" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "profiles owner update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "agent_runs owner select" ON public.agent_runs
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "agent_runs owner insert" ON public.agent_runs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "agent_runs owner update" ON public.agent_runs
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "jobs owner select" ON public.jobs
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "jobs owner insert" ON public.jobs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "jobs owner update" ON public.jobs
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "agent_logs owner select" ON public.agent_logs
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "agent_logs owner insert" ON public.agent_logs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ---------------------------------------------------------------------------
-- Privileges
--
-- InsForge grants broad DML on public tables by default so RLS can arbitrate
-- rows. The app needs a narrower surface than that, so revoke first and grant
-- back only what a feature actually performs: no DELETE anywhere (dismissing
-- jobs is out of scope), and agent_logs is append-only.
-- ---------------------------------------------------------------------------

REVOKE ALL ON public.profiles   FROM anon, authenticated;
REVOKE ALL ON public.agent_runs FROM anon, authenticated;
REVOKE ALL ON public.jobs       FROM anon, authenticated;
REVOKE ALL ON public.agent_logs FROM anon, authenticated;

GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT, INSERT, UPDATE ON public.profiles   TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.agent_runs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.jobs       TO authenticated;
GRANT SELECT, INSERT         ON public.agent_logs TO authenticated;

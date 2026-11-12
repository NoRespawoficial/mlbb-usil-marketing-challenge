-- ============================================================================
-- MARKETING GAMING CHALLENGE 2026 — SUPABASE POSTGRESQL SCHEMA & RLS (v6.2)
-- Iniciativa académica y de eSports organizada por la Carrera de Marketing de la
-- Universidad San Ignacio de Loyola (USIL) con el soporte estudiantil del Club
-- Marketing for Leaders (M4L), en colaboración promocional con VIZTA PTE. LTD.
-- para el videojuego Mobile Legends: Bang Bang (desarrollado por Moonton Games).
-- Cumplimiento estricto: Ley N° 29733 y Cláusula 5.3 del MOU (Minimización de Datos)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. TABLA: public.squad_registrations (Inscripción Inicial de Escuadras 5+1 - Etapa 1)
-- Minimización de datos: No almacena DNI de menores en el registro web inicial.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.squad_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id VARCHAR(32) NOT NULL UNIQUE,
    team_name VARCHAR(80) NOT NULL CHECK (char_length(trim(team_name)) >= 2),
    school_name VARCHAR(120) NOT NULL CHECK (char_length(trim(school_name)) >= 2),
    school_district VARCHAR(80) NOT NULL CHECK (char_length(trim(school_district)) >= 2),
    captain_email VARCHAR(120) DEFAULT '',
    captain_phone VARCHAR(20) DEFAULT '',
    guardian_name VARCHAR(120) DEFAULT '',
    guardian_email VARCHAR(120) DEFAULT '',
    guardian_phone VARCHAR(20) DEFAULT '',
    social_link TEXT DEFAULT '',
    strategy_doc_link TEXT DEFAULT '',
    official_hashtag VARCHAR(64) NOT NULL DEFAULT '#USILMarketingGamingMLBB',
    mentor_mode VARCHAR(32) NOT NULL CHECK (mentor_mode IN ('choose', 'direct', 'random')),
    mentor_id VARCHAR(120) NOT NULL,
    custom_mentor_name VARCHAR(120) DEFAULT '',
    nov2026_count SMALLINT NOT NULL CHECK (nov2026_count >= 3 AND nov2026_count <= 5),
    players JSONB NOT NULL CHECK (jsonb_typeof(players) = 'array' AND jsonb_array_length(players) = 5),
    parental_consent_accepted BOOLEAN NOT NULL DEFAULT TRUE CHECK (parental_consent_accepted = TRUE),
    privacy_law_29733_accepted BOOLEAN NOT NULL DEFAULT TRUE CHECK (privacy_law_29733_accepted = TRUE),
    marketing_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
    client_source VARCHAR(32) NOT NULL DEFAULT 'landing_v6_2',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.squad_registrations IS
'Registro oficial Etapa 1 de escuadras (5 jugadores de 15 a 17 años + 1 Mentor USIL/M4L) sin recolección de DNI de menores en web.';

CREATE INDEX IF NOT EXISTS idx_squad_registrations_created_at
    ON public.squad_registrations (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_squad_registrations_school
    ON public.squad_registrations (school_name);

-- ============================================================================
-- 2. TABLA: public.phase1_submissions (Entrega de Proyecto Fase 1 - Etapa 2)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.phase1_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id VARCHAR(32) NOT NULL UNIQUE,
    ticket_or_team VARCHAR(120) NOT NULL CHECK (char_length(trim(ticket_or_team)) >= 2),
    social_link TEXT NOT NULL CHECK (social_link ~* '^https?://'),
    strategy_doc_link TEXT NOT NULL CHECK (strategy_doc_link ~* '^https?://'),
    official_hashtag VARCHAR(64) NOT NULL DEFAULT '#USILMarketingGamingMLBB',
    privacy_law_29733_accepted BOOLEAN NOT NULL DEFAULT TRUE CHECK (privacy_law_29733_accepted = TRUE),
    marketing_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
    client_source VARCHAR(32) NOT NULL DEFAULT 'landing_v6_2',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.phase1_submissions IS
'Entrega posterior (Etapa 2 hasta el 02 de diciembre de 2026, 23:59 h) de publicación #USILMarketingGamingMLBB y Estrategia Digital.';

-- ============================================================================
-- 3. TABLA: public.mentor_applications (Postulación de Mentores USIL / M4L)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.mentor_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ref_code VARCHAR(32) NOT NULL UNIQUE,
    full_name VARCHAR(120) NOT NULL CHECK (char_length(trim(full_name)) >= 3),
    usil_code VARCHAR(20) NOT NULL CHECK (char_length(trim(usil_code)) >= 6),
    institutional_email VARCHAR(120) NOT NULL CHECK (institutional_email ~* '^[A-Za-z0-9._%+-]+@usil\.pe$'),
    career VARCHAR(80) NOT NULL,
    cycle VARCHAR(24) NOT NULL,
    specialty VARCHAR(64) NOT NULL,
    whatsapp_phone VARCHAR(15) NOT NULL CHECK (whatsapp_phone ~ '^9[0-9]{8}$'),
    reg_type VARCHAR(48) NOT NULL,
    privacy_law_29733_accepted BOOLEAN NOT NULL DEFAULT TRUE CHECK (privacy_law_29733_accepted = TRUE),
    marketing_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
    client_source VARCHAR(32) NOT NULL DEFAULT 'landing_v6_2',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.mentor_applications IS
'Postulaciones de estudiantes universitarios USIL y miembros del Club M4L a la Bolsa Oficial de Mentores.';

CREATE INDEX IF NOT EXISTS idx_mentor_applications_email
    ON public.mentor_applications (institutional_email);

-- ============================================================================
-- 4. SEGURIDAD DE FILAS (ROW LEVEL SECURITY — LEY N° 29733)
-- ============================================================================

ALTER TABLE public.squad_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phase1_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_applications ENABLE ROW LEVEL SECURITY;

REVOKE SELECT, UPDATE, DELETE ON public.squad_registrations FROM anon;
REVOKE SELECT, UPDATE, DELETE ON public.phase1_submissions FROM anon;
REVOKE SELECT, UPDATE, DELETE ON public.mentor_applications FROM anon;

GRANT INSERT ON public.squad_registrations TO anon, authenticated;
GRANT INSERT ON public.phase1_submissions TO anon, authenticated;
GRANT INSERT ON public.mentor_applications TO anon, authenticated;

DROP POLICY IF EXISTS "allow_anon_insert_squad_registrations" ON public.squad_registrations;
CREATE POLICY "allow_anon_insert_squad_registrations"
    ON public.squad_registrations
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        nov2026_count >= 3
        AND jsonb_typeof(players) = 'array'
        AND jsonb_array_length(players) = 5
        AND parental_consent_accepted = TRUE
        AND privacy_law_29733_accepted = TRUE
    );

DROP POLICY IF EXISTS "allow_anon_insert_phase1_submissions" ON public.phase1_submissions;
CREATE POLICY "allow_anon_insert_phase1_submissions"
    ON public.phase1_submissions
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        social_link ~* '^https?://'
        AND strategy_doc_link ~* '^https?://'
        AND privacy_law_29733_accepted = TRUE
    );

DROP POLICY IF EXISTS "allow_anon_insert_mentor_applications" ON public.mentor_applications;
CREATE POLICY "allow_anon_insert_mentor_applications"
    ON public.mentor_applications
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        institutional_email ~* '^[A-Za-z0-9._%+-]+@usil\.pe$'
        AND whatsapp_phone ~ '^9[0-9]{8}$'
        AND privacy_law_29733_accepted = TRUE
    );

DROP POLICY IF EXISTS "service_role_full_access_squads" ON public.squad_registrations;
CREATE POLICY "service_role_full_access_squads"
    ON public.squad_registrations
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_full_access_phase1" ON public.phase1_submissions;
CREATE POLICY "service_role_full_access_phase1"
    ON public.phase1_submissions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_full_access_mentors" ON public.mentor_applications;
CREATE POLICY "service_role_full_access_mentors"
    ON public.mentor_applications
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

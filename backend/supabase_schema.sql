-- ============================================================================
-- MARKETING GAMING CHALLENGE 2026 — SUPABASE POSTGRESQL SCHEMA & RLS (v6)
-- Alianza Oficial: Mobile Legends: Bang Bang x USIL (Marketing) x Club M4L
-- Cumplimiento estricto: Ley N° 29733 (Protección de Datos Personales de Menores)
-- ============================================================================

-- Extensión para generación de UUIDs criptográficos
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. TABLA: public.squad_registrations (Inscripción de Escuadras 5+1)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.squad_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id VARCHAR(32) NOT NULL UNIQUE,
    team_name VARCHAR(80) NOT NULL CHECK (char_length(trim(team_name)) >= 2),
    school_name VARCHAR(120) NOT NULL CHECK (char_length(trim(school_name)) >= 2),
    school_district VARCHAR(80) NOT NULL CHECK (char_length(trim(school_district)) >= 2),
    social_link TEXT NOT NULL CHECK (social_link ~* '^https?://'),
    strategy_doc_link TEXT NOT NULL CHECK (strategy_doc_link ~* '^https?://'),
    official_hashtag VARCHAR(64) NOT NULL DEFAULT '#USILMarketingGamingMLBB',
    mentor_mode VARCHAR(32) NOT NULL CHECK (mentor_mode IN ('choose', 'direct', 'random')),
    mentor_id VARCHAR(120) NOT NULL,
    custom_mentor_name VARCHAR(120) DEFAULT '',
    nov2026_count SMALLINT NOT NULL CHECK (nov2026_count >= 3 AND nov2026_count <= 5),
    players JSONB NOT NULL CHECK (jsonb_typeof(players) = 'array' AND jsonb_array_length(players) = 5),
    parental_consent_accepted BOOLEAN NOT NULL DEFAULT TRUE CHECK (parental_consent_accepted = TRUE),
    privacy_law_29733_accepted BOOLEAN NOT NULL DEFAULT TRUE CHECK (privacy_law_29733_accepted = TRUE),
    client_source VARCHAR(32) NOT NULL DEFAULT 'landing_v6',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.squad_registrations IS
'Registro oficial de escuadras (5 jóvenes de 15-17 años, escolares o recién egresados + 1 Mentor USIL/M4L) para el Marketing Gaming Challenge 2026.';

CREATE INDEX IF NOT EXISTS idx_squad_registrations_created_at
    ON public.squad_registrations (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_squad_registrations_school
    ON public.squad_registrations (school_name);

-- ============================================================================
-- 2. TABLA: public.mentor_applications (Postulación de Mentores USIL / M4L)
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
    client_source VARCHAR(32) NOT NULL DEFAULT 'landing_v6',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.mentor_applications IS
'Postulaciones de estudiantes universitarios USIL y miembros del Club M4L a la Bolsa Oficial de Mentores.';

CREATE INDEX IF NOT EXISTS idx_mentor_applications_email
    ON public.mentor_applications (institutional_email);

-- ============================================================================
-- 3. SEGURIDAD DE FILAS (ROW LEVEL SECURITY — LEY N° 29733)
-- Regla: El cliente público (`anon`) SOLO puede insertar registros válidos.
-- NINGÚN usuario anónimo puede leer (SELECT), actualizar (UPDATE) ni borrar (DELETE)
-- datos personales de participantes ni mentores desde el navegador.
-- ============================================================================

ALTER TABLE public.squad_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_applications ENABLE ROW LEVEL SECURITY;

-- Revocar permisos de lectura/modificación/eliminación al rol público `anon`
REVOKE SELECT, UPDATE, DELETE ON public.squad_registrations FROM anon;
REVOKE SELECT, UPDATE, DELETE ON public.mentor_applications FROM anon;

-- Otorgar exclusivamente permiso de inserción al rol `anon` y `authenticated`
GRANT INSERT ON public.squad_registrations TO anon, authenticated;
GRANT INSERT ON public.mentor_applications TO anon, authenticated;

-- Políticas de inserción anónima validada para Escuadras
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

-- Políticas de inserción anónima validada para Mentores USIL / M4L
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

-- Políticas de lectura exclusiva para el rol administrativo `service_role` (Comité USIL / M4L)
DROP POLICY IF EXISTS "service_role_full_access_squads" ON public.squad_registrations;
CREATE POLICY "service_role_full_access_squads"
    ON public.squad_registrations
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

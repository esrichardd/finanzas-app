-- =============================================================================
-- 20260425000002 — Función updated_at reutilizable
-- =============================================================================
-- Trigger genérico que actualiza la columna updated_at a now() en cada UPDATE.
-- Se aplica a todas las tablas con esa columna en migraciones posteriores.
-- =============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

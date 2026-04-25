-- =============================================================================
-- 20260425000004 — Perfiles de usuario
-- =============================================================================
-- Extiende auth.users de Supabase con datos de perfil y preferencias.
-- Incluye trigger que crea automáticamente un profile al registrarse el usuario.
-- =============================================================================

CREATE TABLE profiles (
  id                       uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name               text,
  last_name                text,
  birth_date               date,
  birth_country_code       char(2) REFERENCES countries(code),
  residence_country_code   char(2) REFERENCES countries(code),
  gender                   gender,
  contract_type            contract_type,
  occupation_id            uuid REFERENCES occupations(id),
  language_code            char(2) NOT NULL DEFAULT 'es',
  primary_currency_code    text NOT NULL DEFAULT 'COP' REFERENCES currencies(code),
  theme                    theme NOT NULL DEFAULT 'system',
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- Crear profile automáticamente cuando se registra un usuario en auth.users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

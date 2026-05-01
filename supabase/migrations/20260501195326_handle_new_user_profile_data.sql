-- =============================================================================
-- 20260501195326 — handle_new_user lee first_name y last_name de metadata
-- =============================================================================
-- Reemplaza la función creada en 20260425000004_profiles.sql para que cuando
-- el cliente llame a supabase.auth.signUp({ email, password, options: { data:
-- { first_name, last_name } } }) los nombres queden persistidos en profiles
-- desde el primer momento, sin un UPDATE adicional.
--
-- raw_user_meta_data es el JSON donde Supabase guarda lo que mandaste en
-- options.data al hacer signUp.
-- =============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    NULLIF(NEW.raw_user_meta_data->>'first_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'last_name',  '')
  );
  RETURN NEW;
END;
$$;

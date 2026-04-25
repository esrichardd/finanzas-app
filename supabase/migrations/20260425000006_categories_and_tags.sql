-- =============================================================================
-- 20260425000006 — Categorías y tags
-- =============================================================================
-- Categorías híbridas: sistema (user_id IS NULL) + custom de usuario.
-- Jerarquía vía parent_id. Tags por usuario, sin jerarquía.
-- =============================================================================

CREATE TABLE categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES profiles(id) ON DELETE CASCADE,    -- NULL = categoría de sistema
  parent_id   uuid REFERENCES categories(id) ON DELETE CASCADE,
  name        text NOT NULL,
  icon        text,
  color       text,
  kind        category_kind NOT NULL,
  is_system   boolean NOT NULL DEFAULT false,
  sort_order  smallint NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT categories_system_no_user CHECK (
    (is_system = true AND user_id IS NULL)
    OR (is_system = false AND user_id IS NOT NULL)
  )
);

CREATE INDEX idx_categories_user      ON categories(user_id);
CREATE INDEX idx_categories_parent    ON categories(parent_id);
CREATE INDEX idx_categories_system    ON categories(kind) WHERE is_system = true;

CREATE TRIGGER trg_categories_updated
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- Permite a un usuario "ocultar" una categoría de sistema sin borrarla
CREATE TABLE user_hidden_categories (
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, category_id)
);


CREATE TABLE tags (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name       text NOT NULL,
  color      text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

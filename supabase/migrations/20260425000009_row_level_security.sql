-- =============================================================================
-- 20260425000009 — Row Level Security
-- =============================================================================
-- Aislamiento por usuario via auth.uid(). Toda tabla con datos de usuario
-- tiene RLS. Catálogos son lectura pública para autenticados.
-- =============================================================================

-- Profiles: cada usuario solo el suyo
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_self ON profiles
  FOR ALL TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Accounts
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY accounts_owner ON accounts
  FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Crypto holdings
ALTER TABLE crypto_holdings ENABLE ROW LEVEL SECURITY;
CREATE POLICY crypto_holdings_owner ON crypto_holdings
  FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY transactions_owner ON transactions
  FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Transaction entries (RLS propio: no confiar solo en el de transactions)
ALTER TABLE transaction_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY entries_via_parent ON transaction_entries
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM transactions t
    WHERE t.id = transaction_entries.transaction_id
      AND t.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM transactions t
    WHERE t.id = transaction_entries.transaction_id
      AND t.user_id = auth.uid()
  ));

-- Transaction tags
ALTER TABLE transaction_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY transaction_tags_owner ON transaction_tags
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM transactions t
    WHERE t.id = transaction_tags.transaction_id AND t.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM transactions t
    WHERE t.id = transaction_tags.transaction_id AND t.user_id = auth.uid()
  ));

-- Tags
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY tags_owner ON tags
  FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Categories: ver sistema + propias, escribir solo propias
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY categories_select ON categories FOR SELECT TO authenticated
  USING (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY categories_insert ON categories FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND is_system = false);
CREATE POLICY categories_update ON categories FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND is_system = false);
CREATE POLICY categories_delete ON categories FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND is_system = false);

-- User hidden categories
ALTER TABLE user_hidden_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY hidden_cats_owner ON user_hidden_categories
  FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Catálogos: lectura para autenticados, escritura solo service_role
ALTER TABLE countries              ENABLE ROW LEVEL SECURITY;
ALTER TABLE currencies             ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_assets          ENABLE ROW LEVEL SECURITY;
ALTER TABLE occupations            ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_types          ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates         ENABLE ROW LEVEL SECURITY;

CREATE POLICY countries_read              ON countries              FOR SELECT TO authenticated USING (true);
CREATE POLICY currencies_read             ON currencies             FOR SELECT TO authenticated USING (true);
CREATE POLICY crypto_assets_read          ON crypto_assets          FOR SELECT TO authenticated USING (true);
CREATE POLICY occupations_read            ON occupations            FOR SELECT TO authenticated USING (true);
CREATE POLICY account_types_read          ON account_types          FOR SELECT TO authenticated USING (true);
CREATE POLICY financial_institutions_read ON financial_institutions FOR SELECT TO authenticated USING (true);
CREATE POLICY exchange_rates_read         ON exchange_rates         FOR SELECT TO authenticated USING (true);

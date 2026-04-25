-- =============================================================================
-- 20260425000007 — Transacciones y entries (doble entrada contable)
-- =============================================================================
-- El corazón del modelo. Ver ADR 0002.
--
-- Cada `transaction` es la intención del usuario (la operación de negocio).
-- Cada `transaction_entry` es un movimiento atómico sobre una cuenta o holding.
-- Una transferencia con comisión = 1 transaction + 3 entries (origen, destino, fee).
-- =============================================================================

CREATE TABLE transactions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type              transaction_type NOT NULL,
  occurred_at       timestamptz NOT NULL,
  category_id       uuid REFERENCES categories(id),
  description       text,

  -- Para transfer_fx, crypto_buy, crypto_sell: tasa usada en esta operación.
  -- Se guarda aquí para reconstruir cualquier conversión histórica sin
  -- depender de exchange_rates externos.
  fx_rate           numeric(20, 8),
  fx_from_currency  text,
  fx_to_currency    text,

  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  deleted_at        timestamptz,

  CONSTRAINT tx_fx_consistency CHECK (
    (type IN ('transfer_fx', 'crypto_buy', 'crypto_sell')
     AND fx_rate IS NOT NULL
     AND fx_from_currency IS NOT NULL
     AND fx_to_currency IS NOT NULL)
    OR
    (type IN ('income', 'expense', 'transfer_same_currency')
     AND fx_rate IS NULL
     AND fx_from_currency IS NULL
     AND fx_to_currency IS NULL)
  )
);

CREATE INDEX idx_tx_user_time
  ON transactions(user_id, occurred_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_tx_user_category_time
  ON transactions(user_id, category_id, occurred_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_tx_user_type_time
  ON transactions(user_id, type, occurred_at DESC)
  WHERE deleted_at IS NULL;

CREATE TRIGGER trg_transactions_updated
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE transaction_entries (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id      uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  direction           entry_direction NOT NULL,
  role                entry_role NOT NULL,
  account_id          uuid REFERENCES accounts(id),
  crypto_holding_id   uuid REFERENCES crypto_holdings(id),
  amount              numeric(20, 8) NOT NULL CHECK (amount >= 0),
  currency_code       text NOT NULL,
  is_fee              boolean NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now(),

  -- Exactamente uno de los dos targets debe estar presente
  CONSTRAINT entry_target_xor CHECK (
    (account_id IS NOT NULL AND crypto_holding_id IS NULL)
    OR
    (account_id IS NULL AND crypto_holding_id IS NOT NULL)
  )
);

-- Índices clave para cálculo de saldos (sostiene ADR 0003).
-- Si se eliminan, la decisión de saldos on-the-fly deja de ser viable.
CREATE INDEX idx_entries_account
  ON transaction_entries(account_id, transaction_id)
  WHERE account_id IS NOT NULL;

CREATE INDEX idx_entries_crypto
  ON transaction_entries(crypto_holding_id, transaction_id)
  WHERE crypto_holding_id IS NOT NULL;

CREATE INDEX idx_entries_fees
  ON transaction_entries(transaction_id) WHERE is_fee = true;

CREATE INDEX idx_entries_tx ON transaction_entries(transaction_id);


CREATE TABLE transaction_tags (
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  tag_id         uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (transaction_id, tag_id)
);

CREATE INDEX idx_tx_tags_tag ON transaction_tags(tag_id);


-- =============================================================================
-- Validación estructural diferida: cada tipo de transacción debe tener
-- la cantidad y dirección correcta de entries (excluyendo fees).
-- Se ejecuta al COMMIT para permitir insertar transaction + entries en
-- la misma transacción SQL sin que el constraint dispare prematuramente.
-- =============================================================================

CREATE OR REPLACE FUNCTION validate_transaction_structure()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  v_type     transaction_type;
  v_non_fee  int;
  v_debits   int;
  v_credits  int;
BEGIN
  SELECT t.type INTO v_type FROM transactions t
   WHERE t.id = COALESCE(NEW.transaction_id, OLD.transaction_id);

  IF v_type IS NULL THEN
    RETURN NULL;  -- la transacción ya no existe (cascada)
  END IF;

  SELECT
    COUNT(*) FILTER (WHERE NOT is_fee),
    COUNT(*) FILTER (WHERE direction = 'debit'  AND NOT is_fee),
    COUNT(*) FILTER (WHERE direction = 'credit' AND NOT is_fee)
  INTO v_non_fee, v_debits, v_credits
  FROM transaction_entries
  WHERE transaction_id = COALESCE(NEW.transaction_id, OLD.transaction_id);

  CASE v_type
    WHEN 'income' THEN
      IF v_non_fee <> 1 OR v_credits <> 1 THEN
        RAISE EXCEPTION 'income debe tener exactamente 1 entry credit (no fee)';
      END IF;
    WHEN 'expense' THEN
      IF v_non_fee <> 1 OR v_debits <> 1 THEN
        RAISE EXCEPTION 'expense debe tener exactamente 1 entry debit (no fee)';
      END IF;
    WHEN 'transfer_same_currency', 'transfer_fx', 'crypto_buy', 'crypto_sell' THEN
      IF v_non_fee <> 2 OR v_debits <> 1 OR v_credits <> 1 THEN
        RAISE EXCEPTION '% debe tener 1 debit + 1 credit (no fee)', v_type;
      END IF;
  END CASE;

  RETURN NULL;
END;
$$;

CREATE CONSTRAINT TRIGGER trg_validate_tx_structure
  AFTER INSERT OR UPDATE OR DELETE ON transaction_entries
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION validate_transaction_structure();

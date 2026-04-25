-- =============================================================================
-- 20260425000005 — Cuentas fiat y tenencias cripto
-- =============================================================================
-- Decisión: cripto como entidad separada (ver ADR 0001).
-- Cuentas fiat referencian currencies; crypto_holdings referencian crypto_assets.
-- =============================================================================

CREATE TABLE accounts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name              text NOT NULL,
  account_type_code text NOT NULL REFERENCES account_types(code),
  currency_code     text NOT NULL REFERENCES currencies(code),
  institution_id    uuid REFERENCES financial_institutions(id),
  initial_balance   numeric(20, 8) NOT NULL DEFAULT 0,
  is_archived       boolean NOT NULL DEFAULT false,
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  deleted_at        timestamptz
);

CREATE TRIGGER trg_accounts_updated
  BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Trigger: una cuenta fiat no puede tener moneda marcada como cripto.
-- Esto refuerza la separación a nivel de DB (ver ADR 0001).
CREATE OR REPLACE FUNCTION accounts_block_crypto_currency()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM currencies WHERE code = NEW.currency_code AND is_crypto) THEN
    RAISE EXCEPTION 'Las cuentas fiat no pueden usar monedas cripto. Usa crypto_holdings.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_accounts_no_crypto
  BEFORE INSERT OR UPDATE OF currency_code ON accounts
  FOR EACH ROW EXECUTE FUNCTION accounts_block_crypto_currency();

CREATE INDEX idx_accounts_user_active
  ON accounts(user_id)
  WHERE deleted_at IS NULL AND is_archived = false;


CREATE TABLE crypto_holdings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name            text NOT NULL,                       -- 'Phantom Wallet', 'Binance Spot'
  crypto_symbol   text NOT NULL REFERENCES crypto_assets(symbol),
  network         text,                                -- 'mainnet', 'polygon', 'solana'
  wallet_address  text,
  is_archived     boolean NOT NULL DEFAULT false,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

CREATE TRIGGER trg_crypto_holdings_updated
  BEFORE UPDATE ON crypto_holdings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_crypto_holdings_user_active
  ON crypto_holdings(user_id)
  WHERE deleted_at IS NULL AND is_archived = false;

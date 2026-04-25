-- =============================================================================
-- 20260425000003 — Tablas catálogo
-- =============================================================================
-- Países (ISO 3166-1), monedas (ISO 4217 + cripto), activos cripto,
-- ocupaciones, tipos de cuenta, instituciones financieras.
-- Estos catálogos son compartidos entre todos los usuarios.
-- =============================================================================

-- ISO 3166-1 alpha-2
CREATE TABLE countries (
  code         char(2) PRIMARY KEY,
  name_es      text NOT NULL,
  name_en      text NOT NULL,
  phone_prefix text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ISO 4217 + cripto (is_crypto = true)
CREATE TABLE currencies (
  code        text PRIMARY KEY CHECK (code = upper(code) AND length(code) BETWEEN 3 AND 6),
  name        text NOT NULL,
  symbol      text,
  decimals    smallint NOT NULL DEFAULT 2,
  is_crypto   boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);
-- Nota: ISO 4217 fiat usa 3 chars; cripto puede llegar a 5 (ej. USDT, USDC).
-- El check length 3..6 da margen sin permitir basura. Mantenemos uppercase
-- para evitar duplicados como 'USD' vs 'usd'.

-- Metadata específica de criptomonedas (decimals reales, ID coingecko, etc.)
CREATE TABLE crypto_assets (
  symbol       text PRIMARY KEY,      -- 'BTC', 'SOL', 'ETH'
  name         text NOT NULL,
  decimals     smallint NOT NULL DEFAULT 8,
  coingecko_id text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE occupations (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_es    text NOT NULL,
  name_en    text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE account_types (
  code       text PRIMARY KEY,        -- 'bank_account', 'digital_wallet', 'cash', 'credit_card', etc.
  name_es    text NOT NULL,
  name_en    text NOT NULL,
  is_credit  boolean NOT NULL DEFAULT false
);

CREATE TABLE financial_institutions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  country_code char(2) REFERENCES countries(code),
  logo_url     text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_institutions_country ON financial_institutions(country_code);

-- Tasas de cambio históricas
CREATE TABLE exchange_rates (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency text NOT NULL,
  to_currency   text NOT NULL,
  rate          numeric(20, 8) NOT NULL CHECK (rate > 0),
  observed_at   timestamptz NOT NULL DEFAULT now(),
  source        text,                 -- 'coingecko', 'banrep', 'user_provided'
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT exchange_rates_distinct CHECK (from_currency <> to_currency)
);

CREATE INDEX idx_rates_pair_time
  ON exchange_rates(from_currency, to_currency, observed_at DESC);

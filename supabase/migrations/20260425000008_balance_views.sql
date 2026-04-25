-- =============================================================================
-- 20260425000008 — Vistas de saldos
-- =============================================================================
-- Saldos calculados on-the-fly desde transaction_entries (ver ADR 0003).
-- Estas vistas son la fuente de verdad para saldos de cuentas y holdings.
-- =============================================================================

CREATE OR REPLACE VIEW v_account_balances AS
SELECT
  a.id              AS account_id,
  a.user_id,
  a.name,
  a.currency_code,
  a.initial_balance + COALESCE(SUM(
    CASE e.direction
      WHEN 'credit' THEN e.amount
      WHEN 'debit'  THEN -e.amount
    END
  ), 0) AS balance
FROM accounts a
LEFT JOIN transaction_entries e ON e.account_id = a.id
LEFT JOIN transactions t        ON t.id = e.transaction_id AND t.deleted_at IS NULL
WHERE a.deleted_at IS NULL
GROUP BY a.id, a.user_id, a.name, a.currency_code, a.initial_balance;


CREATE OR REPLACE VIEW v_crypto_holdings_balances AS
SELECT
  ch.id              AS holding_id,
  ch.user_id,
  ch.name,
  ch.crypto_symbol,
  COALESCE(SUM(
    CASE e.direction
      WHEN 'credit' THEN e.amount
      WHEN 'debit'  THEN -e.amount
    END
  ), 0) AS quantity
FROM crypto_holdings ch
LEFT JOIN transaction_entries e ON e.crypto_holding_id = ch.id
LEFT JOIN transactions t        ON t.id = e.transaction_id AND t.deleted_at IS NULL
WHERE ch.deleted_at IS NULL
GROUP BY ch.id, ch.user_id, ch.name, ch.crypto_symbol;


-- Vista unificada para "patrimonio total"
CREATE OR REPLACE VIEW v_financial_assets AS
SELECT
  user_id,
  'fiat'::text         AS asset_kind,
  account_id           AS id,
  name,
  currency_code        AS asset_code,
  balance              AS quantity
FROM v_account_balances
UNION ALL
SELECT
  user_id,
  'crypto'::text       AS asset_kind,
  holding_id           AS id,
  name,
  crypto_symbol        AS asset_code,
  quantity
FROM v_crypto_holdings_balances;

-- =============================================================================
-- seed.sql — Datos de prueba para desarrollo local
-- =============================================================================
-- Este archivo se ejecuta DESPUÉS de las migraciones en `supabase db reset`.
-- Solo aplica en entornos locales, NO se ejecuta en producción.
--
-- Crea un usuario de prueba con cuentas, holdings cripto y transacciones
-- de ejemplo para poder desarrollar el frontend sin tener que crear todo
-- a mano cada vez que se resetea la base.
-- =============================================================================

-- Usuario de prueba en auth.users
-- Email: test@example.com / Password: testpassword123
DO $$
DECLARE
  v_user_id uuid := '11111111-1111-1111-1111-111111111111';
  v_acc_vita uuid;
  v_acc_bancolombia uuid;
  v_acc_efectivo uuid;
  v_holding_btc uuid;
  v_holding_sol uuid;
  v_cat_salario uuid;
  v_cat_alimentacion uuid;
  v_cat_transporte uuid;
  v_cat_comisiones uuid;
  v_tx_id uuid;
BEGIN
  -- Insertar usuario directamente en auth.users
  -- (en producción, esto lo maneja Supabase Auth)
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin, confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) VALUES (
    v_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'test@example.com', crypt('testpassword123', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}',
    false, '', '', '', ''
  )
  ON CONFLICT (id) DO NOTHING;

  -- El trigger handle_new_user creó el profile automáticamente.
  -- Lo actualizamos con datos.
  UPDATE profiles SET
    first_name = 'Test',
    last_name = 'User',
    birth_date = '1990-05-15',
    birth_country_code = 'CO',
    residence_country_code = 'CO',
    gender = 'prefer_not_to_say',
    contract_type = 'freelance',
    primary_currency_code = 'COP',
    theme = 'system'
  WHERE id = v_user_id;

  -- Cuentas fiat
  INSERT INTO accounts (id, user_id, name, account_type_code, currency_code, initial_balance)
  VALUES
    (gen_random_uuid(), v_user_id, 'Vita USD',          'digital_wallet', 'USD', 500),
    (gen_random_uuid(), v_user_id, 'Bancolombia',       'bank_account',   'COP', 2000000),
    (gen_random_uuid(), v_user_id, 'Efectivo',          'cash',           'COP', 100000);

  SELECT id INTO v_acc_vita        FROM accounts WHERE user_id = v_user_id AND name = 'Vita USD';
  SELECT id INTO v_acc_bancolombia FROM accounts WHERE user_id = v_user_id AND name = 'Bancolombia';
  SELECT id INTO v_acc_efectivo    FROM accounts WHERE user_id = v_user_id AND name = 'Efectivo';

  -- Holdings cripto
  INSERT INTO crypto_holdings (id, user_id, name, crypto_symbol, network) VALUES
    (gen_random_uuid(), v_user_id, 'Phantom Wallet', 'SOL', 'solana'),
    (gen_random_uuid(), v_user_id, 'Ledger BTC',     'BTC', 'mainnet');

  SELECT id INTO v_holding_btc FROM crypto_holdings WHERE user_id = v_user_id AND name = 'Ledger BTC';
  SELECT id INTO v_holding_sol FROM crypto_holdings WHERE user_id = v_user_id AND name = 'Phantom Wallet';

  -- Capturar IDs de categorías de sistema
  SELECT id INTO v_cat_salario      FROM categories WHERE is_system AND name = 'Salario';
  SELECT id INTO v_cat_alimentacion FROM categories WHERE is_system AND name = 'Alimentación';
  SELECT id INTO v_cat_transporte   FROM categories WHERE is_system AND name = 'Transporte';
  SELECT id INTO v_cat_comisiones   FROM categories WHERE is_system AND name = 'Comisiones bancarias';

  -- =====================================================================
  -- Transacciones de ejemplo
  -- =====================================================================

  -- 1. Ingreso: salario en Bancolombia
  INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description)
  VALUES (gen_random_uuid(), v_user_id, 'income', now() - interval '5 days',
          v_cat_salario, 'Salario marzo')
  RETURNING id INTO v_tx_id;

  INSERT INTO transaction_entries
    (transaction_id, direction, role, account_id, amount, currency_code, is_fee)
  VALUES
    (v_tx_id, 'credit', 'destination', v_acc_bancolombia, 3500000, 'COP', false);

  -- 2. Gasto: supermercado pagado con cuenta bancaria
  INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description)
  VALUES (gen_random_uuid(), v_user_id, 'expense', now() - interval '3 days',
          v_cat_alimentacion, 'Compra supermercado')
  RETURNING id INTO v_tx_id;

  INSERT INTO transaction_entries
    (transaction_id, direction, role, account_id, amount, currency_code, is_fee)
  VALUES
    (v_tx_id, 'debit', 'source', v_acc_bancolombia, 250000, 'COP', false);

  -- 3. Gasto efectivo: taxi
  INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description)
  VALUES (gen_random_uuid(), v_user_id, 'expense', now() - interval '2 days',
          v_cat_transporte, 'Taxi al aeropuerto')
  RETURNING id INTO v_tx_id;

  INSERT INTO transaction_entries
    (transaction_id, direction, role, account_id, amount, currency_code, is_fee)
  VALUES
    (v_tx_id, 'debit', 'source', v_acc_efectivo, 35000, 'COP', false);

  -- 4. Transferencia FX: Bancolombia COP -> Vita USD con comisión
  INSERT INTO transactions
    (id, user_id, type, occurred_at, description,
     fx_rate, fx_from_currency, fx_to_currency)
  VALUES
    (gen_random_uuid(), v_user_id, 'transfer_fx', now() - interval '1 day',
     'Compra USD para gastos en línea',
     4100, 'COP', 'USD')
  RETURNING id INTO v_tx_id;

  INSERT INTO transaction_entries
    (transaction_id, direction, role, account_id, amount, currency_code, is_fee)
  VALUES
    (v_tx_id, 'debit',  'source',      v_acc_bancolombia, 410000, 'COP', false),
    (v_tx_id, 'credit', 'destination', v_acc_vita,        100,    'USD', false),
    (v_tx_id, 'debit',  'fee',         v_acc_bancolombia, 5000,   'COP', true);

  -- 5. Compra de cripto: 50 USD de Vita -> 0.0008 BTC en Ledger
  INSERT INTO transactions
    (id, user_id, type, occurred_at, description,
     fx_rate, fx_from_currency, fx_to_currency)
  VALUES
    (gen_random_uuid(), v_user_id, 'crypto_buy', now() - interval '12 hours',
     'DCA mensual BTC',
     62500, 'USD', 'BTC')
  RETURNING id INTO v_tx_id;

  INSERT INTO transaction_entries
    (transaction_id, direction, role, account_id, crypto_holding_id,
     amount, currency_code, is_fee)
  VALUES
    (v_tx_id, 'debit',  'source',      v_acc_vita,    NULL,         50,     'USD', false),
    (v_tx_id, 'credit', 'destination', NULL,          v_holding_btc, 0.0008, 'BTC', false);

  -- Tasas de cambio recientes para que las queries de patrimonio funcionen
  INSERT INTO exchange_rates (from_currency, to_currency, rate, source) VALUES
    ('USD', 'COP', 4100,    'manual'),
    ('BTC', 'USD', 62500,   'manual'),
    ('BTC', 'COP', 256250000, 'manual'),
    ('SOL', 'USD', 145,     'manual'),
    ('SOL', 'COP', 594500,  'manual');

  RAISE NOTICE 'Seed completado: usuario test@example.com con 3 cuentas, 2 holdings cripto y 5 transacciones.';
END
$$;

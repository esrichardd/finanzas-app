-- =============================================================================
-- seed.sql — Datos de prueba abundantes para desarrollo local
-- =============================================================================
-- Crea 3 usuarios con perfiles distintos:
--
--   1. ana@example.com    — Freelance Colombia, mayoría COP, algo de USD,
--                           cripto moderado. ~140 transacciones.
--   2. carlos@example.com — Salaried Estados Unidos, USD primary, cuenta
--                           española en EUR, sin cripto. ~120 transacciones.
--   3. sofia@example.com  — Crypto-heavy en Argentina, ARS primary,
--                           muchos holdings cripto, varias compras/ventas.
--                           ~150 transacciones.
--
-- Todos: testpassword123
--
-- Cubre todos los casos límite del modelo:
--   - 6 tipos de transacción
--   - Comisiones en moneda origen y destino
--   - Tarjetas de crédito con saldo negativo
--   - Cuentas archivadas (is_archived=true)
--   - Cuentas con soft delete (deleted_at)
--   - Holdings cripto con cantidad cero (vendidos completos)
--   - Holdings archivados
--   - Categorías custom de usuario
--   - user_hidden_categories
--   - Tags variados
--   - Transacciones con soft delete
--   - Exchange rates con histórico de 90 días
-- =============================================================================

-- =============================================================================
-- Limpieza previa (idempotente)
-- =============================================================================

DELETE FROM transaction_tags;
DELETE FROM transaction_entries;
DELETE FROM transactions;
DELETE FROM tags;
DELETE FROM user_hidden_categories;
DELETE FROM categories WHERE NOT is_system;
DELETE FROM crypto_holdings;
DELETE FROM accounts;
DELETE FROM exchange_rates;
DELETE FROM profiles WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);
DELETE FROM auth.users WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);


-- =============================================================================
-- Crear los tres usuarios en auth.users
-- =============================================================================

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, confirmation_token, recovery_token,
  email_change_token_new, email_change
)
SELECT
  u.id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  u.email, crypt('testpassword123', gen_salt('bf')),
  now(), now() - interval '6 months', now(),
  '{"provider":"email","providers":["email"]}', '{}',
  false, '', '', '', ''
FROM (VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 'ana@example.com'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'carlos@example.com'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'sofia@example.com')
) u(id, email)
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- Exchange rates históricos (90 días para los pares más usados)
-- =============================================================================

INSERT INTO exchange_rates (from_currency, to_currency, rate, observed_at, source)
SELECT
  pair.from_curr,
  pair.to_curr,
  pair.base_rate * (1 + (random() - 0.5) * 0.04),  -- ±2% variación día a día
  now() - (n || ' days')::interval,
  'seed'
FROM generate_series(0, 89) n
CROSS JOIN (VALUES
  ('USD', 'COP', 4100.0),
  ('USD', 'MXN', 17.5),
  ('USD', 'ARS', 1050.0),
  ('USD', 'BRL', 5.0),
  ('USD', 'CLP', 920.0),
  ('USD', 'PEN', 3.75),
  ('USD', 'EUR', 0.92),
  ('USD', 'GBP', 0.79),
  ('EUR', 'COP', 4450.0),
  ('EUR', 'USD', 1.08),
  ('BTC', 'USD', 62000.0),
  ('BTC', 'COP', 254000000.0),
  ('ETH', 'USD', 3100.0),
  ('SOL', 'USD', 145.0),
  ('USDT', 'USD', 1.0),
  ('USDC', 'USD', 1.0),
  ('USDT', 'COP', 4100.0),
  ('USDT', 'ARS', 1050.0),
  ('ADA', 'USD', 0.45),
  ('MATIC', 'USD', 0.78)
) pair(from_curr, to_curr, base_rate);


-- =============================================================================
-- Helper: ya tenemos los profiles creados por el trigger handle_new_user.
-- Los actualizamos con datos.
-- =============================================================================

UPDATE profiles SET
  first_name = 'Ana',
  last_name = 'Restrepo',
  birth_date = '1992-03-15',
  birth_country_code = 'CO',
  residence_country_code = 'CO',
  gender = 'female',
  contract_type = 'freelance',
  primary_currency_code = 'COP',
  language_code = 'es',
  theme = 'dark'
WHERE id = '11111111-1111-1111-1111-111111111111';

UPDATE profiles SET
  first_name = 'Carlos',
  last_name = 'Mendoza',
  birth_date = '1988-07-22',
  birth_country_code = 'MX',
  residence_country_code = 'US',
  gender = 'male',
  contract_type = 'permanent',
  primary_currency_code = 'USD',
  language_code = 'en',
  theme = 'light'
WHERE id = '22222222-2222-2222-2222-222222222222';

UPDATE profiles SET
  first_name = 'Sofía',
  last_name = 'García',
  birth_date = '1995-11-08',
  birth_country_code = 'AR',
  residence_country_code = 'AR',
  gender = 'female',
  contract_type = 'self_employed',
  primary_currency_code = 'ARS',
  language_code = 'es',
  theme = 'system'
WHERE id = '33333333-3333-3333-3333-333333333333';


-- =============================================================================
-- BLOQUE PRINCIPAL: cuentas, holdings, categorías, tags, transacciones
-- =============================================================================

DO $$
DECLARE
  -- Usuarios
  u_ana    uuid := '11111111-1111-1111-1111-111111111111';
  u_carlos uuid := '22222222-2222-2222-2222-222222222222';
  u_sofia  uuid := '33333333-3333-3333-3333-333333333333';

  -- IDs categorías sistema (las leemos al inicio)
  cat_salario       uuid;
  cat_freelance     uuid;
  cat_inversiones   uuid;
  cat_reembolsos    uuid;
  cat_bonos         uuid;
  cat_alimentacion  uuid;
  cat_supermercado  uuid;
  cat_restaurantes  uuid;
  cat_cafe          uuid;
  cat_delivery      uuid;
  cat_transporte    uuid;
  cat_uber          uuid;
  cat_gasolina      uuid;
  cat_pubtransport  uuid;
  cat_vivienda      uuid;
  cat_renta         uuid;
  cat_servicios     uuid;
  cat_internet      uuid;
  cat_movil         uuid;
  cat_electricidad  uuid;
  cat_agua          uuid;
  cat_salud         uuid;
  cat_farmacia      uuid;
  cat_gimnasio      uuid;
  cat_entretenim    uuid;
  cat_streaming     uuid;
  cat_software      uuid;
  cat_suscripciones uuid;
  cat_compras       uuid;
  cat_ropa          uuid;
  cat_electronica   uuid;
  cat_viajes        uuid;
  cat_vuelos        uuid;
  cat_hospedaje     uuid;
  cat_comisiones    uuid;
  cat_staking       uuid;
  cat_dividendos    uuid;
  cat_venta_activos uuid;

  -- Cuentas Ana
  acc_ana_bancol   uuid := gen_random_uuid();
  acc_ana_nequi    uuid := gen_random_uuid();
  acc_ana_efectivo uuid := gen_random_uuid();
  acc_ana_vita_usd uuid := gen_random_uuid();
  acc_ana_visa     uuid := gen_random_uuid();   -- tarjeta crédito (saldo negativo)
  acc_ana_ahorros  uuid := gen_random_uuid();
  acc_ana_vieja    uuid := gen_random_uuid();   -- soft-deleted
  ch_ana_btc       uuid := gen_random_uuid();
  ch_ana_eth       uuid := gen_random_uuid();
  ch_ana_doge      uuid := gen_random_uuid();   -- archivada (vendido todo)

  -- Cuentas Carlos
  acc_car_chase    uuid := gen_random_uuid();
  acc_car_boa      uuid := gen_random_uuid();
  acc_car_amex     uuid := gen_random_uuid();   -- tarjeta crédito
  acc_car_paypal   uuid := gen_random_uuid();
  acc_car_efectivo uuid := gen_random_uuid();
  acc_car_caixa    uuid := gen_random_uuid();   -- cuenta en EUR
  acc_car_inv      uuid := gen_random_uuid();   -- brokerage

  -- Cuentas Sofia
  acc_sof_galicia  uuid := gen_random_uuid();
  acc_sof_uala     uuid := gen_random_uuid();
  acc_sof_mp       uuid := gen_random_uuid();
  acc_sof_efectivo uuid := gen_random_uuid();
  acc_sof_binance  uuid := gen_random_uuid();   -- exchange (cuenta fiat USDT-equivalente)
  ch_sof_btc       uuid := gen_random_uuid();
  ch_sof_eth       uuid := gen_random_uuid();
  ch_sof_sol       uuid := gen_random_uuid();
  ch_sof_usdt      uuid := gen_random_uuid();
  ch_sof_ada       uuid := gen_random_uuid();
  ch_sof_matic     uuid := gen_random_uuid();

  -- Custom categories
  cat_ana_clientes uuid := gen_random_uuid();
  cat_ana_curso    uuid := gen_random_uuid();
  cat_car_kids     uuid := gen_random_uuid();
  cat_sof_trading  uuid := gen_random_uuid();

  -- Tags
  tag_ana_trabajo     uuid := gen_random_uuid();
  tag_ana_vacaciones  uuid := gen_random_uuid();
  tag_ana_emergencia  uuid := gen_random_uuid();
  tag_ana_deducible   uuid := gen_random_uuid();
  tag_car_business    uuid := gen_random_uuid();
  tag_car_family      uuid := gen_random_uuid();
  tag_sof_dca         uuid := gen_random_uuid();
  tag_sof_swing       uuid := gen_random_uuid();

  -- Para loops
  v_tx_id    uuid;
  v_day      int;
  v_month    int;
  v_amount   numeric;
  v_rate     numeric;
BEGIN
  -- =========================================================================
  -- Recuperar IDs de categorías sistema
  -- =========================================================================
  SELECT id INTO cat_salario       FROM categories WHERE is_system AND name = 'Salario';
  SELECT id INTO cat_freelance     FROM categories WHERE is_system AND name = 'Freelance';
  SELECT id INTO cat_inversiones   FROM categories WHERE is_system AND name = 'Inversiones' AND parent_id IS NULL;
  SELECT id INTO cat_reembolsos    FROM categories WHERE is_system AND name = 'Reembolsos';
  SELECT id INTO cat_bonos         FROM categories WHERE is_system AND name = 'Bonos';
  SELECT id INTO cat_alimentacion  FROM categories WHERE is_system AND name = 'Alimentación' AND parent_id IS NULL;
  SELECT id INTO cat_supermercado  FROM categories WHERE is_system AND name = 'Supermercado';
  SELECT id INTO cat_restaurantes  FROM categories WHERE is_system AND name = 'Restaurantes';
  SELECT id INTO cat_cafe          FROM categories WHERE is_system AND name = 'Café';
  SELECT id INTO cat_delivery      FROM categories WHERE is_system AND name = 'Comida a domicilio';
  SELECT id INTO cat_transporte    FROM categories WHERE is_system AND name = 'Transporte' AND parent_id IS NULL;
  SELECT id INTO cat_uber          FROM categories WHERE is_system AND name = 'Uber / Taxi';
  SELECT id INTO cat_gasolina      FROM categories WHERE is_system AND name = 'Gasolina';
  SELECT id INTO cat_pubtransport  FROM categories WHERE is_system AND name = 'Transporte público';
  SELECT id INTO cat_vivienda      FROM categories WHERE is_system AND name = 'Vivienda' AND parent_id IS NULL;
  SELECT id INTO cat_renta         FROM categories WHERE is_system AND name = 'Renta / Hipoteca';
  SELECT id INTO cat_servicios     FROM categories WHERE is_system AND name = 'Servicios' AND parent_id IS NULL;
  SELECT id INTO cat_internet      FROM categories WHERE is_system AND name = 'Internet';
  SELECT id INTO cat_movil         FROM categories WHERE is_system AND name = 'Móvil';
  SELECT id INTO cat_electricidad  FROM categories WHERE is_system AND name = 'Electricidad';
  SELECT id INTO cat_agua          FROM categories WHERE is_system AND name = 'Agua';
  SELECT id INTO cat_salud         FROM categories WHERE is_system AND name = 'Salud' AND parent_id IS NULL;
  SELECT id INTO cat_farmacia      FROM categories WHERE is_system AND name = 'Farmacia';
  SELECT id INTO cat_gimnasio      FROM categories WHERE is_system AND name = 'Gimnasio';
  SELECT id INTO cat_entretenim    FROM categories WHERE is_system AND name = 'Entretenimiento' AND parent_id IS NULL;
  SELECT id INTO cat_streaming     FROM categories WHERE is_system AND name = 'Streaming';
  SELECT id INTO cat_software      FROM categories WHERE is_system AND name = 'Software';
  SELECT id INTO cat_suscripciones FROM categories WHERE is_system AND name = 'Suscripciones' AND parent_id IS NULL;
  SELECT id INTO cat_compras       FROM categories WHERE is_system AND name = 'Compras' AND parent_id IS NULL;
  SELECT id INTO cat_ropa          FROM categories WHERE is_system AND name = 'Ropa';
  SELECT id INTO cat_electronica   FROM categories WHERE is_system AND name = 'Electrónica';
  SELECT id INTO cat_viajes        FROM categories WHERE is_system AND name = 'Viajes' AND parent_id IS NULL;
  SELECT id INTO cat_vuelos        FROM categories WHERE is_system AND name = 'Vuelos';
  SELECT id INTO cat_hospedaje     FROM categories WHERE is_system AND name = 'Hospedaje';
  SELECT id INTO cat_comisiones    FROM categories WHERE is_system AND name = 'Comisiones bancarias';
  SELECT id INTO cat_staking       FROM categories WHERE is_system AND name = 'Staking / Yield';
  SELECT id INTO cat_dividendos    FROM categories WHERE is_system AND name = 'Dividendos';
  SELECT id INTO cat_venta_activos FROM categories WHERE is_system AND name = 'Venta de activos';

  -- =========================================================================
  -- Categorías custom por usuario
  -- =========================================================================
  INSERT INTO categories (id, user_id, parent_id, name, icon, color, kind, is_system, sort_order) VALUES
    (cat_ana_clientes, u_ana, cat_freelance, 'Clientes recurrentes', 'users', '#4f46e5', 'income',  false, 10),
    (cat_ana_curso,    u_ana, NULL,          'Curso de fotografía',  'camera','#ec4899', 'expense', false, 200),
    (cat_car_kids,     u_carlos, NULL,       'Kids',                 'baby',  '#f59e0b', 'expense', false, 200),
    (cat_sof_trading,  u_sofia,  NULL,       'Trading',              'activity','#06b6d4','expense',false, 200);

  -- Sofia oculta la categoría "Mascotas" del sistema
  INSERT INTO user_hidden_categories (user_id, category_id)
  SELECT u_sofia, id FROM categories WHERE is_system AND name = 'Mascotas';

  -- =========================================================================
  -- Tags
  -- =========================================================================
  INSERT INTO tags (id, user_id, name, color) VALUES
    (tag_ana_trabajo,    u_ana, 'trabajo',    '#4f46e5'),
    (tag_ana_vacaciones, u_ana, 'vacaciones', '#ec4899'),
    (tag_ana_emergencia, u_ana, 'emergencia', '#ef4444'),
    (tag_ana_deducible,  u_ana, 'deducible',  '#10b981'),
    (tag_car_business,   u_carlos, 'business', '#4f46e5'),
    (tag_car_family,     u_carlos, 'family',   '#f59e0b'),
    (tag_sof_dca,        u_sofia, 'dca',       '#06b6d4'),
    (tag_sof_swing,      u_sofia, 'swing',     '#8b5cf6');

  -- =========================================================================
  -- Cuentas Ana
  -- =========================================================================
  INSERT INTO accounts (id, user_id, name, account_type_code, currency_code, institution_id, initial_balance, notes) VALUES
    (acc_ana_bancol,   u_ana, 'Bancolombia',     'bank_account',   'COP',
      (SELECT id FROM financial_institutions WHERE name = 'Bancolombia' LIMIT 1), 1500000, 'Cuenta principal'),
    (acc_ana_nequi,    u_ana, 'Nequi',           'digital_wallet', 'COP',
      (SELECT id FROM financial_institutions WHERE name = 'Nequi' LIMIT 1), 1200000, 'Para gastos chicos'),
    (acc_ana_efectivo, u_ana, 'Efectivo',        'cash',           'COP', NULL, 1500000, NULL),
    (acc_ana_vita_usd, u_ana, 'Vita USD',        'digital_wallet', 'USD',
      (SELECT id FROM financial_institutions WHERE name = 'Vita Wallet' LIMIT 1), 200, 'Para clientes USA'),
    (acc_ana_visa,     u_ana, 'Visa Bancolombia','credit_card',    'COP',
      (SELECT id FROM financial_institutions WHERE name = 'Bancolombia' LIMIT 1), 0, 'Tope $5M'),
    (acc_ana_ahorros,  u_ana, 'Ahorros',         'savings',        'COP',
      (SELECT id FROM financial_institutions WHERE name = 'Bancolombia' LIMIT 1), 5000000, 'Fondo emergencia');

  -- Cuenta soft-deleted (Ana cerró una cuenta vieja)
  INSERT INTO accounts (id, user_id, name, account_type_code, currency_code, initial_balance, deleted_at, notes) VALUES
    (acc_ana_vieja, u_ana, 'Davivienda (cerrada)', 'bank_account', 'COP', 0, now() - interval '2 months', 'Cerré esta cuenta');

  -- Holdings cripto Ana
  INSERT INTO crypto_holdings (id, user_id, name, crypto_symbol, network, wallet_address, notes) VALUES
    (ch_ana_btc, u_ana, 'Ledger BTC', 'BTC', 'mainnet', 'bc1q...', 'Hardware wallet'),
    (ch_ana_eth, u_ana, 'MetaMask',   'ETH', 'mainnet', '0xabc...', NULL);

  -- Holding archivado (Ana vendió todo)
  INSERT INTO crypto_holdings (id, user_id, name, crypto_symbol, is_archived, notes) VALUES
    (ch_ana_doge, u_ana, 'DOGE Robinhood (vendido)', 'DOGE', true, 'Vendido en pico 2024');

  -- =========================================================================
  -- Cuentas Carlos
  -- =========================================================================
  INSERT INTO accounts (id, user_id, name, account_type_code, currency_code, institution_id, initial_balance, notes) VALUES
    (acc_car_chase,    u_carlos, 'Chase Checking', 'bank_account',  'USD',
      (SELECT id FROM financial_institutions WHERE name = 'Chase' LIMIT 1), 4500, 'Cuenta principal'),
    (acc_car_boa,      u_carlos, 'BoA Savings',    'savings',       'USD',
      (SELECT id FROM financial_institutions WHERE name = 'Bank of America' LIMIT 1), 25000, 'Emergency fund'),
    (acc_car_amex,     u_carlos, 'Amex Gold',      'credit_card',   'USD',
      NULL, 0, '$10K limit'),
    (acc_car_paypal,   u_carlos, 'PayPal',         'digital_wallet','USD',
      (SELECT id FROM financial_institutions WHERE name = 'PayPal' LIMIT 1), 350, NULL),
    (acc_car_efectivo, u_carlos, 'Cash',           'cash',          'USD', NULL, 200, NULL),
    (acc_car_caixa,    u_carlos, 'CaixaBank EUR',  'bank_account',  'EUR',
      (SELECT id FROM financial_institutions WHERE name = 'CaixaBank' LIMIT 1), 1800, 'Cuenta heredada de visita a España'),
    (acc_car_inv,      u_carlos, 'Vanguard',       'brokerage',     'USD', NULL, 18000, 'VTI + VXUS index funds');

  -- =========================================================================
  -- Cuentas Sofia
  -- =========================================================================
  INSERT INTO accounts (id, user_id, name, account_type_code, currency_code, institution_id, initial_balance, notes) VALUES
    (acc_sof_galicia,  u_sofia, 'Galicia Pesos',     'bank_account',    'ARS',
      (SELECT id FROM financial_institutions WHERE name = 'Galicia' LIMIT 1), 8500000, 'Cuenta principal'),
    (acc_sof_uala,     u_sofia, 'Ualá',              'digital_wallet',  'ARS',
      (SELECT id FROM financial_institutions WHERE name = 'Ualá' LIMIT 1), 1200000, NULL),
    (acc_sof_mp,       u_sofia, 'Mercado Pago',      'digital_wallet',  'ARS',
      (SELECT id FROM financial_institutions WHERE name = 'Mercado Pago' AND country_code = 'AR' LIMIT 1), 750000, NULL),
    (acc_sof_efectivo, u_sofia, 'Efectivo USD',      'cash',            'USD', NULL, 800, 'Reserva en dólares'),
    (acc_sof_binance,  u_sofia, 'Binance Spot USD',  'crypto_exchange', 'USD',
      (SELECT id FROM financial_institutions WHERE name = 'Binance' LIMIT 1), 1500, 'Saldo USDT que se valora ≈ USD');

  -- Holdings cripto Sofia
  INSERT INTO crypto_holdings (id, user_id, name, crypto_symbol, network, notes) VALUES
    (ch_sof_btc,   u_sofia, 'Binance BTC',     'BTC',   'mainnet', NULL),
    (ch_sof_eth,   u_sofia, 'Binance ETH',     'ETH',   'mainnet', NULL),
    (ch_sof_sol,   u_sofia, 'Phantom Wallet',  'SOL',   'solana',  'Wallet self-custody'),
    (ch_sof_usdt, u_sofia, 'Binance USDT',    'USDT',  'tron',    'Stablecoin'),
    (ch_sof_ada,   u_sofia, 'Binance ADA',     'ADA',   'cardano', NULL),
    (ch_sof_matic, u_sofia, 'MetaMask Polygon','MATIC', 'polygon', NULL);

  -- Sofia: compra inicial grande de USDT hace 7 meses (capital inicial cripto)
  -- Esto le da liquidez en USDT antes de empezar a comprar BTC/ETH/SOL desde USDT.
  v_tx_id := gen_random_uuid();
  INSERT INTO transactions (id, user_id, type, occurred_at, description, fx_rate, fx_from_currency, fx_to_currency)
  VALUES (v_tx_id, u_sofia, 'crypto_buy', now() - interval '7 months',
          'Capital inicial USDT (ahorros previos)', 950, 'ARS', 'USDT');
  INSERT INTO transaction_entries (transaction_id, direction, role, account_id, crypto_holding_id, amount, currency_code, is_fee) VALUES
    (v_tx_id, 'debit',  'source',      acc_sof_galicia, NULL,         5000000,         'ARS',  false),
    (v_tx_id, 'credit', 'destination', NULL,            ch_sof_usdt,  5000000.0/950.0, 'USDT', false);

  RAISE NOTICE 'Setup base completo. Generando transacciones...';

  -- =========================================================================
  -- ANA: ~140 transacciones distribuidas en 6 meses
  -- =========================================================================

  -- Salario freelance mensual (cliente USA paga a Vita USD, ella convierte a COP)
  -- 6 meses, primero llega USD, luego transferencia FX
  FOR v_month IN 1..6 LOOP
    -- 1) Ingreso freelance en USD (cliente recurrente)
    v_tx_id := gen_random_uuid();
    INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description)
    VALUES (v_tx_id, u_ana, 'income',
            (now() - (v_month || ' months')::interval + interval '5 days')::timestamptz,
            cat_ana_clientes, 'Pago cliente USA — proyecto mensual');

    INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
    VALUES (v_tx_id, 'credit', 'destination', acc_ana_vita_usd, 1500 + (random() * 500)::int, 'USD');

    INSERT INTO transaction_tags (transaction_id, tag_id) VALUES
      (v_tx_id, tag_ana_trabajo);

    -- 2) Conversión FX a COP con comisión
    v_tx_id := gen_random_uuid();
    v_rate := 4100 + (random() - 0.5) * 200;
    INSERT INTO transactions (id, user_id, type, occurred_at, description, fx_rate, fx_from_currency, fx_to_currency)
    VALUES (v_tx_id, u_ana, 'transfer_fx',
            (now() - (v_month || ' months')::interval + interval '7 days')::timestamptz,
            'Conversión USD→COP', v_rate, 'USD', 'COP');

    INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code, is_fee) VALUES
      (v_tx_id, 'debit',  'source',      acc_ana_vita_usd, 1200,         'USD', false),
      (v_tx_id, 'credit', 'destination', acc_ana_bancol,   1200 * v_rate,'COP', false),
      (v_tx_id, 'debit',  'fee',         acc_ana_vita_usd, 5,            'USD', true);

    -- 3) Pago renta (cada mes)
    v_tx_id := gen_random_uuid();
    INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description)
    VALUES (v_tx_id, u_ana, 'expense',
            (now() - (v_month || ' months')::interval + interval '3 days')::timestamptz,
            cat_renta, 'Renta apartamento');

    INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
    VALUES (v_tx_id, 'debit', 'source', acc_ana_bancol, 1800000, 'COP');

    -- 4) Pago de servicios (3 servicios por mes)
    v_tx_id := gen_random_uuid();
    INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description)
    VALUES (v_tx_id, u_ana, 'expense',
            (now() - (v_month || ' months')::interval + interval '10 days')::timestamptz,
            cat_internet, 'Claro fibra 200MB');
    INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
    VALUES (v_tx_id, 'debit', 'source', acc_ana_bancol, 89900, 'COP');

    v_tx_id := gen_random_uuid();
    INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description)
    VALUES (v_tx_id, u_ana, 'expense',
            (now() - (v_month || ' months')::interval + interval '12 days')::timestamptz,
            cat_electricidad, 'EPM electricidad');
    INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
    VALUES (v_tx_id, 'debit', 'source', acc_ana_bancol, 95000 + (random() * 50000)::int, 'COP');

    v_tx_id := gen_random_uuid();
    INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description)
    VALUES (v_tx_id, u_ana, 'expense',
            (now() - (v_month || ' months')::interval + interval '15 days')::timestamptz,
            cat_movil, 'Plan Movistar');
    INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
    VALUES (v_tx_id, 'debit', 'source', acc_ana_bancol, 65000, 'COP');

    -- 5) Suscripciones (Netflix, Spotify, GitHub Copilot)
    FOR v_day IN 1..3 LOOP
      v_tx_id := gen_random_uuid();
      INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description) VALUES
        (v_tx_id, u_ana, 'expense',
         (now() - (v_month || ' months')::interval + (v_day * 5 || ' days')::interval)::timestamptz,
         CASE v_day WHEN 1 THEN cat_streaming WHEN 2 THEN cat_streaming ELSE cat_software END,
         CASE v_day WHEN 1 THEN 'Netflix' WHEN 2 THEN 'Spotify Family' ELSE 'GitHub Copilot' END);

      IF v_day = 3 THEN
        -- Copilot va a Vita USD
        INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
        VALUES (v_tx_id, 'debit', 'source', acc_ana_vita_usd, 10, 'USD');
      ELSE
        INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
        VALUES (v_tx_id, 'debit', 'source', acc_ana_visa,
                CASE v_day WHEN 1 THEN 39900 ELSE 26900 END, 'COP');
      END IF;
    END LOOP;

    -- 6) Supermercado (3 visitas al mes, montos variables)
    FOR v_day IN 1..3 LOOP
      v_tx_id := gen_random_uuid();
      v_amount := 80000 + (random() * 250000)::int;
      INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description)
      VALUES (v_tx_id, u_ana, 'expense',
              (now() - (v_month || ' months')::interval + ((v_day * 8 + 2) || ' days')::interval)::timestamptz,
              cat_supermercado,
              CASE (random() * 3)::int WHEN 0 THEN 'Éxito' WHEN 1 THEN 'D1' ELSE 'Carulla' END);
      INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
      VALUES (v_tx_id, 'debit', 'source',
              CASE WHEN random() < 0.3 THEN acc_ana_visa ELSE acc_ana_bancol END,
              v_amount, 'COP');
    END LOOP;

    -- 7) Restaurantes y café (varios pequeños)
    FOR v_day IN 1..6 LOOP
      v_tx_id := gen_random_uuid();
      v_amount := 15000 + (random() * 80000)::int;
      INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description)
      VALUES (v_tx_id, u_ana, 'expense',
              (now() - (v_month || ' months')::interval + ((v_day * 4 + 1) || ' days')::interval)::timestamptz,
              CASE WHEN random() < 0.5 THEN cat_restaurantes ELSE cat_cafe END,
              CASE (random() * 4)::int
                WHEN 0 THEN 'Almuerzo equipo'
                WHEN 1 THEN 'Café trabajo remoto'
                WHEN 2 THEN 'Cena con amiga'
                ELSE 'Brunch'
              END);
      INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
      VALUES (v_tx_id, 'debit', 'source',
              CASE (random() * 3)::int WHEN 0 THEN acc_ana_nequi WHEN 1 THEN acc_ana_efectivo ELSE acc_ana_visa END,
              v_amount, 'COP');
    END LOOP;

    -- 8) Transporte (Uber + transporte público)
    FOR v_day IN 1..5 LOOP
      v_tx_id := gen_random_uuid();
      v_amount := 8000 + (random() * 40000)::int;
      INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description)
      VALUES (v_tx_id, u_ana, 'expense',
              (now() - (v_month || ' months')::interval + ((v_day * 5) || ' days')::interval)::timestamptz,
              CASE WHEN random() < 0.6 THEN cat_uber ELSE cat_pubtransport END,
              CASE WHEN random() < 0.6 THEN 'Uber' ELSE 'Metro Medellín' END);
      INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
      VALUES (v_tx_id, 'debit', 'source',
              CASE WHEN random() < 0.5 THEN acc_ana_nequi ELSE acc_ana_efectivo END,
              v_amount, 'COP');
    END LOOP;

    -- 9) Pago tarjeta de crédito (consolidación mensual)
    v_tx_id := gen_random_uuid();
    INSERT INTO transactions (id, user_id, type, occurred_at, description)
    VALUES (v_tx_id, u_ana, 'transfer_same_currency',
            (now() - (v_month || ' months')::interval + interval '25 days')::timestamptz,
            'Pago Visa');
    INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code) VALUES
      (v_tx_id, 'debit',  'source',      acc_ana_bancol, 800000, 'COP'),
      (v_tx_id, 'credit', 'destination', acc_ana_visa,   800000, 'COP');
  END LOOP;

  -- Reembolso esporádico
  v_tx_id := gen_random_uuid();
  INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description)
  VALUES (v_tx_id, u_ana, 'income', now() - interval '20 days',
          cat_reembolsos, 'Reembolso EPS — consulta médica');
  INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
  VALUES (v_tx_id, 'credit', 'destination', acc_ana_bancol, 145000, 'COP');

  -- Compra de cripto (DCA mensual los últimos 4 meses)
  FOR v_month IN 1..4 LOOP
    v_tx_id := gen_random_uuid();
    v_rate := 62000 + (random() - 0.5) * 4000;
    INSERT INTO transactions (id, user_id, type, occurred_at, description, fx_rate, fx_from_currency, fx_to_currency)
    VALUES (v_tx_id, u_ana, 'crypto_buy',
            (now() - (v_month || ' months')::interval + interval '8 days')::timestamptz,
            'DCA mensual BTC', v_rate, 'USD', 'BTC');
    INSERT INTO transaction_entries (transaction_id, direction, role, account_id, crypto_holding_id, amount, currency_code, is_fee) VALUES
      (v_tx_id, 'debit',  'source',      acc_ana_vita_usd, NULL,       50,         'USD', false),
      (v_tx_id, 'credit', 'destination', NULL,             ch_ana_btc, 50/v_rate, 'BTC', false);
  END LOOP;

  -- Una venta parcial de ETH
  v_tx_id := gen_random_uuid();
  INSERT INTO transactions (id, user_id, type, occurred_at, description, fx_rate, fx_from_currency, fx_to_currency)
  VALUES (v_tx_id, u_ana, 'crypto_sell', now() - interval '15 days',
          'Realización ganancia parcial ETH', 3050, 'ETH', 'USD');
  INSERT INTO transaction_entries (transaction_id, direction, role, account_id, crypto_holding_id, amount, currency_code, is_fee) VALUES
    (v_tx_id, 'debit',  'source',      NULL,             ch_ana_eth, 0.05,  'ETH', false),
    (v_tx_id, 'credit', 'destination', acc_ana_vita_usd, NULL,       152.5, 'USD', false),
    (v_tx_id, 'debit',  'fee',         NULL,             ch_ana_eth, 0.0005,'ETH', true);

  -- Ingreso ETH inicial (compra grande hace 5 meses para que tenga balance positivo)
  v_tx_id := gen_random_uuid();
  INSERT INTO transactions (id, user_id, type, occurred_at, description, fx_rate, fx_from_currency, fx_to_currency)
  VALUES (v_tx_id, u_ana, 'crypto_buy', now() - interval '5 months',
          'Compra inicial ETH', 2800, 'USD', 'ETH');
  INSERT INTO transaction_entries (transaction_id, direction, role, account_id, crypto_holding_id, amount, currency_code, is_fee) VALUES
    (v_tx_id, 'debit',  'source',      acc_ana_vita_usd, NULL,       560,       'USD', false),
    (v_tx_id, 'credit', 'destination', NULL,             ch_ana_eth, 0.2,       'ETH', false);

  -- Una transacción soft-deleted (Ana se equivocó al registrarla)
  v_tx_id := gen_random_uuid();
  INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description, deleted_at)
  VALUES (v_tx_id, u_ana, 'expense', now() - interval '10 days',
          cat_supermercado, 'DUPLICADA - borrar', now() - interval '9 days');
  INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
  VALUES (v_tx_id, 'debit', 'source', acc_ana_bancol, 99999, 'COP');

  -- Vacaciones: viaje a Cartagena (con tag vacaciones)
  v_tx_id := gen_random_uuid();
  INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description)
  VALUES (v_tx_id, u_ana, 'expense', now() - interval '2 months',
          cat_vuelos, 'Vuelo Medellín-Cartagena');
  INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
  VALUES (v_tx_id, 'debit', 'source', acc_ana_visa, 380000, 'COP');
  INSERT INTO transaction_tags (transaction_id, tag_id) VALUES (v_tx_id, tag_ana_vacaciones);

  v_tx_id := gen_random_uuid();
  INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description)
  VALUES (v_tx_id, u_ana, 'expense', now() - interval '2 months' + interval '2 days',
          cat_hospedaje, 'Airbnb Cartagena 4 noches');
  INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
  VALUES (v_tx_id, 'debit', 'source', acc_ana_visa, 720000, 'COP');
  INSERT INTO transaction_tags (transaction_id, tag_id) VALUES (v_tx_id, tag_ana_vacaciones);

  -- Ana pasa fondos al ahorro (transferencia same-currency, sin comisión)
  v_tx_id := gen_random_uuid();
  INSERT INTO transactions (id, user_id, type, occurred_at, description)
  VALUES (v_tx_id, u_ana, 'transfer_same_currency', now() - interval '1 month',
          'Aporte a ahorro mensual');
  INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code) VALUES
    (v_tx_id, 'debit',  'source',      acc_ana_bancol,  500000, 'COP'),
    (v_tx_id, 'credit', 'destination', acc_ana_ahorros, 500000, 'COP');

  -- Curso (categoría custom)
  v_tx_id := gen_random_uuid();
  INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description)
  VALUES (v_tx_id, u_ana, 'expense', now() - interval '3 months',
          cat_ana_curso, 'Mensualidad fotografía');
  INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
  VALUES (v_tx_id, 'debit', 'source', acc_ana_bancol, 280000, 'COP');
  INSERT INTO transaction_tags (transaction_id, tag_id) VALUES (v_tx_id, tag_ana_deducible);

  RAISE NOTICE '  Ana: transacciones creadas';

  -- =========================================================================
  -- CARLOS: ~120 transacciones (salaried, USD)
  -- =========================================================================

  FOR v_month IN 1..6 LOOP
    -- Salario quincenal (2 pagos al mes)
    FOR v_day IN 0..1 LOOP
      v_tx_id := gen_random_uuid();
      INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description)
      VALUES (v_tx_id, u_carlos, 'income',
              (now() - (v_month || ' months')::interval + ((1 + v_day * 15) || ' days')::interval)::timestamptz,
              cat_salario, 'Salary deposit');
      INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
      VALUES (v_tx_id, 'credit', 'destination', acc_car_chase, 3200, 'USD');
    END LOOP;

    -- Renta mensual
    v_tx_id := gen_random_uuid();
    INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description)
    VALUES (v_tx_id, u_carlos, 'expense',
            (now() - (v_month || ' months')::interval + interval '2 days')::timestamptz,
            cat_renta, 'Apartment rent');
    INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
    VALUES (v_tx_id, 'debit', 'source', acc_car_chase, 1850, 'USD');

    -- Servicios
    v_tx_id := gen_random_uuid();
    INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description)
    VALUES (v_tx_id, u_carlos, 'expense',
            (now() - (v_month || ' months')::interval + interval '8 days')::timestamptz,
            cat_internet, 'Verizon Fios');
    INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
    VALUES (v_tx_id, 'debit', 'source', acc_car_chase, 79.99, 'USD');

    v_tx_id := gen_random_uuid();
    INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description)
    VALUES (v_tx_id, u_carlos, 'expense',
            (now() - (v_month || ' months')::interval + interval '11 days')::timestamptz,
            cat_electricidad, 'ConEdison');
    INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
    VALUES (v_tx_id, 'debit', 'source', acc_car_chase, 110 + (random() * 60)::int, 'USD');

    -- Suscripciones
    FOR v_day IN 1..4 LOOP
      v_tx_id := gen_random_uuid();
      INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description) VALUES
        (v_tx_id, u_carlos, 'expense',
         (now() - (v_month || ' months')::interval + (v_day * 5 || ' days')::interval)::timestamptz,
         cat_streaming,
         CASE v_day WHEN 1 THEN 'Netflix' WHEN 2 THEN 'HBO Max' WHEN 3 THEN 'Disney+' ELSE 'Spotify' END);
      INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
      VALUES (v_tx_id, 'debit', 'source', acc_car_amex,
              CASE v_day WHEN 1 THEN 15.99 WHEN 2 THEN 14.99 WHEN 3 THEN 7.99 ELSE 10.99 END, 'USD');
    END LOOP;

    -- Supermercado (varias)
    FOR v_day IN 1..4 LOOP
      v_tx_id := gen_random_uuid();
      v_amount := 60 + (random() * 180)::int;
      INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description)
      VALUES (v_tx_id, u_carlos, 'expense',
              (now() - (v_month || ' months')::interval + ((v_day * 6 + 2) || ' days')::interval)::timestamptz,
              cat_supermercado,
              CASE (random() * 3)::int WHEN 0 THEN 'Whole Foods' WHEN 1 THEN 'Trader Joe''s' ELSE 'Costco' END);
      INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
      VALUES (v_tx_id, 'debit', 'source', acc_car_amex, v_amount, 'USD');
    END LOOP;

    -- Restaurantes
    FOR v_day IN 1..7 LOOP
      v_tx_id := gen_random_uuid();
      v_amount := 12 + (random() * 80)::int;
      INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description)
      VALUES (v_tx_id, u_carlos, 'expense',
              (now() - (v_month || ' months')::interval + ((v_day * 3 + 1) || ' days')::interval)::timestamptz,
              CASE WHEN random() < 0.5 THEN cat_restaurantes ELSE cat_cafe END,
              CASE (random() * 4)::int WHEN 0 THEN 'Lunch' WHEN 1 THEN 'Coffee' WHEN 2 THEN 'Dinner' ELSE 'Takeout' END);
      INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
      VALUES (v_tx_id, 'debit', 'source',
              CASE WHEN random() < 0.7 THEN acc_car_amex ELSE acc_car_chase END,
              v_amount, 'USD');
    END LOOP;

    -- Pago tarjeta crédito mensual
    v_tx_id := gen_random_uuid();
    INSERT INTO transactions (id, user_id, type, occurred_at, description)
    VALUES (v_tx_id, u_carlos, 'transfer_same_currency',
            (now() - (v_month || ' months')::interval + interval '28 days')::timestamptz,
            'Amex payment');
    INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code) VALUES
      (v_tx_id, 'debit',  'source',      acc_car_chase, 1500, 'USD'),
      (v_tx_id, 'credit', 'destination', acc_car_amex,  1500, 'USD');

    -- Aporte a Vanguard mensual
    v_tx_id := gen_random_uuid();
    INSERT INTO transactions (id, user_id, type, occurred_at, description)
    VALUES (v_tx_id, u_carlos, 'transfer_same_currency',
            (now() - (v_month || ' months')::interval + interval '20 days')::timestamptz,
            'Auto-invest Vanguard');
    INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code) VALUES
      (v_tx_id, 'debit',  'source',      acc_car_chase, 800, 'USD'),
      (v_tx_id, 'credit', 'destination', acc_car_inv,   800, 'USD');
  END LOOP;

  -- Dividendos del brokerage (cada trimestre)
  FOR v_month IN 1..2 LOOP
    v_tx_id := gen_random_uuid();
    INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description)
    VALUES (v_tx_id, u_carlos, 'income',
            (now() - ((v_month * 3) || ' months')::interval)::timestamptz,
            cat_dividendos, 'Quarterly VTI dividends');
    INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
    VALUES (v_tx_id, 'credit', 'destination', acc_car_inv, 145 + (random() * 30)::int, 'USD');
  END LOOP;

  -- Bono anual
  v_tx_id := gen_random_uuid();
  INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description)
  VALUES (v_tx_id, u_carlos, 'income', now() - interval '4 months',
          cat_bonos, 'Annual performance bonus');
  INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
  VALUES (v_tx_id, 'credit', 'destination', acc_car_chase, 8500, 'USD');
  INSERT INTO transaction_tags (transaction_id, tag_id) VALUES (v_tx_id, tag_car_business);

  -- Viaje a España (3 meses atrás): Carlos transfiere USD->EUR para usar en CaixaBank
  v_tx_id := gen_random_uuid();
  v_rate := 0.92;
  INSERT INTO transactions (id, user_id, type, occurred_at, description, fx_rate, fx_from_currency, fx_to_currency)
  VALUES (v_tx_id, u_carlos, 'transfer_fx', now() - interval '3 months',
          'Wise USD→EUR para España', v_rate, 'USD', 'EUR');
  INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code, is_fee) VALUES
    (v_tx_id, 'debit',  'source',      acc_car_chase, 2000,           'USD', false),
    (v_tx_id, 'credit', 'destination', acc_car_caixa, 2000 * v_rate,  'EUR', false),
    (v_tx_id, 'debit',  'fee',         acc_car_caixa, 5,              'EUR', true);  -- comisión en EUR (destino)
  INSERT INTO transaction_tags (transaction_id, tag_id) VALUES (v_tx_id, tag_car_family);

  -- Gastos en España
  FOR v_day IN 1..8 LOOP
    v_tx_id := gen_random_uuid();
    v_amount := 25 + (random() * 100)::int;
    INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description)
    VALUES (v_tx_id, u_carlos, 'expense',
            (now() - interval '3 months' + (v_day || ' days')::interval)::timestamptz,
            CASE (random() * 3)::int WHEN 0 THEN cat_restaurantes WHEN 1 THEN cat_hospedaje ELSE cat_supermercado END,
            CASE (random() * 4)::int WHEN 0 THEN 'Tapas Madrid' WHEN 1 THEN 'Hotel Barcelona' WHEN 2 THEN 'Mercadona' ELSE 'Café centro' END);
    INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
    VALUES (v_tx_id, 'debit', 'source', acc_car_caixa, v_amount, 'EUR');
    IF random() < 0.5 THEN
      INSERT INTO transaction_tags (transaction_id, tag_id) VALUES (v_tx_id, tag_car_family);
    END IF;
  END LOOP;

  -- Gimnasio mensual
  FOR v_month IN 1..6 LOOP
    v_tx_id := gen_random_uuid();
    INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description)
    VALUES (v_tx_id, u_carlos, 'expense',
            (now() - (v_month || ' months')::interval + interval '5 days')::timestamptz,
            cat_gimnasio, 'Equinox membership');
    INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
    VALUES (v_tx_id, 'debit', 'source', acc_car_amex, 215, 'USD');
  END LOOP;

  -- Gastos kids (categoría custom)
  FOR v_month IN 1..4 LOOP
    v_tx_id := gen_random_uuid();
    v_amount := 80 + (random() * 200)::int;
    INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description)
    VALUES (v_tx_id, u_carlos, 'expense',
            (now() - (v_month || ' months')::interval + interval '14 days')::timestamptz,
            cat_car_kids,
            CASE (random() * 3)::int WHEN 0 THEN 'School supplies' WHEN 1 THEN 'Soccer practice' ELSE 'Birthday gift' END);
    INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
    VALUES (v_tx_id, 'debit', 'source', acc_car_amex, v_amount, 'USD');
    INSERT INTO transaction_tags (transaction_id, tag_id) VALUES (v_tx_id, tag_car_family);
  END LOOP;

  RAISE NOTICE '  Carlos: transacciones creadas';

  -- =========================================================================
  -- SOFIA: ~150 transacciones (crypto-heavy, ARS primary)
  -- =========================================================================

  FOR v_month IN 1..6 LOOP
    -- Ingresos freelance (variable, ARS)
    v_tx_id := gen_random_uuid();
    v_amount := 800000 + (random() * 1500000)::int;
    INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description)
    VALUES (v_tx_id, u_sofia, 'income',
            (now() - (v_month || ' months')::interval + interval '8 days')::timestamptz,
            cat_freelance, 'Cliente diseño web');
    INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
    VALUES (v_tx_id, 'credit', 'destination', acc_sof_galicia, v_amount, 'ARS');

    -- Sofia compra USDT (refugio de inflación)
    v_tx_id := gen_random_uuid();
    v_rate := 1050 + (random() * 100)::int;
    INSERT INTO transactions (id, user_id, type, occurred_at, description, fx_rate, fx_from_currency, fx_to_currency)
    VALUES (v_tx_id, u_sofia, 'crypto_buy',
            (now() - (v_month || ' months')::interval + interval '12 days')::timestamptz,
            'Compra USDT (refugio inflación)', v_rate, 'ARS', 'USDT');
    INSERT INTO transaction_entries (transaction_id, direction, role, account_id, crypto_holding_id, amount, currency_code, is_fee) VALUES
      (v_tx_id, 'debit',  'source',      acc_sof_galicia, NULL,         500000,            'ARS', false),
      (v_tx_id, 'credit', 'destination', NULL,            ch_sof_usdt, 500000.0/v_rate,   'USDT',false),
      (v_tx_id, 'debit',  'fee',         acc_sof_galicia, NULL,         2500,              'ARS', true);
    INSERT INTO transaction_tags (transaction_id, tag_id) VALUES (v_tx_id, tag_sof_dca);

    -- Renta
    v_tx_id := gen_random_uuid();
    INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description)
    VALUES (v_tx_id, u_sofia, 'expense',
            (now() - (v_month || ' months')::interval + interval '2 days')::timestamptz,
            cat_renta, 'Alquiler departamento Palermo');
    INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
    VALUES (v_tx_id, 'debit', 'source', acc_sof_galicia, 350000, 'ARS');

    -- Servicios (3 al mes)
    v_tx_id := gen_random_uuid();
    INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description)
    VALUES (v_tx_id, u_sofia, 'expense',
            (now() - (v_month || ' months')::interval + interval '6 days')::timestamptz,
            cat_internet, 'Fibertel');
    INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
    VALUES (v_tx_id, 'debit', 'source', acc_sof_galicia, 18000 + (random() * 4000)::int, 'ARS');

    v_tx_id := gen_random_uuid();
    INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description)
    VALUES (v_tx_id, u_sofia, 'expense',
            (now() - (v_month || ' months')::interval + interval '9 days')::timestamptz,
            cat_movil, 'Personal Argentina');
    INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
    VALUES (v_tx_id, 'debit', 'source', acc_sof_galicia, 12000, 'ARS');

    v_tx_id := gen_random_uuid();
    INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description)
    VALUES (v_tx_id, u_sofia, 'expense',
            (now() - (v_month || ' months')::interval + interval '14 days')::timestamptz,
            cat_electricidad, 'Edenor');
    INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
    VALUES (v_tx_id, 'debit', 'source', acc_sof_galicia, 8000 + (random() * 12000)::int, 'ARS');

    -- Suscripciones (Netflix + Spotify)
    v_tx_id := gen_random_uuid();
    INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description)
    VALUES (v_tx_id, u_sofia, 'expense',
            (now() - (v_month || ' months')::interval + interval '5 days')::timestamptz,
            cat_streaming, 'Netflix');
    INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
    VALUES (v_tx_id, 'debit', 'source', acc_sof_uala, 7500, 'ARS');

    v_tx_id := gen_random_uuid();
    INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description)
    VALUES (v_tx_id, u_sofia, 'expense',
            (now() - (v_month || ' months')::interval + interval '7 days')::timestamptz,
            cat_streaming, 'Spotify');
    INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
    VALUES (v_tx_id, 'debit', 'source', acc_sof_uala, 4500, 'ARS');

    -- Supermercado (3 visitas)
    FOR v_day IN 1..3 LOOP
      v_tx_id := gen_random_uuid();
      v_amount := 35000 + (random() * 80000)::int;
      INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description)
      VALUES (v_tx_id, u_sofia, 'expense',
              (now() - (v_month || ' months')::interval + ((v_day * 8 + 3) || ' days')::interval)::timestamptz,
              cat_supermercado,
              CASE (random() * 3)::int WHEN 0 THEN 'Coto' WHEN 1 THEN 'Carrefour' ELSE 'Día' END);
      INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
      VALUES (v_tx_id, 'debit', 'source',
              CASE (random() * 2)::int WHEN 0 THEN acc_sof_uala ELSE acc_sof_galicia END,
              v_amount, 'ARS');
    END LOOP;

    -- Gastos varios (transporte, café, restaurantes) — 8 por mes
    FOR v_day IN 1..8 LOOP
      v_tx_id := gen_random_uuid();
      v_amount := 3000 + (random() * 30000)::int;
      INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description)
      VALUES (v_tx_id, u_sofia, 'expense',
              (now() - (v_month || ' months')::interval + ((v_day * 3 + 1) || ' days')::interval)::timestamptz,
              CASE (random() * 5)::int
                WHEN 0 THEN cat_restaurantes
                WHEN 1 THEN cat_uber
                WHEN 2 THEN cat_cafe
                WHEN 3 THEN cat_delivery
                ELSE cat_pubtransport
              END,
              CASE (random() * 5)::int
                WHEN 0 THEN 'PedidosYa'
                WHEN 1 THEN 'Cabify'
                WHEN 2 THEN 'Café Martínez'
                WHEN 3 THEN 'SUBE'
                ELSE 'Almuerzo'
              END);
      INSERT INTO transaction_entries (transaction_id, direction, role, account_id, amount, currency_code)
      VALUES (v_tx_id, 'debit', 'source',
              CASE (random() * 3)::int WHEN 0 THEN acc_sof_uala WHEN 1 THEN acc_sof_mp ELSE acc_sof_galicia END,
              v_amount, 'ARS');
    END LOOP;
  END LOOP;

  -- Trading activo de Sofia: muchas compras y ventas de cripto
  FOR v_month IN 1..6 LOOP
    -- Compra BTC desde USDT
    v_tx_id := gen_random_uuid();
    v_rate := 62000 + (random() - 0.5) * 5000;
    INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description, fx_rate, fx_from_currency, fx_to_currency)
    VALUES (v_tx_id, u_sofia, 'crypto_buy',
            (now() - (v_month || ' months')::interval + interval '10 days')::timestamptz,
            cat_sof_trading, 'Buy BTC con USDT',
            v_rate, 'USDT', 'BTC');
    INSERT INTO transaction_entries (transaction_id, direction, role, crypto_holding_id, amount, currency_code, is_fee) VALUES
      (v_tx_id, 'debit',  'source',      ch_sof_usdt, 200,            'USDT', false),
      (v_tx_id, 'credit', 'destination', ch_sof_btc,   200.0/v_rate,  'BTC',  false),
      (v_tx_id, 'debit',  'fee',         ch_sof_usdt, 0.2,            'USDT', true);
    INSERT INTO transaction_tags (transaction_id, tag_id) VALUES (v_tx_id, tag_sof_swing);

    -- Venta de BTC parcial
    IF v_month <= 3 THEN
      v_tx_id := gen_random_uuid();
      v_rate := 63000 + (random() * 3000);
      INSERT INTO transactions (id, user_id, type, occurred_at, description, fx_rate, fx_from_currency, fx_to_currency)
      VALUES (v_tx_id, u_sofia, 'crypto_sell',
              (now() - (v_month || ' months')::interval + interval '20 days')::timestamptz,
              'Take profit BTC', v_rate, 'BTC', 'USDT');
      INSERT INTO transaction_entries (transaction_id, direction, role, crypto_holding_id, amount, currency_code, is_fee) VALUES
        (v_tx_id, 'debit',  'source',      ch_sof_btc,   0.001,                'BTC',  false),
        (v_tx_id, 'credit', 'destination', ch_sof_usdt, 0.001 * v_rate,       'USDT', false),
        (v_tx_id, 'debit',  'fee',         ch_sof_btc,   0.000001,             'BTC',  true);
      INSERT INTO transaction_tags (transaction_id, tag_id) VALUES (v_tx_id, tag_sof_swing);
    END IF;
  END LOOP;

  -- Compra inicial grande de Sofia: BTC, ETH, SOL hace 6 meses
  v_tx_id := gen_random_uuid();
  INSERT INTO transactions (id, user_id, type, occurred_at, description, fx_rate, fx_from_currency, fx_to_currency)
  VALUES (v_tx_id, u_sofia, 'crypto_buy', now() - interval '6 months',
          'Compra inicial BTC', 58000, 'USDT', 'BTC');
  INSERT INTO transaction_entries (transaction_id, direction, role, crypto_holding_id, amount, currency_code, is_fee) VALUES
    (v_tx_id, 'debit',  'source',      ch_sof_usdt, 1500,           'USDT', false),
    (v_tx_id, 'credit', 'destination', ch_sof_btc,   1500.0/58000.0, 'BTC',  false);

  v_tx_id := gen_random_uuid();
  INSERT INTO transactions (id, user_id, type, occurred_at, description, fx_rate, fx_from_currency, fx_to_currency)
  VALUES (v_tx_id, u_sofia, 'crypto_buy', now() - interval '5 months',
          'Compra ETH', 2900, 'USDT', 'ETH');
  INSERT INTO transaction_entries (transaction_id, direction, role, crypto_holding_id, amount, currency_code, is_fee) VALUES
    (v_tx_id, 'debit',  'source',      ch_sof_usdt, 1000,           'USDT', false),
    (v_tx_id, 'credit', 'destination', ch_sof_eth,   1000.0/2900.0,  'ETH',  false);

  v_tx_id := gen_random_uuid();
  INSERT INTO transactions (id, user_id, type, occurred_at, description, fx_rate, fx_from_currency, fx_to_currency)
  VALUES (v_tx_id, u_sofia, 'crypto_buy', now() - interval '4 months',
          'Compra SOL', 130, 'USDT', 'SOL');
  INSERT INTO transaction_entries (transaction_id, direction, role, crypto_holding_id, amount, currency_code, is_fee) VALUES
    (v_tx_id, 'debit',  'source',      ch_sof_usdt, 500,            'USDT', false),
    (v_tx_id, 'credit', 'destination', ch_sof_sol,   500.0/130.0,    'SOL',  false);

  v_tx_id := gen_random_uuid();
  INSERT INTO transactions (id, user_id, type, occurred_at, description, fx_rate, fx_from_currency, fx_to_currency)
  VALUES (v_tx_id, u_sofia, 'crypto_buy', now() - interval '4 months',
          'Compra ADA', 0.42, 'USDT', 'ADA');
  INSERT INTO transaction_entries (transaction_id, direction, role, crypto_holding_id, amount, currency_code, is_fee) VALUES
    (v_tx_id, 'debit',  'source',      ch_sof_usdt, 200,            'USDT', false),
    (v_tx_id, 'credit', 'destination', ch_sof_ada,   200.0/0.42,     'ADA',  false);

  v_tx_id := gen_random_uuid();
  INSERT INTO transactions (id, user_id, type, occurred_at, description, fx_rate, fx_from_currency, fx_to_currency)
  VALUES (v_tx_id, u_sofia, 'crypto_buy', now() - interval '3 months',
          'Compra MATIC', 0.75, 'USDT', 'MATIC');
  INSERT INTO transaction_entries (transaction_id, direction, role, crypto_holding_id, amount, currency_code, is_fee) VALUES
    (v_tx_id, 'debit',  'source',      ch_sof_usdt, 150,            'USDT', false),
    (v_tx_id, 'credit', 'destination', ch_sof_matic, 150.0/0.75,     'MATIC',false);

  -- Staking rewards (ingresos cripto pequeños)
  FOR v_month IN 1..3 LOOP
    v_tx_id := gen_random_uuid();
    INSERT INTO transactions (id, user_id, type, occurred_at, category_id, description, fx_rate, fx_from_currency, fx_to_currency)
    VALUES (v_tx_id, u_sofia, 'income',
            (now() - (v_month || ' months')::interval + interval '15 days')::timestamptz,
            cat_staking, 'Staking ADA rewards',
            NULL, NULL, NULL);
    INSERT INTO transaction_entries (transaction_id, direction, role, crypto_holding_id, amount, currency_code)
    VALUES (v_tx_id, 'credit', 'destination', ch_sof_ada, 5 + random() * 3, 'ADA');
  END LOOP;

  RAISE NOTICE '  Sofia: transacciones creadas';

  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE 'Seed completo:';
  RAISE NOTICE '  Usuario 1: ana@example.com (COP)';
  RAISE NOTICE '  Usuario 2: carlos@example.com (USD)';
  RAISE NOTICE '  Usuario 3: sofia@example.com (ARS)';
  RAISE NOTICE '  Password todos: testpassword123';
  RAISE NOTICE '----------------------------------------';
END
$$;
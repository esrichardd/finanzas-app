-- =============================================================================
-- 20260425000010 — Seeds de catálogos (datos compartidos)
-- =============================================================================
-- Datos que toda instalación necesita: monedas comunes, criptos principales,
-- tipos de cuenta, países base, categorías de sistema.
--
-- IMPORTANTE: estos seeds van como migración (no como seed.sql) porque deben
-- aplicarse en producción también. Los datos de prueba (usuarios fake,
-- transacciones de ejemplo) van en supabase/seed.sql para entornos locales.
-- =============================================================================

-- Monedas fiat
INSERT INTO currencies (code, name, symbol, decimals, is_crypto) VALUES
  ('COP', 'Peso colombiano',     '$',   2, false),
  ('USD', 'Dólar estadounidense','$',   2, false),
  ('EUR', 'Euro',                '€',   2, false),
  ('MXN', 'Peso mexicano',       '$',   2, false),
  ('BRL', 'Real brasileño',      'R$',  2, false),
  ('ARS', 'Peso argentino',      '$',   2, false),
  ('CLP', 'Peso chileno',        '$',   0, false),
  ('PEN', 'Sol peruano',         'S/',  2, false),
  ('GBP', 'Libra esterlina',     '£',   2, false)
ON CONFLICT DO NOTHING;

-- Activos cripto
INSERT INTO crypto_assets (symbol, name, decimals, coingecko_id) VALUES
  ('BTC',  'Bitcoin',     8,  'bitcoin'),
  ('ETH',  'Ethereum',    18, 'ethereum'),
  ('SOL',  'Solana',      9,  'solana'),
  ('USDT', 'Tether',      6,  'tether'),
  ('USDC', 'USD Coin',    6,  'usd-coin'),
  ('BNB',  'BNB',         18, 'binancecoin')
ON CONFLICT DO NOTHING;

-- Cripto también en currencies (con is_crypto=true) para FK única en
-- transaction_entries.currency_code sin importar el tipo de target.
INSERT INTO currencies (code, name, symbol, decimals, is_crypto) VALUES
  ('BTC',  'Bitcoin',  '₿',   8,  true),
  ('ETH',  'Ethereum', 'Ξ',   18, true),
  ('SOL',  'Solana',   'SOL', 9,  true),
  ('USDT', 'Tether',   '₮',   6,  true),
  ('USDC', 'USD Coin', '$',   6,  true),
  ('BNB',  'BNB',      'BNB', 18, true)
ON CONFLICT DO NOTHING;

-- Tipos de cuenta
INSERT INTO account_types (code, name_es, name_en, is_credit) VALUES
  ('bank_account',   'Cuenta bancaria',  'Bank account',    false),
  ('digital_wallet', 'Billetera digital','Digital wallet',  false),
  ('cash',           'Efectivo',         'Cash',            false),
  ('credit_card',    'Tarjeta crédito',  'Credit card',     true),
  ('savings',        'Cuenta ahorro',    'Savings account', false),
  ('investment',     'Inversión',        'Investment',      false)
ON CONFLICT DO NOTHING;

-- Países base (en producción, cargar ISO 3166-1 completo)
INSERT INTO countries (code, name_es, name_en) VALUES
  ('CO', 'Colombia',       'Colombia'),
  ('US', 'Estados Unidos', 'United States'),
  ('MX', 'México',         'Mexico'),
  ('ES', 'España',         'Spain'),
  ('AR', 'Argentina',      'Argentina'),
  ('CL', 'Chile',          'Chile'),
  ('PE', 'Perú',           'Peru'),
  ('BR', 'Brasil',         'Brazil')
ON CONFLICT DO NOTHING;

-- Categorías de sistema (raíces). Subcategorías se agregan después.
INSERT INTO categories (id, user_id, parent_id, name, icon, kind, is_system, sort_order) VALUES
  -- Ingreso
  (gen_random_uuid(), NULL, NULL, 'Salario',             'briefcase',      'income',  true, 10),
  (gen_random_uuid(), NULL, NULL, 'Freelance',           'laptop',         'income',  true, 20),
  (gen_random_uuid(), NULL, NULL, 'Inversiones',         'trending-up',    'income',  true, 30),
  (gen_random_uuid(), NULL, NULL, 'Reembolsos',          'rotate-ccw',     'income',  true, 40),
  (gen_random_uuid(), NULL, NULL, 'Otros ingresos',      'plus-circle',    'income',  true, 90),
  -- Gasto
  (gen_random_uuid(), NULL, NULL, 'Alimentación',        'shopping-cart',  'expense', true, 10),
  (gen_random_uuid(), NULL, NULL, 'Transporte',          'car',            'expense', true, 20),
  (gen_random_uuid(), NULL, NULL, 'Vivienda',            'home',           'expense', true, 30),
  (gen_random_uuid(), NULL, NULL, 'Servicios',           'zap',            'expense', true, 40),
  (gen_random_uuid(), NULL, NULL, 'Salud',               'heart',          'expense', true, 50),
  (gen_random_uuid(), NULL, NULL, 'Entretenimiento',     'film',           'expense', true, 60),
  (gen_random_uuid(), NULL, NULL, 'Educación',           'book',           'expense', true, 70),
  (gen_random_uuid(), NULL, NULL, 'Suscripciones',       'repeat',         'expense', true, 80),
  (gen_random_uuid(), NULL, NULL, 'Comisiones bancarias','credit-card',    'expense', true, 85),
  (gen_random_uuid(), NULL, NULL, 'Otros gastos',        'more-horizontal','expense', true, 90)
ON CONFLICT DO NOTHING;

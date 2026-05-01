-- =============================================================================
-- 20260425000010 — Seeds de catálogos (datos compartidos)
-- =============================================================================
-- Datos de catálogo que toda instalación necesita en cualquier entorno.
-- Estos van como migración (no como seed.sql) porque también deben aplicarse
-- en producción.
-- =============================================================================

-- =============================================================================
-- Países: LATAM + USA + España + un par adicionales por completitud
-- =============================================================================

INSERT INTO countries (code, name_es, name_en, phone_prefix) VALUES
  -- LATAM
  ('AR', 'Argentina',           'Argentina',           '+54'),
  ('BO', 'Bolivia',              'Bolivia',             '+591'),
  ('BR', 'Brasil',               'Brazil',              '+55'),
  ('CL', 'Chile',                'Chile',               '+56'),
  ('CO', 'Colombia',             'Colombia',            '+57'),
  ('CR', 'Costa Rica',           'Costa Rica',          '+506'),
  ('CU', 'Cuba',                 'Cuba',                '+53'),
  ('DO', 'República Dominicana', 'Dominican Republic',  '+1809'),
  ('EC', 'Ecuador',              'Ecuador',             '+593'),
  ('SV', 'El Salvador',          'El Salvador',         '+503'),
  ('GT', 'Guatemala',            'Guatemala',           '+502'),
  ('HN', 'Honduras',             'Honduras',            '+504'),
  ('MX', 'México',               'Mexico',              '+52'),
  ('NI', 'Nicaragua',            'Nicaragua',           '+505'),
  ('PA', 'Panamá',               'Panama',              '+507'),
  ('PY', 'Paraguay',             'Paraguay',            '+595'),
  ('PE', 'Perú',                 'Peru',                '+51'),
  ('PR', 'Puerto Rico',          'Puerto Rico',         '+1787'),
  ('UY', 'Uruguay',              'Uruguay',             '+598'),
  ('VE', 'Venezuela',            'Venezuela',           '+58'),
  -- Norteamérica + España
  ('US', 'Estados Unidos',       'United States',       '+1'),
  ('CA', 'Canadá',               'Canada',              '+1'),
  ('ES', 'España',               'Spain',               '+34')
ON CONFLICT DO NOTHING;


-- =============================================================================
-- Monedas: ISO 4217 mainstream + cripto principales
-- =============================================================================

-- Fiat
INSERT INTO currencies (code, name, symbol, decimals, is_crypto) VALUES
  -- LATAM
  ('COP', 'Peso colombiano',           '$',     2, false),
  ('MXN', 'Peso mexicano',             '$',     2, false),
  ('BRL', 'Real brasileño',            'R$',    2, false),
  ('ARS', 'Peso argentino',            '$',     2, false),
  ('CLP', 'Peso chileno',              '$',     0, false),
  ('PEN', 'Sol peruano',               'S/',    2, false),
  ('UYU', 'Peso uruguayo',             '$U',    2, false),
  ('PYG', 'Guaraní paraguayo',         '₲',     0, false),
  ('BOB', 'Boliviano',                 'Bs',    2, false),
  ('VES', 'Bolívar venezolano',        'Bs.S',  2, false),
  ('DOP', 'Peso dominicano',           'RD$',   2, false),
  ('CRC', 'Colón costarricense',       '₡',     2, false),
  ('GTQ', 'Quetzal guatemalteco',      'Q',     2, false),
  ('PAB', 'Balboa panameño',           'B/.',   2, false),
  -- Mainstream globales
  ('USD', 'Dólar estadounidense',      '$',     2, false),
  ('EUR', 'Euro',                      '€',     2, false),
  ('GBP', 'Libra esterlina',           '£',     2, false),
  ('CAD', 'Dólar canadiense',          'C$',    2, false),
  ('JPY', 'Yen japonés',               '¥',     0, false),
  ('CHF', 'Franco suizo',              'Fr',    2, false),
  ('AUD', 'Dólar australiano',         'A$',    2, false),
  ('CNY', 'Yuan chino',                '¥',     2, false)
ON CONFLICT DO NOTHING;

-- Cripto (también van en currencies para FK uniforme en transaction_entries)
INSERT INTO currencies (code, name, symbol, decimals, is_crypto) VALUES
  ('BTC',   'Bitcoin',     '₿',    8,  true),
  ('ETH',   'Ethereum',    'Ξ',    18, true),
  ('SOL',   'Solana',      'SOL',  9,  true),
  ('USDT',  'Tether',      '₮',    6,  true),
  ('USDC',  'USD Coin',    '$',    6,  true),
  ('BNB',   'BNB',         'BNB',  18, true),
  ('ADA',   'Cardano',     '₳',    6,  true),
  ('MATIC', 'Polygon',     'MATIC',18, true),
  ('AVAX',  'Avalanche',   'AVAX', 18, true),
  ('DOGE',  'Dogecoin',    'Ð',    8,  true),
  ('DOT',   'Polkadot',    'DOT',  10, true),
  ('LINK',  'Chainlink',   'LINK', 18, true),
  ('XRP',   'XRP',         'XRP',  6,  true),
  ('LTC',   'Litecoin',    'Ł',    8,  true)
ON CONFLICT DO NOTHING;


-- =============================================================================
-- Crypto assets (tabla específica con coingecko_id para fetch de precios)
-- =============================================================================

INSERT INTO crypto_assets (symbol, name, decimals, coingecko_id) VALUES
  ('BTC',   'Bitcoin',     8,  'bitcoin'),
  ('ETH',   'Ethereum',    18, 'ethereum'),
  ('SOL',   'Solana',      9,  'solana'),
  ('USDT',  'Tether',      6,  'tether'),
  ('USDC',  'USD Coin',    6,  'usd-coin'),
  ('BNB',   'BNB',         18, 'binancecoin'),
  ('ADA',   'Cardano',     6,  'cardano'),
  ('MATIC', 'Polygon',     18, 'matic-network'),
  ('AVAX',  'Avalanche',   18, 'avalanche-2'),
  ('DOGE',  'Dogecoin',    8,  'dogecoin'),
  ('DOT',   'Polkadot',    10, 'polkadot'),
  ('LINK',  'Chainlink',   18, 'chainlink'),
  ('XRP',   'XRP',         6,  'ripple'),
  ('LTC',   'Litecoin',    8,  'litecoin')
ON CONFLICT DO NOTHING;


-- =============================================================================
-- Tipos de cuenta
-- =============================================================================

INSERT INTO account_types (code, name_es, name_en, is_credit) VALUES
  ('bank_account',     'Cuenta bancaria',       'Bank account',       false),
  ('digital_wallet',   'Billetera digital',     'Digital wallet',     false),
  ('cash',             'Efectivo',              'Cash',               false),
  ('credit_card',      'Tarjeta de crédito',    'Credit card',        true),
  ('savings',          'Cuenta de ahorro',      'Savings account',    false),
  ('investment',       'Inversión',             'Investment',         false),
  ('brokerage',        'Cuenta de corretaje',   'Brokerage account',  false),
  ('prepaid_card',     'Tarjeta prepagada',     'Prepaid card',       false),
  ('crypto_exchange',  'Exchange de cripto',    'Crypto exchange',    false),
  ('loan',             'Préstamo',              'Loan',               true)
ON CONFLICT DO NOTHING;


-- =============================================================================
-- Ocupaciones (~30 comunes)
-- =============================================================================

INSERT INTO occupations (id, name_es, name_en) VALUES
  (gen_random_uuid(), 'Desarrollador de software',     'Software developer'),
  (gen_random_uuid(), 'Diseñador',                     'Designer'),
  (gen_random_uuid(), 'Product Manager',               'Product manager'),
  (gen_random_uuid(), 'Marketing',                     'Marketing'),
  (gen_random_uuid(), 'Ventas',                        'Sales'),
  (gen_random_uuid(), 'Contador',                      'Accountant'),
  (gen_random_uuid(), 'Abogado',                       'Lawyer'),
  (gen_random_uuid(), 'Médico',                        'Physician'),
  (gen_random_uuid(), 'Enfermería',                    'Nursing'),
  (gen_random_uuid(), 'Profesor / Docente',            'Teacher / Professor'),
  (gen_random_uuid(), 'Ingeniero civil',               'Civil engineer'),
  (gen_random_uuid(), 'Ingeniero industrial',          'Industrial engineer'),
  (gen_random_uuid(), 'Ingeniero mecánico',            'Mechanical engineer'),
  (gen_random_uuid(), 'Arquitecto',                    'Architect'),
  (gen_random_uuid(), 'Consultor',                     'Consultant'),
  (gen_random_uuid(), 'Emprendedor',                   'Entrepreneur'),
  (gen_random_uuid(), 'Estudiante',                    'Student'),
  (gen_random_uuid(), 'Psicólogo',                     'Psychologist'),
  (gen_random_uuid(), 'Periodista',                    'Journalist'),
  (gen_random_uuid(), 'Chef / Cocinero',               'Chef / Cook'),
  (gen_random_uuid(), 'Artista / Creativo',            'Artist / Creative'),
  (gen_random_uuid(), 'Atención al cliente',           'Customer support'),
  (gen_random_uuid(), 'Recursos humanos',              'Human resources'),
  (gen_random_uuid(), 'Administrador de empresas',     'Business administrator'),
  (gen_random_uuid(), 'Analista financiero',           'Financial analyst'),
  (gen_random_uuid(), 'Investigador',                  'Researcher'),
  (gen_random_uuid(), 'Operario / Técnico',            'Technician'),
  (gen_random_uuid(), 'Trabajador de la construcción', 'Construction worker'),
  (gen_random_uuid(), 'Conductor',                     'Driver'),
  (gen_random_uuid(), 'Otro',                          'Other')
ON CONFLICT DO NOTHING;


-- =============================================================================
-- Instituciones financieras (bancos reales por país)
-- =============================================================================

INSERT INTO financial_institutions (id, name, country_code) VALUES
  -- Colombia
  (gen_random_uuid(), 'Bancolombia',           'CO'),
  (gen_random_uuid(), 'Davivienda',            'CO'),
  (gen_random_uuid(), 'BBVA Colombia',         'CO'),
  (gen_random_uuid(), 'Banco de Bogotá',       'CO'),
  (gen_random_uuid(), 'Nequi',                 'CO'),
  (gen_random_uuid(), 'Daviplata',             'CO'),
  (gen_random_uuid(), 'Lulo Bank',             'CO'),
  (gen_random_uuid(), 'Vita Wallet',           'CO'),
  (gen_random_uuid(), 'Littio',                'CO'),
  -- México
  (gen_random_uuid(), 'BBVA México',           'MX'),
  (gen_random_uuid(), 'Banorte',               'MX'),
  (gen_random_uuid(), 'Santander México',      'MX'),
  (gen_random_uuid(), 'Nu México',             'MX'),
  (gen_random_uuid(), 'Mercado Pago',          'MX'),
  -- Argentina
  (gen_random_uuid(), 'Banco Santander',       'AR'),
  (gen_random_uuid(), 'Galicia',               'AR'),
  (gen_random_uuid(), 'Mercado Pago',          'AR'),
  (gen_random_uuid(), 'Brubank',               'AR'),
  (gen_random_uuid(), 'Ualá',                  'AR'),
  -- Brasil
  (gen_random_uuid(), 'Itaú',                  'BR'),
  (gen_random_uuid(), 'Bradesco',              'BR'),
  (gen_random_uuid(), 'Nubank',                'BR'),
  (gen_random_uuid(), 'Banco do Brasil',       'BR'),
  (gen_random_uuid(), 'C6 Bank',               'BR'),
  -- Chile
  (gen_random_uuid(), 'Banco de Chile',        'CL'),
  (gen_random_uuid(), 'BCI',                   'CL'),
  (gen_random_uuid(), 'Mach',                  'CL'),
  -- Perú
  (gen_random_uuid(), 'BCP',                   'PE'),
  (gen_random_uuid(), 'Interbank',             'PE'),
  (gen_random_uuid(), 'Yape',                  'PE'),
  (gen_random_uuid(), 'Plin',                  'PE'),
  -- USA
  (gen_random_uuid(), 'Chase',                 'US'),
  (gen_random_uuid(), 'Bank of America',       'US'),
  (gen_random_uuid(), 'Wells Fargo',           'US'),
  (gen_random_uuid(), 'Capital One',           'US'),
  (gen_random_uuid(), 'PayPal',                'US'),
  (gen_random_uuid(), 'Venmo',                 'US'),
  (gen_random_uuid(), 'Cash App',              'US'),
  (gen_random_uuid(), 'Wise',                  'US'),
  (gen_random_uuid(), 'Revolut',               'US'),
  -- España
  (gen_random_uuid(), 'BBVA España',           'ES'),
  (gen_random_uuid(), 'Santander España',      'ES'),
  (gen_random_uuid(), 'CaixaBank',             'ES'),
  (gen_random_uuid(), 'ING España',            'ES'),
  (gen_random_uuid(), 'N26',                   'ES'),
  (gen_random_uuid(), 'Bizum',                 'ES'),
  -- Crypto exchanges (multi-país, los marco como US por convención)
  (gen_random_uuid(), 'Binance',               'US'),
  (gen_random_uuid(), 'Coinbase',              'US'),
  (gen_random_uuid(), 'Kraken',                'US'),
  (gen_random_uuid(), 'Bitso',                 'MX')
ON CONFLICT DO NOTHING;


-- =============================================================================
-- Categorías de sistema: jerárquicas (raíces + subcategorías)
-- =============================================================================
-- Estrategia: insertar raíces con UUIDs determinísticos vía CTE para luego
-- referenciarlos en subcategorías.

DO $$
DECLARE
  -- Ingreso (raíces)
  c_salario       uuid := gen_random_uuid();
  c_freelance     uuid := gen_random_uuid();
  c_inversiones   uuid := gen_random_uuid();
  c_reembolsos    uuid := gen_random_uuid();
  c_regalos_in    uuid := gen_random_uuid();
  c_renta_in      uuid := gen_random_uuid();
  c_bonos         uuid := gen_random_uuid();
  c_otros_in      uuid := gen_random_uuid();
  -- Gasto (raíces)
  c_alimentacion  uuid := gen_random_uuid();
  c_transporte    uuid := gen_random_uuid();
  c_vivienda      uuid := gen_random_uuid();
  c_servicios     uuid := gen_random_uuid();
  c_salud         uuid := gen_random_uuid();
  c_entretenim    uuid := gen_random_uuid();
  c_educacion     uuid := gen_random_uuid();
  c_suscripciones uuid := gen_random_uuid();
  c_comisiones    uuid := gen_random_uuid();
  c_compras       uuid := gen_random_uuid();
  c_viajes        uuid := gen_random_uuid();
  c_impuestos     uuid := gen_random_uuid();
  c_mascotas      uuid := gen_random_uuid();
  c_regalos_out   uuid := gen_random_uuid();
  c_otros_out     uuid := gen_random_uuid();
BEGIN
  -- Ingreso raíces
  INSERT INTO categories (id, user_id, parent_id, name, icon, kind, is_system, sort_order) VALUES
    (c_salario,     NULL, NULL, 'Salario',          'briefcase',     'income', true, 10),
    (c_freelance,   NULL, NULL, 'Freelance',        'laptop',        'income', true, 20),
    (c_inversiones, NULL, NULL, 'Inversiones',      'trending-up',   'income', true, 30),
    (c_reembolsos,  NULL, NULL, 'Reembolsos',       'rotate-ccw',    'income', true, 40),
    (c_regalos_in,  NULL, NULL, 'Regalos recibidos','gift',          'income', true, 50),
    (c_renta_in,    NULL, NULL, 'Alquiler/Renta',   'home',          'income', true, 60),
    (c_bonos,       NULL, NULL, 'Bonos',            'award',         'income', true, 70),
    (c_otros_in,    NULL, NULL, 'Otros ingresos',   'plus-circle',   'income', true, 90);

  -- Subcategorías de inversiones
  INSERT INTO categories (id, user_id, parent_id, name, icon, kind, is_system, sort_order) VALUES
    (gen_random_uuid(), NULL, c_inversiones, 'Dividendos',         'percent',     'income', true, 10),
    (gen_random_uuid(), NULL, c_inversiones, 'Intereses',          'trending-up', 'income', true, 20),
    (gen_random_uuid(), NULL, c_inversiones, 'Venta de activos',   'dollar-sign', 'income', true, 30),
    (gen_random_uuid(), NULL, c_inversiones, 'Staking / Yield',    'lock',        'income', true, 40);

  -- Gasto raíces
  INSERT INTO categories (id, user_id, parent_id, name, icon, kind, is_system, sort_order) VALUES
    (c_alimentacion,  NULL, NULL, 'Alimentación',         'shopping-cart',  'expense', true, 10),
    (c_transporte,    NULL, NULL, 'Transporte',           'car',            'expense', true, 20),
    (c_vivienda,      NULL, NULL, 'Vivienda',             'home',           'expense', true, 30),
    (c_servicios,     NULL, NULL, 'Servicios',            'zap',            'expense', true, 40),
    (c_salud,         NULL, NULL, 'Salud',                'heart',          'expense', true, 50),
    (c_entretenim,    NULL, NULL, 'Entretenimiento',      'film',           'expense', true, 60),
    (c_educacion,     NULL, NULL, 'Educación',            'book',           'expense', true, 70),
    (c_suscripciones, NULL, NULL, 'Suscripciones',        'repeat',         'expense', true, 80),
    (c_comisiones,    NULL, NULL, 'Comisiones bancarias', 'credit-card',    'expense', true, 85),
    (c_compras,       NULL, NULL, 'Compras',              'shopping-bag',   'expense', true, 90),
    (c_viajes,        NULL, NULL, 'Viajes',               'plane',          'expense', true, 95),
    (c_impuestos,     NULL, NULL, 'Impuestos',            'file-text',      'expense', true, 100),
    (c_mascotas,      NULL, NULL, 'Mascotas',             'github',         'expense', true, 110),
    (c_regalos_out,   NULL, NULL, 'Regalos dados',        'gift',           'expense', true, 120),
    (c_otros_out,     NULL, NULL, 'Otros gastos',         'more-horizontal','expense', true, 200);

  -- Subcategorías de Alimentación
  INSERT INTO categories (id, user_id, parent_id, name, icon, kind, is_system, sort_order) VALUES
    (gen_random_uuid(), NULL, c_alimentacion, 'Supermercado',     'shopping-cart',  'expense', true, 10),
    (gen_random_uuid(), NULL, c_alimentacion, 'Restaurantes',     'utensils',       'expense', true, 20),
    (gen_random_uuid(), NULL, c_alimentacion, 'Café',             'coffee',         'expense', true, 30),
    (gen_random_uuid(), NULL, c_alimentacion, 'Comida a domicilio','truck',         'expense', true, 40),
    (gen_random_uuid(), NULL, c_alimentacion, 'Bares / Alcohol',  'wine',           'expense', true, 50);

  -- Subcategorías de Transporte
  INSERT INTO categories (id, user_id, parent_id, name, icon, kind, is_system, sort_order) VALUES
    (gen_random_uuid(), NULL, c_transporte, 'Uber / Taxi',         'car',           'expense', true, 10),
    (gen_random_uuid(), NULL, c_transporte, 'Gasolina',            'fuel',          'expense', true, 20),
    (gen_random_uuid(), NULL, c_transporte, 'Transporte público',  'bus',           'expense', true, 30),
    (gen_random_uuid(), NULL, c_transporte, 'Estacionamiento',     'parking-meter', 'expense', true, 40),
    (gen_random_uuid(), NULL, c_transporte, 'Mantenimiento auto',  'wrench',        'expense', true, 50);

  -- Subcategorías de Vivienda
  INSERT INTO categories (id, user_id, parent_id, name, icon, kind, is_system, sort_order) VALUES
    (gen_random_uuid(), NULL, c_vivienda, 'Renta / Hipoteca',   'home',          'expense', true, 10),
    (gen_random_uuid(), NULL, c_vivienda, 'Administración',     'key',           'expense', true, 20),
    (gen_random_uuid(), NULL, c_vivienda, 'Mantenimiento',      'tool',          'expense', true, 30),
    (gen_random_uuid(), NULL, c_vivienda, 'Mudanza',            'truck',         'expense', true, 40);

  -- Subcategorías de Servicios
  INSERT INTO categories (id, user_id, parent_id, name, icon, kind, is_system, sort_order) VALUES
    (gen_random_uuid(), NULL, c_servicios, 'Electricidad',  'zap',         'expense', true, 10),
    (gen_random_uuid(), NULL, c_servicios, 'Agua',          'droplet',     'expense', true, 20),
    (gen_random_uuid(), NULL, c_servicios, 'Gas',           'flame',       'expense', true, 30),
    (gen_random_uuid(), NULL, c_servicios, 'Internet',      'wifi',        'expense', true, 40),
    (gen_random_uuid(), NULL, c_servicios, 'Móvil',         'smartphone',  'expense', true, 50);

  -- Subcategorías de Salud
  INSERT INTO categories (id, user_id, parent_id, name, icon, kind, is_system, sort_order) VALUES
    (gen_random_uuid(), NULL, c_salud, 'Médico',         'stethoscope',  'expense', true, 10),
    (gen_random_uuid(), NULL, c_salud, 'Farmacia',       'pill',         'expense', true, 20),
    (gen_random_uuid(), NULL, c_salud, 'Seguro de salud','shield',       'expense', true, 30),
    (gen_random_uuid(), NULL, c_salud, 'Gimnasio',       'dumbbell',     'expense', true, 40),
    (gen_random_uuid(), NULL, c_salud, 'Terapia',        'heart',        'expense', true, 50);

  -- Subcategorías de Entretenimiento
  INSERT INTO categories (id, user_id, parent_id, name, icon, kind, is_system, sort_order) VALUES
    (gen_random_uuid(), NULL, c_entretenim, 'Cine / Teatro',  'film',     'expense', true, 10),
    (gen_random_uuid(), NULL, c_entretenim, 'Conciertos',     'music',    'expense', true, 20),
    (gen_random_uuid(), NULL, c_entretenim, 'Videojuegos',    'gamepad-2','expense', true, 30),
    (gen_random_uuid(), NULL, c_entretenim, 'Hobbies',        'palette',  'expense', true, 40);

  -- Subcategorías de Suscripciones
  INSERT INTO categories (id, user_id, parent_id, name, icon, kind, is_system, sort_order) VALUES
    (gen_random_uuid(), NULL, c_suscripciones, 'Streaming',    'tv',           'expense', true, 10),
    (gen_random_uuid(), NULL, c_suscripciones, 'Software',     'monitor',      'expense', true, 20),
    (gen_random_uuid(), NULL, c_suscripciones, 'Música',       'headphones',   'expense', true, 30),
    (gen_random_uuid(), NULL, c_suscripciones, 'Cloud',        'cloud',        'expense', true, 40);

  -- Subcategorías de Compras
  INSERT INTO categories (id, user_id, parent_id, name, icon, kind, is_system, sort_order) VALUES
    (gen_random_uuid(), NULL, c_compras, 'Ropa',          'shirt',         'expense', true, 10),
    (gen_random_uuid(), NULL, c_compras, 'Electrónica',   'smartphone',    'expense', true, 20),
    (gen_random_uuid(), NULL, c_compras, 'Hogar',         'home',          'expense', true, 30),
    (gen_random_uuid(), NULL, c_compras, 'Belleza',       'sparkles',      'expense', true, 40);

  -- Subcategorías de Viajes
  INSERT INTO categories (id, user_id, parent_id, name, icon, kind, is_system, sort_order) VALUES
    (gen_random_uuid(), NULL, c_viajes, 'Vuelos',        'plane',          'expense', true, 10),
    (gen_random_uuid(), NULL, c_viajes, 'Hospedaje',     'bed',            'expense', true, 20),
    (gen_random_uuid(), NULL, c_viajes, 'Comida viaje',  'utensils',       'expense', true, 30),
    (gen_random_uuid(), NULL, c_viajes, 'Actividades',   'map',            'expense', true, 40);
END
$$;
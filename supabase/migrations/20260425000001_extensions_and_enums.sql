-- =============================================================================
-- 20260425000001 — Extensiones y tipos ENUM
-- =============================================================================
-- Define los tipos enumerados usados en todo el schema. Va primero porque
-- el resto de tablas dependen de estos tipos.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Género del usuario
CREATE TYPE gender AS ENUM (
  'male', 'female', 'non_binary', 'other', 'prefer_not_to_say'
);

-- Tipo de contrato laboral
CREATE TYPE contract_type AS ENUM (
  'freelance', 'permanent', 'temporary', 'internship',
  'self_employed', 'business_owner', 'unemployed', 'student', 'retired'
);

-- Tema visual de la app
CREATE TYPE theme AS ENUM ('light', 'dark', 'system');

-- Tipo de transacción financiera
CREATE TYPE transaction_type AS ENUM (
  'income',
  'expense',
  'transfer_same_currency',
  'transfer_fx',
  'crypto_buy',
  'crypto_sell'
);

-- Dirección contable de un movimiento
CREATE TYPE entry_direction AS ENUM ('debit', 'credit');

-- Rol del entry dentro de la transacción
CREATE TYPE entry_role AS ENUM ('source', 'destination', 'fee');

-- Tipo de categoría (filtra qué categorías ofrecer en cada flujo de UI)
CREATE TYPE category_kind AS ENUM ('income', 'expense', 'transfer');

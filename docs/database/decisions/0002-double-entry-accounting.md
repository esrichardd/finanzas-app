# 0002 — Modelar transacciones con patrón de doble entrada contable

- **Estado:** Aceptado
- **Fecha:** 2026-04-25
- **Autor(es):** Equipo de producto

## Contexto

La app debe soportar tipos de transacción que involucran uno o varios movimientos sobre cuentas:

- **Ingreso**: 1 movimiento (crédito en una cuenta).
- **Gasto**: 1 movimiento (débito en una cuenta).
- **Transferencia misma moneda**: 2 movimientos (débito origen + crédito destino).
- **Transferencia FX**: 2 movimientos en monedas distintas, con tasa de cambio.
- **Compra de cripto**: 2 movimientos (débito fiat + crédito cripto).
- **Venta de cripto**: 2 movimientos (débito cripto + crédito fiat).

Adicionalmente, cualquier transferencia o conversión puede tener una **comisión**, que es un movimiento extra (débito) en alguna de las cuentas.

Requisitos:
- Atomicidad: una transferencia debe insertar ambos movimientos juntos o ninguno.
- Reconciliación: el saldo de una cuenta debe ser la suma exacta de sus movimientos, sin posibilidad de desincronización.
- Reportes: poder responder "cuánto pagué en comisiones este mes" como un query simple.

## Opciones consideradas

### Opción A — Una tabla `transactions` con campos `from_account` y `to_account`

Una sola tabla con columnas `account_from`, `account_to`, `amount_from`, `amount_to`, `fee_amount`, `fee_currency`.

**Pros:**
- Una fila = una operación. Modelo simple para queries básicas.
- Fácil de entender visualmente.

**Contras:**
- Para ingresos/gastos solo se usa una de las dos columnas → muchos NULLs.
- Las comisiones requieren columnas especiales (`fee_amount`, `fee_currency`, `fee_paid_from_account_id`) que solo aplican a algunos tipos.
- Calcular saldo de una cuenta requiere unir varias columnas: `SUM(amount) WHERE account_to = X` + `SUM(amount) WHERE account_from = X`.
- Inflexible: si mañana aparece una transacción con tres patas (ej. swap de cripto con dos comisiones), hay que agregar columnas.

### Opción B — Doble entrada: `transactions` + `transaction_entries`

`transactions` representa la **intención del usuario** (la operación de negocio); `transaction_entries` son los **movimientos atómicos** sobre cuentas. Cada entry tiene `direction` (debit/credit), `account_id` o `crypto_holding_id`, `amount`, `currency_code`, `is_fee`.

**Pros:**
- Cualquier tipo de transacción se modela uniformemente: 1, 2, 3 o N entries según haga falta.
- Calcular saldo es trivial: `SUM(amount * sign(direction))` sobre los entries de la cuenta.
- Las comisiones son entries normales con flag `is_fee = true` → reporte "comisiones del mes" es un simple `WHERE is_fee = true`.
- Atomicidad garantizada por transacciones SQL.
- Constraint deferido valida la estructura correcta de cada tipo al commit.
- Patrón estándar y comprobado (lo usan ledgers contables desde hace siglos).

**Contras:**
- Más tablas y más JOINs en queries que necesitan ver la operación completa.
- El usuario nuevo del schema necesita entender el patrón (no es obvio a primera vista).

### Opción C — Tabla por tipo de transacción

`incomes`, `expenses`, `transfers`, `crypto_trades` como tablas separadas.

**Pros:**
- Cada tabla tiene exactamente las columnas que necesita.

**Contras:**
- "Mostrar todas las transacciones del mes" requiere UNION de varias tablas.
- Categorías, tags y filtros se duplican en cada tabla.
- Cualquier feature transversal (búsqueda, exportación) se complica.

## Decisión

Elegimos la **Opción B — doble entrada con `transactions` + `transaction_entries`**.

Razón principal: es el único modelo que escala uniformemente para todos los tipos de transacción presentes y futuros, mientras mantiene los saldos siempre consistentes por construcción (no se almacenan, se calculan de los entries).

### Estructura concreta

| Tipo | Entries esperados |
|---|---|
| `income` | 1: crédito en cuenta destino |
| `expense` | 1: débito en cuenta origen |
| `transfer_same_currency` | 2: débito origen + crédito destino (+ N opcionales `is_fee`) |
| `transfer_fx` | 2: débito origen + crédito destino en distintas monedas (+ N fee) |
| `crypto_buy` | 2: débito fiat + crédito cripto (+ N fee) |
| `crypto_sell` | 2: débito cripto + crédito fiat (+ N fee) |

La tasa FX usada en cada operación se guarda en `transactions.fx_rate` (junto con `fx_from_currency` y `fx_to_currency`) para reconstruir cualquier conversión histórica sin depender de tablas externas.

## Consecuencias

### Positivas
- Saldos imposibles de desincronizar (no se almacenan).
- Reportes de comisiones, gastos por categoría, P&L cripto, etc. se escriben como queries simples sobre una sola tabla de entries.
- Extensible: nuevos tipos de transacción no requieren cambios estructurales, solo entries adicionales y validación.

### Negativas / costos asumidos
- El código de aplicación que crea transacciones debe insertar la operación + sus entries en una transacción SQL única.
- Hay un constraint deferido (`validate_transaction_structure`) que se ejecuta al commit y puede fallar si los entries no cuadran. El código de aplicación debe manejar este error.
- Onboarding de devs nuevos requiere explicar el patrón.

### Riesgos a monitorear
- Si la performance de queries de saldo se degrada con volumen alto, considerar `account_balance_snapshots` materializadas (ver ADR 0003).
- Si la lógica de validación se vuelve compleja (muchos casos especiales), considerar mover validación a la capa de aplicación con tests robustos en lugar de constraint DB.

## Referencias

- ADR 0001 — Cripto como entidad separada (los entries pueden apuntar a `accounts` o `crypto_holdings`)
- ADR 0003 — Saldos calculados on-the-fly
- `docs/database/data-model.md`, sección 4.2

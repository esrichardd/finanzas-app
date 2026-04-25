# 0003 — Calcular saldos on-the-fly en lugar de materializarlos

- **Estado:** Aceptado
- **Fecha:** 2026-04-25
- **Autor(es):** Equipo de producto

## Contexto

Una vez decidido el modelo de doble entrada (ADR 0002), el saldo de cualquier cuenta puede obtenerse como la suma de sus `transaction_entries`. La pregunta es si almacenar ese saldo materializado en `accounts.balance` (con triggers que lo mantengan actualizado) o calcularlo en cada lectura mediante una vista.

Trade-off clásico: rapidez de lectura vs. complejidad de mantención y riesgo de inconsistencia.

## Opciones consideradas

### Opción A — `accounts.balance` materializado con triggers

Cada `INSERT/UPDATE/DELETE` en `transaction_entries` dispara un trigger que actualiza `accounts.balance`.

**Pros:**
- Lectura del saldo en O(1).
- Consultas tipo "todas mis cuentas con saldo > X" son inmediatas.

**Contras:**
- Triggers complejos: editar una transacción vieja debe restar del saldo viejo y sumar al nuevo, manejar cambios de cuenta, manejar soft-delete, etc.
- Riesgo de desincronización por bugs en triggers, restores parciales, scripts de migración mal hechos.
- Concurrencia: bloqueos sobre `accounts` durante actualizaciones masivas.
- Imposible auditar "¿por qué el saldo es X?" — solo se ve el número final, no la suma que lo compone.

### Opción B — Vista `v_account_balances` que suma entries on-the-fly

`SELECT initial_balance + SUM(amount * sign(direction)) FROM accounts LEFT JOIN entries ...` con índice `(account_id, transaction_id)`.

**Pros:**
- Imposible desincronizar — el saldo es función pura de los entries.
- Auditable: el saldo se "explica solo" mostrando los entries que lo componen.
- Sin triggers complejos.
- Sin bloqueos sobre `accounts` durante writes de transacciones.

**Contras:**
- Cada lectura del saldo escanea entries. Performance depende de volumen.
- Para usuarios con cientos de miles de transacciones puede haber latencia perceptible.

### Opción C — Híbrido: snapshots periódicos + delta

Tabla `account_balance_snapshots(account_id, as_of_date, balance)` poblada por job nocturno. El saldo actual = snapshot más reciente + suma de entries posteriores.

**Pros:**
- Performance casi tan buena como materializado.
- Sin riesgo de desincronización (el snapshot se puede recalcular siempre).

**Contras:**
- Complejidad adicional: dos tablas que coordinar.
- Editar una transacción vieja invalida snapshots posteriores → recálculo.
- Solo se justifica con volumen alto.

## Decisión

Elegimos la **Opción B — vista `v_account_balances`** como solución inicial.

Razón principal: para los volúmenes esperados de la mayoría de usuarios (cientos a miles de transacciones), la diferencia de performance no es perceptible si los índices están bien puestos. El costo de la materialización (triggers, riesgo de desincronización, complejidad de invalidación) no se justifica desde el día uno.

La **Opción C** queda documentada como plan de migración cuando se cumpla el criterio de escala.

## Consecuencias

### Positivas
- Schema más simple, menos triggers.
- Saldos imposibles de desincronizar.
- Debugging trivial: el saldo siempre se puede explicar mostrando los entries.

### Negativas / costos asumidos
- Latencia de lectura crece linealmente con cantidad de entries por cuenta.
- Dashboards con muchas cuentas hacen muchos scans → asegurar índices.

### Riesgos a monitorear

Métricas para reconsiderar la decisión y migrar a snapshots (Opción C):

- Latencia p95 de carga del dashboard > 500ms.
- Algún usuario con > 500K transacciones.
- Promedio de cuentas por usuario > 30 con dashboards que cargan todas.

Si se cumple alguno, se ejecuta el plan de migración:

1. Crear tabla `account_balance_snapshots`.
2. Job que la pueble nocturnamente.
3. Modificar `v_account_balances` para usar `MAX(snapshot.as_of_date) <= today` + suma de entries posteriores.
4. Trigger en `transaction_entries` que invalide snapshots desde `transaction.occurred_at` cuando se editan transacciones viejas.

### Índices que sostienen esta decisión

```sql
CREATE INDEX idx_entries_account
  ON transaction_entries(account_id, transaction_id)
  WHERE account_id IS NOT NULL;

CREATE INDEX idx_entries_crypto
  ON transaction_entries(crypto_holding_id, transaction_id)
  WHERE crypto_holding_id IS NOT NULL;
```

Si se eliminan o modifican estos índices, esta decisión deja de sostenerse.

## Referencias

- ADR 0002 — Doble entrada contable
- `docs/database/data-model.md`, sección 4.3

# 0001 — Modelar cripto como entidad separada de cuentas fiat

- **Estado:** Aceptado
- **Fecha:** 2026-04-25
- **Autor(es):** Equipo de producto

## Contexto

La aplicación debe soportar tanto cuentas fiat (cuenta bancaria, wallet digital tipo Vita o Nequi, efectivo, tarjeta de crédito) como tenencias de criptomonedas (BTC, ETH, SOL, USDT, etc.). Ambas representan "lugares donde el usuario tiene valor", pero tienen propiedades semánticas distintas:

- Una cuenta fiat tiene una moneda única (ISO 4217), saldo en esa moneda, y movimientos que suman/restan en esa misma moneda.
- Una tenencia cripto tiene un activo (BTC), una cantidad, un precio variable contra fiat, una base de costo (cost basis) para calcular P&L, y posibles atributos de red (mainnet, polygon, etc.) y dirección de wallet.

La decisión afecta: cómo se modelan las transacciones que mueven valor entre fiat y cripto, cómo se calculan saldos y patrimonio total, y qué tan limpios son los reportes de P&L.

## Opciones consideradas

### Opción A — Tabla única `accounts` con discriminador `asset_type`

Una sola tabla `accounts` con una columna `asset_type` (`'fiat'` | `'crypto'`) y un `asset_code` que apunta a moneda fiat o a símbolo cripto según el tipo.

**Pros:**
- Queries unificadas triviales: "todas las cuentas del usuario" es un SELECT simple.
- Una sola tabla de saldos.
- Menos JOINs en el código de aplicación.

**Contras:**
- `asset_code` no puede tener una FK limpia (apunta a dos catálogos distintos).
- Atributos específicos de cripto (`wallet_address`, `network`, `cost_basis_method`) quedan NULL en la mitad de las filas.
- Atributos específicos de fiat (`institution_id`, `account_number`) quedan NULL en la otra mitad.
- Las validaciones de negocio se vuelven condicionales: "si `asset_type = 'crypto'` entonces X, si no Y".
- Los reportes de P&L cripto requieren filtros explícitos para no mezclar con fiat.

### Opción B — Entidades separadas: `accounts` y `crypto_holdings`

Dos tablas hermanas, cada una con su propio catálogo (`currencies` para fiat, `crypto_assets` para cripto). Una vista `v_financial_assets` las unifica cuando se necesita verlas juntas.

**Pros:**
- FKs limpias a catálogos específicos.
- Sin columnas nulas espurias.
- Validaciones más simples: cada tabla tiene constraints específicas a su naturaleza.
- P&L cripto se calcula sobre una tabla limpia.
- Extensible: si en el futuro agregamos NFTs o activos no líquidos, encajan naturalmente como nuevas entidades hermanas.

**Contras:**
- Queries que necesitan "todo lo que tiene el usuario" requieren un UNION o vista.
- El código de aplicación tiene dos formularios distintos (crear cuenta fiat vs. crear holding cripto), aunque conceptualmente son similares.

## Decisión

Elegimos la **Opción B — entidades separadas**.

Razón principal: la diferencia semántica entre "tengo 500 USD en Vita" y "tengo 0.012 BTC en Phantom" es real y se manifiesta en cómo el usuario piensa, cómo se valoran los activos, y cómo se calculan ganancias. Forzar una sola tabla optimiza queries triviales a costa de complicar todo lo demás. La vista `v_financial_assets` resuelve el caso de uso "patrimonio total" sin fricción.

## Consecuencias

### Positivas
- Schema más limpio y autodocumentado.
- Las extensiones futuras (FIFO/LIFO en cripto, NFTs, activos no líquidos) tienen un lugar natural.
- Los reportes de cripto son simples de escribir.

### Negativas / costos asumidos
- El código de aplicación maneja dos tipos de "cuenta" en muchos contextos.
- La vista `v_financial_assets` es la fuente de verdad para "patrimonio total" — hay que mantenerla actualizada cuando se agreguen nuevas entidades de activos.

### Riesgos a monitorear
- Si en algún momento el 90% de las queries necesita unificar fiat y cripto, podría reconsiderarse. Hoy no es el caso.
- Si la mantención de la vista `v_financial_assets` se vuelve costosa, considerar una tabla materializada.

## Referencias

- ADR 0002 — Doble entrada contable (define cómo `transaction_entries` apunta a una u otra tabla)
- `docs/database/data-model.md`, sección 4.1

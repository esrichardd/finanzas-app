# Decisiones arquitectónicas (ADRs)

Esta carpeta contiene **Architecture Decision Records** — registros de las decisiones técnicas importantes que se han tomado en el modelo de datos. Cada decisión es un archivo markdown.

## ¿Por qué ADRs?

Un ADR captura **por qué** se tomó una decisión, **qué se consideró**, y **qué consecuencias tiene**. Sin ADRs, el código termina con decisiones que parecen arbitrarias y nadie recuerda por qué se hicieron así. Con ADRs, cualquier dev nuevo puede entender el contexto, y las re-evaluaciones futuras tienen un punto de partida claro.

## Convenciones

- Numeración secuencial con padding a 4 dígitos: `0001`, `0002`, ..., `0042`.
- Slug descriptivo en kebab-case: `0001-crypto-separate-entity.md`.
- **Inmutables una vez aceptados.** Si una decisión cambia, se crea un ADR nuevo con estado "Reemplazado por NNNN" en el viejo y "Reemplaza a NNNN" en el nuevo. No se editan ADRs aceptados, salvo correcciones tipográficas.

## Estados posibles

| Estado | Significado |
|---|---|
| Propuesto | En discusión, aún no implementado |
| Aceptado | Decisión vigente, refleja el código actual |
| Reemplazado por NNNN | Ya no aplica, ver el ADR sucesor |
| Obsoleto | El problema ya no existe (ej. la feature se removió) |

## Cuándo crear un ADR

- Cualquier decisión sobre cómo modelar una entidad nueva con varias opciones razonables.
- Trade-offs de performance vs. simplicidad.
- Adopción o cambio de patrón estructural (eventos, materialización, particionamiento, etc.).
- Decisiones sobre RLS o seguridad que no son obvias.
- Cambios de stack o de extensiones de Postgres.

**No** crear ADR para:

- Renombrar una columna.
- Agregar un índice estándar.
- Bug fixes.
- Cambios cosméticos.

## Cómo crear uno nuevo

1. Tomar el siguiente número disponible.
2. Copiar `template.md`:
   ```bash
   cp template.md 00NN-mi-decision.md
   ```
3. Llenarlo. Discutirlo si hay equipo. Mergearlo cuando esté aceptado.
4. Si reemplaza a otro ADR, actualizar el estado del viejo.

## Índice actual

| # | Título | Estado |
|---|---|---|
| [0001](./0001-crypto-separate-entity.md) | Modelar cripto como entidad separada de cuentas fiat | Aceptado |
| [0002](./0002-double-entry-accounting.md) | Modelar transacciones con patrón de doble entrada contable | Aceptado |
| [0003](./0003-balances-on-the-fly.md) | Calcular saldos on-the-fly en lugar de materializarlos | Aceptado |

# Base de datos

Documentación del modelo de datos de la aplicación. Esta carpeta describe **qué hay** en la base de datos y **por qué está así**. El SQL ejecutable vive en `/supabase/migrations/`.

## Contenido

| Archivo                                                | Propósito                                                             |
| ------------------------------------------------------ | --------------------------------------------------------------------- |
| [`data-model.md`](./data-model.md)                     | Modelo completo: tablas, decisiones, RLS, índices, queries de ejemplo |
| [`diagrams/er-diagram.mmd`](./diagrams/er-diagram.mmd) | Diagrama ER en Mermaid (GitHub lo renderiza automáticamente)          |
| [`decisions/`](./decisions/)                           | ADRs — registro de decisiones arquitectónicas                         |

## Cómo navegar esta documentación

- **Soy nuevo en el proyecto** → empieza por `data-model.md`, sección "Resumen ejecutivo".
- **Voy a tocar el schema** → revisa los ADRs relacionados antes de hacer cambios.
- **Quiero ver las tablas visualmente** → abre `diagrams/er-diagram.mmd` en GitHub o en cualquier editor que renderice Mermaid.
- **Necesito entender por qué algo está como está** → busca el ADR correspondiente en `decisions/`.

## Cómo iterar cuando el modelo cambie

La regla base: **markdown describe, SQL ejecuta**. No los mezcles.

### Cambio menor (columna nueva, índice, tweak)

1. Crear una migración nueva con Supabase CLI:
   ```bash
   supabase migration new add_budget_column
   ```
2. Escribir el SQL en el archivo generado.
3. Actualizar la sección relevante de `data-model.md`.
4. Si afecta el diagrama, actualizar `diagrams/er-diagram.mmd`.
5. Probar localmente:
   ```bash
   supabase db reset
   ```
6. Commit con todos los cambios juntos (migración + docs en el mismo PR).

### Cambio de diseño grande

Antes de tocar SQL, escribir un ADR nuevo. El ADR explica el contexto, las opciones consideradas y la decisión tomada. Solo después se hace la migración.

Pasos:

1. Copiar `decisions/template.md` con el siguiente número:
   ```bash
   cp decisions/template.md decisions/0004-mi-decision.md
   ```
2. Llenarlo. Discutir el ADR si hay equipo.
3. Generar migración como en el flujo anterior.
4. Actualizar `data-model.md`.

### Cambios que rompen migraciones aplicadas

**Nunca editar una migración ya aplicada en un entorno compartido.** Si algo está mal en producción, se arregla con una migración nueva que corrija el problema. Las migraciones son inmutables una vez mergeadas.

## Convenciones del schema

- PKs: `uuid` con `gen_random_uuid()` (compatibilidad Supabase Auth)
- Timestamps: `timestamptz` siempre
- Montos: `numeric(20, 8)` (soporta cripto sin pérdida de precisión)
- Nombres: `snake_case`
- Soft delete: `deleted_at timestamptz` en entidades que el usuario puede "borrar" pero conviene preservar (cuentas, transacciones)
- Toda tabla con `user_id` tiene RLS habilitado
- `created_at` / `updated_at` en todas las tablas mutables, con trigger automático para `updated_at`

## Comandos útiles

```bash
# Aplicar migraciones a base local
supabase db reset

# Generar nueva migración a partir de cambios en el dashboard
supabase db diff -f mi_cambio

# Ver schema actual de la base local
supabase db dump --local --schema public

# Aplicar migraciones a un entorno remoto (después de linkear)
supabase db push
```

## Stack

- **PostgreSQL 15+**
- **Supabase**: Auth (`auth.users`), Storage, Realtime, RLS
- **Cliente**: Next.js con `@supabase/ssr`

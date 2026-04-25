# Supabase

Configuración, migraciones y seeds de la base de datos. Esta carpeta es manejada por **Supabase CLI**.

## Prerequisitos

```bash
# Instalar Supabase CLI (si no lo tienes)
npm install -g supabase
# o con Homebrew en macOS
brew install supabase/tap/supabase

# Docker debe estar corriendo (Supabase local lo necesita)
```

## Estructura

```
supabase/
├── config.toml              ← configuración de la instancia local
├── seed.sql                 ← datos de prueba para desarrollo (NO va a producción)
├── migrations/              ← cambios versionados del schema (sí va a producción)
│   ├── 20260425000001_extensions_and_enums.sql
│   ├── 20260425000002_set_updated_at_function.sql
│   ├── 20260425000003_catalog_tables.sql
│   ├── 20260425000004_profiles.sql
│   ├── 20260425000005_accounts_and_crypto_holdings.sql
│   ├── 20260425000006_categories_and_tags.sql
│   ├── 20260425000007_transactions_and_entries.sql
│   ├── 20260425000008_balance_views.sql
│   ├── 20260425000009_row_level_security.sql
│   └── 20260425000010_seed_catalogs.sql
└── .gitignore
```

## Migraciones vs. seed.sql

Esta es la distinción más importante de entender:

| Archivo | Cuándo se ejecuta | Va a producción |
|---|---|---|
| `migrations/*.sql` | En cada `db reset` y al hacer `db push` | **Sí** |
| `seed.sql` | Solo en `db reset` local | **No** |

**Regla:** todo lo que define el *schema* (tablas, índices, RLS, triggers, vistas, datos de catálogo compartidos) es una **migración**. Todo lo que es *data de juguete* para desarrollo (usuarios fake, transacciones de ejemplo) va en `seed.sql`.

Las categorías de sistema, monedas y países son seeds de catálogo y por eso van como migración (`20260425000010_seed_catalogs.sql`) — todos los entornos los necesitan.

## Comandos básicos

### Primera vez

```bash
# Iniciar Docker primero, luego levantar Supabase local
supabase start

# Esto te imprime las credenciales locales:
#   API URL: http://127.0.0.1:54321
#   anon key: ey...
#   service_role key: ey...
#
# Cópialas a tu .env.local de Next.js
```

### Día a día

```bash
# Resetear base local + aplicar todas las migraciones + ejecutar seed.sql
supabase db reset

# Crear una nueva migración (vacía)
supabase migration new <nombre_descriptivo>

# Detectar cambios hechos en el dashboard local y generar migración
supabase db diff -f <nombre_descriptivo>

# Ver el schema actual
supabase db dump --local --schema public

# Ver logs de la base
supabase logs db

# Detener todo
supabase stop
```

### Linkear con proyecto remoto

```bash
# Login (se abre el navegador)
supabase login

# Linkear con proyecto remoto
supabase link --project-ref <tu-project-ref>

# Aplicar migraciones locales pendientes al remoto
supabase db push

# Traer migraciones del remoto si alguien las creó por otra vía
supabase db pull
```

## Flujo de cambio del schema

### Cambio menor (columna nueva, índice, ajuste)

```bash
# 1. Crear migración
supabase migration new add_budget_field

# 2. Editar el archivo SQL generado en migrations/
# 3. Aplicar y probar localmente
supabase db reset

# 4. Si todo OK, push a remoto
supabase db push

# 5. Commit con todos los cambios juntos (incluye actualización de docs/database/data-model.md)
git add supabase/migrations/ docs/database/
git commit -m "feat(db): add budget field to accounts"
```

### Cambio de diseño grande

1. Escribir un ADR primero en `docs/database/decisions/` (ver el README de esa carpeta).
2. Una vez aceptado el ADR, crear la migración.
3. Actualizar `docs/database/data-model.md`.

### Cambios que rompen migraciones aplicadas

**Nunca editar una migración que ya está aplicada en un entorno compartido.** Si necesitas corregir algo:

- Si solo está aplicada en tu local: `supabase db reset` la borra, edita el archivo, vuelve a resetear.
- Si está en staging o producción: crea una migración nueva que arregle el problema. Las migraciones aplicadas son inmutables.

## Conexión desde Next.js

Asegúrate de tener estas variables en `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<la_anon_key_que_te_imprimió_supabase_start>

# Solo para acciones server-side privilegiadas (no exponer al cliente)
SUPABASE_SERVICE_ROLE_KEY=<la_service_role_key>
```

Para producción, usa los valores del proyecto remoto de Supabase Dashboard.

## Usuario de prueba (creado por seed.sql)

```
Email:    test@example.com
Password: testpassword123
```

Tiene 3 cuentas, 2 holdings cripto y 5 transacciones de ejemplo de distintos tipos.

## Orden de las migraciones

Si miras los timestamps verás `20260425000001` ... `20260425000010`. El orden importa: una migración no puede referenciar tablas que aún no existen. La secuencia actual es:

1. **Extensiones y ENUMs** — tipos primitivos
2. **Función updated_at** — utilidad reutilizable
3. **Catálogos** — tablas compartidas (sin FKs hacia datos de usuario)
4. **Profiles** — depende de auth.users + catálogos
5. **Accounts y crypto_holdings** — dependen de profiles + catálogos
6. **Categories y tags** — dependen de profiles
7. **Transactions y entries** — dependen de todo lo anterior
8. **Vistas de saldos** — leen de las tablas anteriores
9. **RLS** — políticas sobre tablas ya creadas
10. **Seeds de catálogos** — datos compartidos

Cuando agregues migraciones nuevas, usa el timestamp del momento (`YYYYMMDDHHMMSS`) — Supabase CLI lo hace por ti con `supabase migration new`.

## Documentación relacionada

- [`docs/database/README.md`](../docs/database/README.md) — modelo de datos y decisiones
- [`docs/database/decisions/`](../docs/database/decisions/) — ADRs

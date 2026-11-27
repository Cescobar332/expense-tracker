# FinanceApp (expense-tracker)

Monorepo pnpm de finanzas personales.

- `apps/web`: Next.js 15 + React 19 + Tailwind 4 + React Query + Zustand. Se despliega en **Vercel**.
- `apps/api`: NestJS 11 + Prisma 5 + Jest. Se despliega en **Render**.
- Base de datos: Postgres en **Supabase** (producción) y Postgres en Docker (`docker-compose.yml`) en local.
- Correos: `apps/api/src/shared/services/email.service.ts`. El proveedor se elige con `EMAIL_PROVIDER` (`resend` | `brevo` | `smtp`). En producción se usa Resend, porque Render bloquea SMTP. En local se usa SMTP (Gmail).

Comandos: `pnpm dev`, `pnpm lint`, `pnpm db:migrate`, `pnpm db:studio`. Tests: solo existen e2e en `apps/api/test` (`pnpm --filter api test:e2e`, corren contra la base de datos local). `pnpm test` falla porque no hay tests unitarios.

## Montar el entorno local (PC nuevo)

1. Abrir Docker Desktop y correr `docker compose up -d` (Postgres en el puerto 5433, para no chocar con otros proyectos).
2. Copiar `apps/api/.env.example` a `apps/api/.env`, generar los JWT con `openssl rand -hex 32` y llenar `SMTP_USER`, `SMTP_PASS` y `SMTP_FROM` (contraseña de aplicación de Gmail).
3. Crear `apps/web/.env.local` con `NEXT_PUBLIC_API_URL=http://localhost:3001/api`.
4. `pnpm install`, `pnpm --filter api prisma:deploy` y `pnpm dev`.

## Reglas obligatorias

1. **Git lo ejecuta solo el usuario.** Claude nunca ejecuta `git` (ni comandos de solo lectura como `status` o `log`) ni `gh`. Cuando haga falta un comando de git, Claude lo escribe en un bloque `bash` con una explicación de una línea, y el usuario lo corre. También está bloqueado en `.claude/settings.json`.
2. **Nunca tocar producción desde local.** El `.env` local apunta a la base de datos de Docker, nunca a Supabase. Si Claude detecta una `DATABASE_URL` con `supabase` en un `.env` local, avisa antes de correr migraciones, seeds o tests.
3. **Explicar sin jerga.** Después de cada cambio de código, Claude explica en español sencillo qué hace esa parte de la app y por qué la cambió, como si el usuario no la hubiera escrito. El usuario está aprendiendo cómo funciona su propio proyecto.
4. Antes de dar algo por terminado, correr `pnpm lint` y los tests de la app afectada, y reportar el resultado real.
5. Las variables de entorno nuevas se documentan en `apps/api/.env.example` (o el equivalente de web) y se le recuerda al usuario agregarlas en Render o Vercel.

## Ramas

- `master`: producción. Vercel y Render despliegan desde aquí. Nadie trabaja directo en ella.
- Vercel solo despliega `master` (`apps/web/vercel.json`). No hay ambiente de pruebas en la nube: todo se prueba en local.
- `develop`: integración. Todo se prueba aquí antes de pasar a `master`.
- Ramas de trabajo, siempre creadas desde `develop`, en minúsculas y con guiones:
  - `feature/<descripcion-corta>`: funcionalidad nueva (ej. `feature/presupuestos-mensuales`)
  - `fix/<descripcion>`: corrección de un error
  - `chore/<descripcion>`: configuración, dependencias, limpieza
  - `hotfix/<descripcion>`: arreglo urgente de producción; sale de `master` y se une a `master` y a `develop`

## Flujo de trabajo

1. El usuario crea la rama desde `develop` actualizado (Claude le pasa los comandos).
2. Claude implementa, prueba en local y explica los cambios.
3. Claude propone el mensaje de commit en formato Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`), en español, y el usuario hace el commit.
4. Se une la rama a `develop` (idealmente con un Pull Request en GitHub) y se prueba.
5. Cuando `develop` está estable, se une a `master` mediante un PR, y eso despliega.

Para empezar una funcionalidad se usa la skill `/nueva-feature`. Para revisar la interfaz se usa `/auditoria-ui`.

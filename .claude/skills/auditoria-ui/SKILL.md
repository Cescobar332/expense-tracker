---
name: auditoria-ui
description: Audita y corrige la interfaz de apps/web (Next.js + Tailwind 4): errores visuales, responsive, accesibilidad, consistencia y aspecto "hecho por IA". Úsala cuando el usuario pida revisar, pulir o rediseñar una pantalla o componente.
---

# Auditoría de UI

Argumento opcional: una ruta (`/dashboard`, `/transactions`) o un componente. Si no se indica ninguno, se auditan todas las páginas de `apps/web/src/app`.

## 1. Ver la app de verdad
- Levantar `pnpm dev:web` (y `pnpm dev:api` si la pantalla necesita datos) con el `.env` local, nunca contra producción.
- Abrir cada pantalla en el navegador integrado con tres anchos: móvil (375), tablet (768) y escritorio, en modo claro y en modo oscuro si la app lo soporta.
- Revisar los estados: cargando, vacío (sin transacciones), error del API, listas largas (paginación), textos y montos largos (por ejemplo `$ 1.234.567.890,00`).

## 2. Checklist
**Bugs visuales:** desbordes y scroll horizontal, texto cortado, elementos encimados, saltos de layout al cargar, modales que no cierran o que no dejan hacer scroll.
**Responsive:** tablas en móvil, menú lateral, zonas táctiles de al menos 44px, gráficos de recharts que se adaptan al ancho.
**Accesibilidad:** contraste AA, `label` en cada input, botones de solo icono (lucide) con `aria-label`, foco visible al navegar con teclado, colores que no sean la única señal (ingreso/gasto también con signo o icono).
**Consistencia:** espaciados de la escala de Tailwind (sin valores arbitrarios sueltos), una sola paleta, mismos radios, sombras y tipografía en tarjetas, botones y formularios; los componentes de `components/ui` se reutilizan en vez de duplicarse.
**Formato financiero:** montos con el mismo formato de moneda y de decimales en toda la app; fechas en un formato consistente; textos del i18n (`lib/i18n`), nunca escritos directamente en el código.
**Aspecto "hecho por IA":** degradados morados genéricos, emojis como iconos, exceso de tarjetas con sombra, textos de relleno, todo centrado. Se propone una jerarquía visual clara en su lugar.

## 3. Reporte antes de tocar código
Tabla con: severidad (Alta/Media/Baja), pantalla, problema, archivo:línea y la corrección propuesta. Se pregunta al usuario cuáles aplicar.

## 4. Aplicar y verificar
- Corregir en el componente compartido cuando el problema se repite.
- Volver a revisar en el navegador los mismos anchos y correr `pnpm lint`.
- Explicar en lenguaje sencillo qué se cambió y por qué se ve o funciona mejor.
- Proponer el mensaje de commit (`fix(ui): ...` o `style: ...`). Claude no ejecuta git.

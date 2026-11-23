---
name: nueva-feature
description: Flujo para empezar, implementar y cerrar una funcionalidad o corrección en este repo siguiendo las reglas de ramas. Úsala cuando el usuario pida una funcionalidad nueva o un fix.
---

# Nueva funcionalidad

Argumento: descripción de lo que el usuario quiere.

1. **Entender.** Hacer las preguntas que falten y explicar en lenguaje sencillo qué partes de la app se tocarán (web, api, base de datos).
2. **Rama.** Proponer un nombre (`feature/...`, `fix/...`, `chore/...`) y darle al usuario los comandos para que él los ejecute:
   ```bash
   git switch develop
   ```
   ```bash
   git pull origin develop
   ```
   ```bash
   git switch -c feature/<nombre>
   ```
   Esperar a que confirme antes de editar.
3. **Implementar.** Si cambia el esquema de Prisma, crear la migración solo contra la base de datos local de Docker y avisar que la migración se aplicará en Supabase cuando llegue a producción.
4. **Probar.** `pnpm lint`, tests de la app afectada, y probarlo en el navegador si es UI.
5. **Explicar.** Contar qué se hizo y cómo funciona, sin jerga.
6. **Cerrar.** Proponer el mensaje de commit (Conventional Commits, en español) y los comandos `git add`, `git commit` y `git push -u origin <rama>`, más el paso para abrir el PR hacia `develop`. Si hay variables de entorno nuevas, recordar agregarlas en Render o Vercel.

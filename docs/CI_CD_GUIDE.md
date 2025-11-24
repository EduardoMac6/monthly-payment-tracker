# 🚀 Guía de CI/CD - DebtLite

Guía completa sobre la configuración de Continuous Integration y Continuous Deployment del proyecto.

---

## 📋 ¿Qué es CI/CD?

**CI (Continuous Integration):** Automatiza la verificación de código en cada commit/push:
- ✅ Ejecuta tests automáticamente
- ✅ Verifica linting y formato
- ✅ Compila el proyecto
- ✅ Verifica tipos TypeScript

**CD (Continuous Deployment):** Despliega automáticamente a producción cuando el código pasa todas las verificaciones.

---

## 🔧 Configuración Actual

### Workflows de GitHub Actions

El proyecto tiene dos workflows principales:

#### 1. CI Workflow (`.github/workflows/ci.yml`)

Se ejecuta en:
- Push a `main` o `develop`
- Pull Requests a `main` o `develop`

**Jobs incluidos:**

1. **Type Check** - Verifica tipos TypeScript
   ```bash
   npx tsc --noEmit
   ```

2. **Lint** - Ejecuta ESLint
   ```bash
   npm run lint
   ```

3. **Format Check** - Verifica formato con Prettier
   ```bash
   npm run format:check
   ```

4. **Test** - Ejecuta todos los tests
   ```bash
   npm run test:run
   npm run test:coverage
   ```

5. **Build** - Compila el proyecto
   ```bash
   npm run build:prod
   ```

**Resultados:**
- Si algún job falla, el workflow marca el commit/PR como fallido
- Los artifacts (coverage, build) se guardan por 7 días
- Puedes ver los resultados en la pestaña "Actions" de GitHub

---

#### 2. CD Workflow (`.github/workflows/cd.yml`)

Se ejecuta en:
- Push a `main` (solo producción)
- Tags que empiezan con `v*` (releases)

**Jobs incluidos:**

1. **Deploy** - Despliega a producción
   - Intenta desplegar a Vercel (si está configurado)
   - Si no hay configuración de Vercel, despliega a GitHub Pages

**Configuración requerida:**

Para Vercel (recomendado):
1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Obtén tu `VERCEL_TOKEN` (Settings → Tokens)
3. Obtén `VERCEL_ORG_ID` (Settings → General → Team ID)
4. Obtén `VERCEL_PROJECT_ID` (Settings → General → Project ID) - **Opcional pero recomendado**
5. Agrega estos como secrets en GitHub:
   - Settings → Secrets and variables → Actions → New repository secret
   - Agrega: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

**Nota:** El workflow funciona de dos formas:
- **Con `VERCEL_PROJECT_ID`:** Usa los tres secrets para deploy directo
- **Sin `VERCEL_PROJECT_ID`:** Solo usa `VERCEL_TOKEN` y `VERCEL_ORG_ID`, Vercel detecta el proyecto automáticamente

Para GitHub Pages (fallback):
- No requiere configuración adicional
- Se activa automáticamente si los secrets de Vercel no están configurados

---

## 🚀 Cómo Funciona

### Flujo de CI

```
1. Desarrollador hace push/PR
   ↓
2. GitHub Actions detecta el evento
   ↓
3. Ejecuta todos los jobs en paralelo:
   - Type Check
   - Lint
   - Format Check
   - Test
   - Build
   ↓
4. Si todos pasan → ✅ Success
   Si alguno falla → ❌ Failed
```

### Flujo de CD

```
1. Push a main (después de merge)
   ↓
2. CI se ejecuta primero
   ↓
3. Si CI pasa → CD se ejecuta
   ↓
4. Build de producción
   ↓
5. Deploy a Vercel/GitHub Pages
   ↓
6. ✅ Aplicación actualizada en producción
```

---

## 📊 Ver Resultados

### En GitHub

1. Ve a la pestaña **"Actions"** en tu repositorio
2. Verás una lista de todos los workflows ejecutados
3. Haz clic en uno para ver detalles:
   - Estado de cada job
   - Logs de ejecución
   - Artifacts generados

### Badge de Status

El README incluye un badge que muestra el estado del último CI:

```markdown
[![CI](https://github.com/USERNAME/monthly-payment-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/USERNAME/monthly-payment-tracker/actions/workflows/ci.yml)
```

**Nota:** Reemplaza `USERNAME` con tu usuario de GitHub.

---

## 🔍 Troubleshooting

### El workflow falla en Type Check

**Problema:** Errores de tipos TypeScript

**Solución:**
```bash
# Ejecuta localmente para ver el error
npx tsc --noEmit

# Corrige los errores de tipos
# Haz commit y push
```

### El workflow falla en Lint

**Problema:** Errores de ESLint

**Solución:**
```bash
# Ejecuta localmente
npm run lint

# Auto-fix si es posible
npm run lint:fix

# Haz commit y push
```

### El workflow falla en Format Check

**Problema:** Código no está formateado

**Solución:**
```bash
# Formatea el código
npm run format

# Haz commit y push
```

### El workflow falla en Tests

**Problema:** Tests fallando

**Solución:**
```bash
# Ejecuta tests localmente
npm run test:run

# Revisa los errores
# Corrige el código o los tests
# Haz commit y push
```

### El workflow falla en Build

**Problema:** El build falla

**Solución:**
```bash
# Ejecuta build localmente
npm run build:prod

# Revisa los errores
# Corrige el código
# Haz commit y push
```

### CD no despliega

**Problema:** El deployment no se ejecuta

**Posibles causas:**
1. **Vercel no configurado:** Agrega los secrets necesarios (`VERCEL_TOKEN` y `VERCEL_ORG_ID` mínimo)
2. **CI falló:** CD solo se ejecuta si CI pasa
3. **No es push a main:** CD solo se ejecuta en `main`
4. **Error en verificación de secrets:** Revisa los logs del step "Check Vercel secrets"

**Solución:**
- Verifica que CI pasó (pestaña "Actions" en GitHub)
- Verifica que estás en la rama `main`
- Verifica los secrets de Vercel:
  - Mínimo requerido: `VERCEL_TOKEN` y `VERCEL_ORG_ID`
  - Opcional pero recomendado: `VERCEL_PROJECT_ID`
- Revisa los logs del workflow para ver qué step falló
- Si el error es "You specified VERCEL_ORG_ID but forgot VERCEL_PROJECT_ID", agrega `VERCEL_PROJECT_ID` o el workflow usará auto-detección

---

## 🎯 Mejores Prácticas

### Para Desarrolladores

1. **Ejecuta checks localmente antes de push:**
   ```bash
   npm run lint
   npm run format:check
   npm run test:run
   npm run build:prod
   ```

2. **Haz commits pequeños:** Facilita identificar qué causó un fallo

3. **Revisa los resultados de CI:** Antes de mergear un PR, verifica que CI pasó

4. **No hagas push directo a main:** Usa PRs para que CI valide antes de mergear

### Para el Proyecto

1. **Mantén los tests actualizados:** Si agregas código, agrega tests

2. **Mantén el coverage alto:** Objetivo: >80%

3. **Revisa los logs de CI regularmente:** Identifica problemas comunes

4. **Actualiza dependencias:** Mantén las acciones de GitHub actualizadas

---

## 🔄 Actualizar Workflows

### Agregar un nuevo check

Edita `.github/workflows/ci.yml` y agrega un nuevo job:

```yaml
nuevo-check:
  name: Nuevo Check
  runs-on: ubuntu-latest
  
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    - run: npm ci
    - run: npm run tu-comando
```

### Cambiar la versión de Node.js

Edita ambos workflows y cambia:
```yaml
node-version: '20'  # Cambia a la versión que necesites
```

### Agregar notificaciones

Puedes agregar notificaciones (Slack, Discord, email) cuando:
- CI falla
- CD despliega exitosamente

---

## 📚 Recursos

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel GitHub Integration](https://vercel.com/docs/concepts/git)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

---

## ✅ Checklist de Configuración

- [ ] Workflows creados (`.github/workflows/ci.yml` y `cd.yml`)
- [ ] Badge agregado al README (actualizar USERNAME)
- [ ] Secrets de Vercel configurados en GitHub:
  - [ ] `VERCEL_TOKEN` (requerido)
  - [ ] `VERCEL_ORG_ID` (requerido)
  - [ ] `VERCEL_PROJECT_ID` (opcional pero recomendado)
- [ ] `vercel.json` configurado correctamente en la raíz
- [ ] `vite.config.ts` tiene `base: '/'` (no `base: './'`)
- [ ] GitHub Pages habilitado (si no usas Vercel, como fallback)
- [ ] Primer push a `main` ejecutó CI correctamente
- [ ] Primer push a `main` ejecutó CD correctamente
- [ ] Deployment visible en Vercel Dashboard
- [ ] Aplicación accesible en `https://tu-proyecto.vercel.app`

---

## 🔄 Cambios Recientes (2024)

### Mejoras en el Workflow de CD
- ✅ Verificación mejorada de secrets (no falla si falta `VERCEL_PROJECT_ID`)
- ✅ Soporte para auto-detección de proyecto Vercel
- ✅ Dos estrategias de deploy (con y sin `VERCEL_PROJECT_ID`)

### Mejoras en Configuración de Vercel
- ✅ Base path corregido a `/` para rutas absolutas
- ✅ Rewrites mejorados para assets y páginas
- ✅ Plugin de env lee de `process.env` (variables de Vercel)

---

**Última actualización:** Noviembre 2024
**Versión:** 1.1


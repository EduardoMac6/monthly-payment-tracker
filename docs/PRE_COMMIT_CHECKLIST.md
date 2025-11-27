# ✅ Checklist Pre-Commit - Qué Hacer Antes de Subir Cambios

Guía rápida de qué verificar antes de hacer `git push` a GitHub.

---

## 🚫 **NO necesitas hacer esto antes de subir:**

- ❌ **NO necesitas hacer `npm run build:prod`** antes de subir
  - Vercel lo hace automáticamente cuando haces push
  - GitHub Actions también verifica que el build funcione
  - Solo necesitas subir el código fuente (`src/`)

---

## ✅ **SÍ debes hacer esto antes de subir:**

### **Verificación Rápida (2-3 minutos)**

Ejecuta estos comandos en orden:

```bash
# 1. Verificar que todos los tests pasen
npm run test:run

# 2. Verificar que el código compile sin errores
npx tsc --noEmit

# 3. Verificar formato de código
npm run format:check

# 4. Verificar linting (solo errores críticos)
npm run lint
```

**Si todos pasan:** ✅ **Puedes hacer commit y push**

**Si alguno falla:** Corrige el error antes de subir

---

## 📋 **Verificación Detallada (Opcional, pero recomendado)**

### **1. Tests (Verificación de Funcionalidad)**

```bash
npm run test:run
```

**Qué verifica:**
- ✅ Todos los tests unitarios pasan
- ✅ Todos los tests de integración pasan
- ✅ Cobertura de código se mantiene alta

**Resultado esperado:**
```
Test Files  8 passed (8)
     Tests  145 passed | 1 skipped (146)
```

**Si falla:**
- Revisa qué test falló
- Lee el mensaje de error
- Corrige el problema antes de continuar

---

### **2. Type Check (Verificación de Tipos)**

```bash
npx tsc --noEmit
```

**Qué verifica:**
- ✅ No hay errores de tipos TypeScript
- ✅ Todas las importaciones son correctas
- ✅ No hay variables no usadas

**Resultado esperado:**
```
(No output = éxito)
```

**Si falla:**
- Revisa los errores de tipo
- Corrige los tipos incorrectos
- Elimina variables no usadas

---

### **3. Formato de Código (Prettier)**

```bash
npm run format:check
```

**Qué verifica:**
- ✅ El código está formateado correctamente
- ✅ Consistencia en estilo

**Resultado esperado:**
```
Checking formatting...
All matched files use Prettier code style!
```

**Si falla:**
```bash
# Auto-corregir formato
npm run format
```

---

### **4. Linting (Calidad de Código)**

```bash
npm run lint
```

**Qué verifica:**
- ✅ No hay errores críticos de ESLint
- ⚠️ Warnings son aceptables (console.log, any types en tests)

**Resultado esperado:**
- Puede tener warnings (están permitidos)
- No debe tener errores críticos

**Si hay errores:**
```bash
# Intentar auto-corregir
npm run lint:fix
```

---

### **5. Probar Localmente (Opcional pero recomendado)**

```bash
# Opción 1: Servidor de desarrollo (con HMR)
npm run dev

# Opción 2: Build y servidor local
npm run build:prod
npm run preview
```

**Qué verificar en el navegador:**
- ✅ La landing page carga (`http://localhost:3000/`)
- ✅ Puedes navegar a `/pages/start.html`
- ✅ Puedes navegar a `/pages/dashboard.html`
- ✅ La aplicación funciona (crear planes, marcar pagos, etc.)
- ✅ No hay errores en la consola del navegador (F12)

---

## 🔄 **Flujo Automático en GitHub**

Cuando haces `git push`, GitHub Actions ejecuta automáticamente:

1. ✅ **Type Check** - Verifica tipos TypeScript
2. ✅ **Linting** - Verifica calidad de código
3. ✅ **Format Check** - Verifica formato
4. ✅ **Tests** - Ejecuta todos los tests
5. ✅ **Build** - Verifica que el build funcione

**Si todo pasa:** ✅ El código se considera válido

**Si algo falla:** ❌ Recibirás un email y verás el error en GitHub Actions

---

## 🚀 **Flujo Automático en Vercel**

Cuando haces push a `main`:

1. ✅ Vercel detecta el push
2. ✅ Ejecuta `npm install`
3. ✅ Ejecuta `npm run build:prod` (genera `dist/`)
4. ✅ Despliega los archivos de `dist/` a producción

**No necesitas hacer nada manualmente** - Vercel lo hace todo automáticamente.

---

## 📝 **Comandos Rápidos**

### **Verificación Completa en un Solo Comando**

```bash
# PowerShell (Windows)
npm run test:run && npx tsc --noEmit && npm run format:check && npm run lint

# Bash (Linux/Mac)
npm run test:run && npx tsc --noEmit && npm run format:check && npm run lint
```

### **Auto-corregir Problemas Comunes**

```bash
# Corregir formato
npm run format

# Corregir linting
npm run lint:fix
```

---

## ✅ **Checklist Rápido Pre-Commit**

Antes de hacer commit, verifica:

- [ ] `npm run test:run` → ✅ Todos los tests pasan
- [ ] `npx tsc --noEmit` → ✅ Sin errores de tipos
- [ ] `npm run format:check` → ✅ Código formateado
- [ ] `npm run lint` → ✅ Sin errores críticos
- [ ] (Opcional) Navegador → ✅ Aplicación funciona localmente

**Si todos pasan:** ✅ **Puedes hacer commit y push con confianza**

---

## 🎯 **Resumen**

### **Antes de subir cambios:**

1. ✅ Ejecuta `npm run test:run` (verifica funcionalidad)
2. ✅ Ejecuta `npx tsc --noEmit` (verifica tipos)
3. ✅ Ejecuta `npm run format:check` (verifica formato)
4. ✅ Ejecuta `npm run lint` (verifica calidad)

### **NO necesitas:**

- ❌ Hacer `npm run build:prod` (Vercel lo hace)
- ❌ Subir archivos de `dist/` (están en `.gitignore`)
- ❌ Subir archivos `.js.map` (están en `.gitignore`)

### **GitHub Actions hace automáticamente:**

- ✅ Verifica tipos, linting, formato, tests y build
- ✅ Te notifica si algo falla

### **Vercel hace automáticamente:**

- ✅ Build de producción
- ✅ Deploy a producción

---

## 🆘 **Si Algo Falla en GitHub Actions**

1. Ve a GitHub → **Actions** → Ver el workflow que falló
2. Revisa los logs para ver qué falló
3. Corrige el problema localmente
4. Vuelve a hacer push

---

**Última actualización:** 2024
**Versión:** 1.0


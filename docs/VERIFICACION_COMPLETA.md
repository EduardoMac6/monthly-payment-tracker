# ✅ Guía de Verificación Completa - DebtLite

Guía paso a paso para verificar que todo el proyecto funciona correctamente después de cambios.

---

## 🚀 Verificación Rápida (Recomendado)

Ejecuta estos comandos en orden para verificar que todo funciona:

```bash
# 1. Verificar que todos los tests pasen
npm run test:run

# 2. Verificar que el código compile sin errores
npx tsc --noEmit

# 3. Verificar formato de código
npm run format:check

# 4. Verificar linting (solo errores críticos)
npm run lint

# 5. Verificar que el build funcione
npm run build:prod
```

**Si todos pasan:** ✅ **Todo está funcionando correctamente**

---

## 📋 Verificación Detallada

### 1. Tests (Verificación de Funcionalidad)

**Comando:**
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

### 2. Type Check (Verificación de Tipos)

**Comando:**
```bash
npx tsc --noEmit
```

**Qué verifica:**
- ✅ No hay errores de tipos TypeScript
- ✅ Todas las importaciones son correctas
- ✅ No hay variables no usadas (en modo estricto)

**Resultado esperado:**
```
(No output = éxito)
```

**Si falla:**
- Revisa los errores de tipo
- Corrige los tipos incorrectos
- Elimina variables no usadas

---

### 3. Formato de Código (Prettier)

**Comando:**
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

### 4. Linting (Calidad de Código)

**Comando:**
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

### 5. Build de Producción

**Comando:**
```bash
npm run build:prod
```

**Qué verifica:**
- ✅ TypeScript compila correctamente
- ✅ Vite genera los bundles
- ✅ Archivos estáticos se copian correctamente
- ✅ No hay errores de build

**Resultado esperado:**
```
✓ built in X.XXs
```

**Verificar archivos generados:**
```bash
# Verificar que dist/ tiene los archivos necesarios
ls dist/
# Debe incluir: index.html, scripts.js, start.js, env-config.js, pages/, assets/
```

---

## 🧪 Verificación en el Navegador

Después de verificar que todo compila, prueba la aplicación:

### Paso 1: Iniciar Servidor de Desarrollo

```bash
npm run dev
```

O si prefieres el servidor simple:

```bash
npm run start:dev
```

### Paso 2: Probar Funcionalidades

1. **Landing Page** (`http://localhost:3000/`)
   - ✅ Página carga correctamente
   - ✅ Formulario de login aparece
   - ✅ Login funciona (admin / 12345)

2. **Onboarding** (`http://localhost:3000/pages/start.html`)
   - ✅ Formulario aparece
   - ✅ Validación funciona (prueba valores inválidos)
   - ✅ Botón "Continue" funciona

3. **Dashboard** (`http://localhost:3000/pages/dashboard.html`)
   - ✅ Dashboard carga
   - ✅ Puedes crear planes
   - ✅ Puedes marcar pagos
   - ✅ Estadísticas se actualizan
   - ✅ Puedes eliminar planes
   - ✅ Tema dark/light funciona
   - ✅ Navegación entre planes funciona

---

## 🔍 Verificación de Coverage

Para ver el reporte detallado de cobertura:

```bash
npm run test:coverage
```

Luego abre `coverage/index.html` en tu navegador para ver:
- Porcentaje de cobertura por archivo
- Líneas cubiertas y no cubiertas
- Funciones probadas

**Meta:** Mantener >80% de cobertura

---

## 📊 Checklist de Verificación Pre-Commit

Antes de hacer commit, verifica:

- [ ] `npm run test:run` → ✅ Todos los tests pasan
- [ ] `npx tsc --noEmit` → ✅ Sin errores de tipos
- [ ] `npm run format:check` → ✅ Código formateado
- [ ] `npm run lint` → ✅ Sin errores críticos
- [ ] `npm run build:prod` → ✅ Build exitoso
- [ ] Navegador → ✅ Aplicación funciona

---

## 🚨 Problemas Comunes y Soluciones

### Problema: Tests fallan

**Solución:**
```bash
# Ver qué test falla específicamente
npm run test:run -- nombre-del-test

# Ejecutar tests en modo watch para debugging
npm run test:watch
```

### Problema: Errores de tipos TypeScript

**Solución:**
```bash
# Ver errores detallados
npx tsc --noEmit

# Corregir tipos según los errores
```

### Problema: Errores de formato

**Solución:**
```bash
# Auto-corregir formato
npm run format
```

### Problema: Build falla

**Solución:**
```bash
# Limpiar dist y rebuild
rm -rf dist
npm run build:prod

# Verificar que node_modules esté actualizado
npm install
```

### Problema: Linting con muchos errores

**Solución:**
```bash
# Auto-corregir lo que se pueda
npm run lint:fix

# Revisar errores restantes manualmente
```

---

## 🎯 Verificación Automática (CI/CD)

Si tienes CI/CD configurado (GitHub Actions), estos checks se ejecutan automáticamente en cada push:

1. ✅ Type Check
2. ✅ Linting
3. ✅ Format Check
4. ✅ Tests
5. ✅ Build

Puedes ver los resultados en la pestaña "Actions" de GitHub.

---

## 📝 Comandos Rápidos de Verificación

```bash
# Verificación completa en un solo comando (PowerShell)
npm run test:run && npx tsc --noEmit && npm run format:check && npm run build:prod

# O crear un script en package.json:
# "verify": "npm run test:run && npx tsc --noEmit && npm run format:check && npm run build:prod"
```

---

## ✅ Estado Actual del Proyecto

**Tests:** 145 pasando | 1 skip (146 total)
**Cobertura:** 96%
**Build:** ✅ Funcionando
**Linting:** ✅ Configurado (warnings permitidos)
**Formato:** ✅ Prettier configurado
**CI/CD:** ✅ GitHub Actions configurado

---

**Última actualización:** 2024
**Versión:** 1.0


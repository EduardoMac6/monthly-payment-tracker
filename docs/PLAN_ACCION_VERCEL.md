# 🚀 Plan de Acción: Resolver Problemas con Vercel

## 📋 Resumen del Problema

El proyecto está mostrando un error **404: NOT FOUND** en Vercel. El problema principal identificado es que los archivos HTML no se están copiando correctamente al directorio `dist` durante el build, lo que causa que Vercel no pueda servir la aplicación.

---

## 🔍 Problemas Identificados

### 1. **Archivos HTML no se copian a `dist`**
   - **Síntoma**: El directorio `dist` solo contiene archivos JS, pero no los HTML (`index.html`, `pages/start.html`, `pages/dashboard.html`)
   - **Causa**: El plugin de Vite no estaba copiando los archivos HTML explícitamente
   - **Impacto**: Vercel no puede servir la aplicación sin los archivos HTML

### 2. **Favicon 404**
   - **Síntoma**: Error en consola: `Failed to load resource: the server responded with a status of 404 ()` para `/favicon.ico`
   - **Causa**: El archivo se llama `fav.ico` pero el navegador busca `favicon.ico`
   - **Impacto**: Error menor, pero afecta la experiencia del usuario

### 3. **Posible problema de conexión GitHub-Vercel**
   - **Síntoma**: Despliegues no se ejecutan automáticamente
   - **Causa**: Puede ser configuración incorrecta en Vercel o permisos de GitHub
   - **Impacto**: No hay despliegues automáticos cuando se hace push

---

## ✅ Soluciones Implementadas

### 1. **Actualización de `vite.config.ts`**
   - ✅ Agregada función `copyDirSync` multiplataforma para copiar directorios
   - ✅ Actualizado plugin `copyAssetsPlugin` para copiar:
     - Directorio `assets/` completo
     - Directorio `pages/` con todos los HTML
     - Archivo `fav.ico`
     - Verificación de `index.html` en dist

### 2. **Actualización de `vercel.json`**
   - ✅ Agregado rewrite para `/favicon.ico` → `/fav.ico`
   - ✅ Mantenidos los rewrites existentes para assets, pages y js
   - ✅ Mantenido el catch-all para SPA routing

---

## 📝 Pasos para Resolver el Problema

### **Paso 1: Verificar el Build Localmente**

```bash
# Limpiar el directorio dist
rm -rf dist

# Ejecutar el build de producción
npm run build:prod

# Verificar que los archivos HTML estén en dist
ls -la dist/
ls -la dist/pages/
```

**Resultado esperado:**
- ✅ `dist/index.html` existe
- ✅ `dist/pages/start.html` existe
- ✅ `dist/pages/dashboard.html` existe
- ✅ `dist/assets/` contiene todos los assets
- ✅ `dist/fav.ico` existe

### **Paso 2: Probar el Build Localmente**

```bash
# Probar el build con un servidor local
npm run preview

# O usar el servidor de prueba
npm run serve
```

**Verificar:**
- ✅ La aplicación carga correctamente en `http://localhost:3000`
- ✅ Las rutas `/pages/start.html` y `/pages/dashboard.html` funcionan
- ✅ No hay errores 404 en la consola del navegador

### **Paso 3: Verificar la Conexión GitHub-Vercel**

#### 3.1. Verificar en Vercel Dashboard

1. Ir a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Seleccionar el proyecto `monthly-payment-tracker`
3. Ir a **Settings** → **Git**
4. Verificar que:
   - ✅ El repositorio está conectado correctamente
   - ✅ La rama de producción es `main` (o la correcta)
   - ✅ Los webhooks de GitHub están activos

#### 3.2. Verificar Permisos de GitHub

1. Ir a [github.com/settings/installations](https://github.com/settings/installations)
2. Buscar "Vercel" en las aplicaciones instaladas
3. Verificar que:
   - ✅ Vercel tiene acceso al repositorio `EduardoMac6/monthly-payment-tracker`
   - ✅ Los permisos incluyen: `Contents`, `Metadata`, `Pull requests`

#### 3.3. Reconectar si es Necesario

Si hay problemas con la conexión:

1. En Vercel Dashboard → **Settings** → **Git**
2. Click en **Disconnect** (si está conectado)
3. Click en **Connect Git Repository**
4. Seleccionar `EduardoMac6/monthly-payment-tracker`
5. Autorizar los permisos necesarios

### **Paso 4: Hacer Commit y Push de los Cambios**

```bash
# Verificar los cambios
git status

# Agregar los archivos modificados
git add vite.config.ts vercel.json

# Hacer commit
git commit -m "fix: corregir copia de archivos HTML a dist y configuración de Vercel

- Agregar función copyDirSync multiplataforma para copiar directorios
- Actualizar plugin copyAssetsPlugin para copiar HTML y assets
- Agregar rewrite para favicon.ico en vercel.json
- Asegurar que todos los archivos estáticos se copien correctamente"

# Push a GitHub
git push origin main
```

### **Paso 5: Verificar el Despliegue en Vercel**

1. Ir a Vercel Dashboard → **Deployments**
2. Verificar que se inició un nuevo despliegue automáticamente
3. Esperar a que termine el build (2-3 minutos)
4. Verificar los logs del build:
   - ✅ No debe haber errores
   - ✅ Debe mostrar que los archivos se copiaron correctamente
5. Click en el deployment para ver la URL
6. Probar la aplicación:
   - ✅ La página principal carga
   - ✅ Las rutas `/pages/start.html` y `/pages/dashboard.html` funcionan
   - ✅ No hay errores 404 en la consola

### **Paso 6: Verificar el Despliegue Manual (si es necesario)**

Si el despliegue automático no funciona:

```bash
# Instalar Vercel CLI (si no está instalado)
npm install -g vercel

# Iniciar sesión
vercel login

# Desplegar manualmente
vercel --prod
```

---

## 🔧 Solución de Problemas Adicionales

### **Problema: Build falla en Vercel**

**Posibles causas:**
- Variables de entorno faltantes
- Dependencias no instaladas
- Errores de TypeScript

**Solución:**
1. Revisar los logs del build en Vercel Dashboard
2. Verificar que `package.json` tenga todas las dependencias
3. Verificar que no haya errores de TypeScript: `npm run build`

### **Problema: Archivos HTML no se copian en Vercel**

**Posibles causas:**
- El plugin no se ejecuta correctamente
- Permisos de archivos en Vercel

**Solución:**
1. Verificar los logs del build en Vercel
2. Asegurarse de que el plugin `copyAssetsPlugin` se ejecute en `writeBundle`
3. Verificar que los comandos de Node.js funcionen en el entorno de Vercel

### **Problema: Rutas no funcionan (404)**

**Posibles causas:**
- Configuración incorrecta de `vercel.json`
- Rutas relativas incorrectas en los HTML

**Solución:**
1. Verificar que `vercel.json` tenga los rewrites correctos
2. Verificar que `vite.config.ts` tenga `base: '/'`
3. Verificar que las rutas en los HTML sean relativas o absolutas según corresponda

### **Problema: Conexión GitHub-Vercel no funciona**

**Posibles causas:**
- Permisos de GitHub revocados
- Webhook de GitHub desactivado
- Repositorio movido o renombrado

**Solución:**
1. Reconectar el repositorio en Vercel
2. Verificar permisos en GitHub Settings → Applications
3. Verificar que el repositorio existe y es accesible

---

## 📊 Checklist de Verificación

### Antes del Despliegue
- [ ] Build local funciona: `npm run build:prod`
- [ ] Archivos HTML están en `dist/`
- [ ] Preview local funciona: `npm run preview`
- [ ] No hay errores de TypeScript: `npm run build`
- [ ] No hay errores de linting: `npm run lint`

### Después del Despliegue
- [ ] El despliegue se completó exitosamente
- [ ] La página principal carga correctamente
- [ ] Las rutas `/pages/start.html` y `/pages/dashboard.html` funcionan
- [ ] No hay errores 404 en la consola del navegador
- [ ] El favicon carga correctamente
- [ ] Los assets (CSS, imágenes) cargan correctamente

### Configuración de Vercel
- [ ] Repositorio conectado correctamente
- [ ] Build command: `npm run build:prod`
- [ ] Output directory: `dist`
- [ ] Framework: `Other` o `null`
- [ ] Variables de entorno configuradas (si es necesario)

---

## 🎯 Resultado Esperado

Después de seguir este plan:

1. ✅ Los archivos HTML se copian correctamente a `dist` durante el build
2. ✅ Vercel puede servir la aplicación sin errores 404
3. ✅ La conexión GitHub-Vercel funciona correctamente
4. ✅ Los despliegues automáticos se ejecutan cuando se hace push
5. ✅ La aplicación está disponible y funcional en la URL de Vercel

---

## 📚 Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Guía de Vite en Vercel](https://vercel.com/guides/deploying-vite-with-vercel)
- [Configuración de rewrites en Vercel](https://vercel.com/docs/concepts/projects/vercel-json#rewrites)
- [Variables de Entorno en Vercel](https://vercel.com/docs/concepts/projects/environment-variables)

---

## 🆘 Si el Problema Persiste

1. **Revisar los logs completos del build en Vercel Dashboard**
2. **Probar el build localmente con el mismo comando que usa Vercel**
3. **Verificar que la versión de Node.js en Vercel sea compatible** (Settings → General → Node.js Version)
4. **Contactar soporte de Vercel** si el problema es específico de su plataforma

---

**Última actualización**: $(date)
**Estado**: En progreso




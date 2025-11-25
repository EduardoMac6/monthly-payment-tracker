# ✅ Guía para Verificar Deployment en Vercel

Guía paso a paso para verificar que el deployment en Vercel funciona correctamente.

---

## 🔍 Verificación Local (Antes de Deploy)

### 1. Verificar que el Build Funciona

```bash
npm run build:prod
```

**✅ Debe mostrar:**
- Build exitoso sin errores
- Mensaje "✅ Static files copied successfully!"
- Archivos en `dist/`:
  - `index.html`
  - `pages/dashboard.html`
  - `pages/start.html`
  - `fav.ico`
  - `assets/` (directorio completo)
  - `scripts.js`, `start.js`
  - `env-config.js`

### 2. Verificar Archivos en `dist/`

```bash
# Windows PowerShell
Get-ChildItem -Path dist -Recurse -File | Select-Object FullName

# Linux/Mac
find dist -type f
```

**✅ Archivos críticos que DEBEN existir:**
- ✅ `dist/index.html`
- ✅ `dist/pages/dashboard.html`
- ✅ `dist/pages/start.html`
- ✅ `dist/fav.ico`
- ✅ `dist/scripts.js`
- ✅ `dist/start.js`
- ✅ `dist/env-config.js`
- ✅ `dist/assets/` (directorio con CSS, imágenes, JS)

### 3. Probar Build Localmente

```bash
npm run preview
```

O usar un servidor HTTP simple:
```bash
cd dist
python -m http.server 8000
# O
npx serve dist
```

Abre `http://localhost:8000` y verifica:
- ✅ La landing page carga (`index.html`)
- ✅ Puedes navegar a `/pages/start.html`
- ✅ Puedes navegar a `/pages/dashboard.html`
- ✅ Los scripts cargan sin errores (revisa la consola del navegador)

---

## 🌐 Verificación en Vercel Dashboard

### 1. Acceder al Dashboard de Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión
3. Selecciona tu proyecto

### 2. Verificar el Último Deployment

**En la página principal del proyecto:**

✅ **Estado del Deployment:**
- Debe mostrar "Ready" (verde) o "Building" (amarillo)
- Si muestra "Error" (rojo), haz click para ver los logs

✅ **Último Commit:**
- Debe mostrar el commit más reciente (con el fix de `copy-static.js`)
- Verifica que el commit sea `25cb61f` o más reciente

### 3. Verificar Logs del Build

**Haz click en el deployment → "View Build Logs"**

**✅ Debe mostrar:**
```
✓ Building...
✓ Installing dependencies...
✓ Running build command: npm run build:prod
✓ Build completed successfully
✓ Copying static files to dist...
✓ Static files copied successfully!
```

**❌ Si ves errores:**
- `Failed to resolve ../scripts.js` → Problema con rutas en HTML
- `404: NOT FOUND` → Archivos no copiados a `dist/`
- `Build failed` → Revisa los logs completos

---

## 🌍 Verificación en Producción (URL Live)

### 1. Acceder a la URL de Producción

**En el dashboard de Vercel:**
- Haz click en "Visit" o copia la URL de producción
- Ejemplo: `https://tu-proyecto.vercel.app`

### 2. Verificar Landing Page

**Abre la URL raíz:**
- ✅ Debe cargar `index.html` sin errores
- ✅ No debe mostrar 404
- ✅ La página debe verse correctamente
- ✅ Revisa la consola del navegador (F12) - NO debe haber errores 404

### 3. Verificar Páginas

**Navega a:**
- ✅ `https://tu-proyecto.vercel.app/pages/start.html` → Debe cargar
- ✅ `https://tu-proyecto.vercel.app/pages/dashboard.html` → Debe cargar

**❌ Si ves 404:**
- Verifica que `vercel.json` tenga los rewrites correctos
- Verifica que los archivos estén en `dist/pages/`

### 4. Verificar Assets

**Abre en el navegador:**
- ✅ `https://tu-proyecto.vercel.app/fav.ico` → Debe mostrar el favicon
- ✅ `https://tu-proyecto.vercel.app/env-config.js` → Debe mostrar el código JS
- ✅ `https://tu-proyecto.vercel.app/assets/css/shared.css` → Debe mostrar CSS

**❌ Si ves 404:**
- Verifica que `vercel.json` tenga rewrites para `/assets/`
- Verifica que los archivos estén en `dist/assets/`

### 5. Verificar Funcionalidad

**En cada página:**
- ✅ Los scripts deben cargar (revisa Network tab en DevTools)
- ✅ No debe haber errores en la consola
- ✅ La aplicación debe funcionar (crear planes, marcar pagos, etc.)

---

## 🔧 Checklist de Verificación Completa

### Build Local
- [ ] `npm run build:prod` ejecuta sin errores
- [ ] Todos los archivos están en `dist/`
- [ ] `npm run preview` funciona localmente

### Vercel Dashboard
- [ ] Último deployment muestra "Ready"
- [ ] Build logs muestran éxito
- [ ] No hay errores en los logs

### Producción (URL Live)
- [ ] Landing page (`/`) carga correctamente
- [ ] Página de onboarding (`/pages/start.html`) carga
- [ ] Dashboard (`/pages/dashboard.html`) carga
- [ ] Favicon (`/fav.ico`) se muestra
- [ ] Assets (`/assets/*`) cargan
- [ ] Scripts (`/scripts.js`, `/start.js`) cargan
- [ ] No hay errores 404 en la consola
- [ ] La aplicación funciona correctamente

---

## 🐛 Solución de Problemas Comunes

### Error 404 en todas las páginas

**Causa:** Archivos HTML no copiados a `dist/`

**Solución:**
1. Verifica que `scripts/copy-static.js` existe
2. Verifica que `package.json` tiene `&& node scripts/copy-static.js` en build scripts
3. Ejecuta `npm run build:prod` localmente y verifica `dist/`

### Error 404 en assets

**Causa:** Rewrites incorrectos en `vercel.json`

**Solución:**
1. Verifica que `vercel.json` tiene rewrites para `/assets/`
2. Verifica que los archivos están en `dist/assets/`

### Scripts no cargan

**Causa:** Rutas incorrectas en HTML o scripts no compilados

**Solución:**
1. Verifica que `dist/scripts.js` y `dist/start.js` existen
2. Verifica que los HTML usan rutas relativas correctas (`../scripts.js`)
3. Revisa la consola del navegador para ver qué archivos faltan

---

## 📝 Notas Importantes

- **Vercel despliega automáticamente** cuando haces push a la rama conectada
- **Los cambios pueden tardar 1-2 minutos** en aparecer en producción
- **Siempre verifica localmente** antes de hacer push
- **Revisa los logs** si algo falla en producción

---

**Última actualización:** 2024-11-24


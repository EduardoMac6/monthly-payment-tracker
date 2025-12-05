# 🚀 Guía de Despliegue en Vercel - DebtLite

Guía paso a paso para desplegar el proyecto en Vercel.

---

## 📋 Requisitos Previos

- Cuenta en [Vercel](https://vercel.com) (gratis)
- Proyecto en GitHub, GitLab o Bitbucket (opcional, pero recomendado)
- Node.js instalado localmente (para probar el build)

---

## 🎯 Opción 1: Despliegue desde GitHub (Recomendado)

### Paso 1: Subir el proyecto a GitHub

Si aún no tienes el proyecto en GitHub:

```bash
# 1. Crear repositorio en GitHub
# 2. Agregar remote
git remote add origin https://github.com/tu-usuario/monthly-payment-tracker.git

# 3. Subir código
git push -u origin main
```

### Paso 2: Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Click en **"Add New Project"**
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente la configuración:
   - **Framework Preset**: Vite (detectado automáticamente desde `vercel.json`)
   - **Build Command**: `npm run build:prod`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Paso 3: Configurar Variables de Entorno (Opcional)

El proyecto puede funcionar sin variables de entorno (usa valores por defecto), pero puedes configurarlas para personalizar:

1. En la configuración del proyecto en Vercel
2. Ve a **Settings** → **Environment Variables**
3. Agrega las variables (prefijo `VITE_` es importante):
   
   **Para localStorage (default):**
   ```
   VITE_APP_NAME=DebtLite
   VITE_STORAGE_TYPE=localStorage
   VITE_MAX_PLANS=50
   VITE_MAX_PLAN_AMOUNT=1000000000
   VITE_MAX_PLAN_MONTHS=120
   ```
   
   **Para API backend:**
   ```
   VITE_APP_NAME=DebtLite
   VITE_STORAGE_TYPE=api
   VITE_API_URL=https://api.tudominio.com/api
   VITE_MAX_PLANS=50
   VITE_MAX_PLAN_AMOUNT=1000000000
   VITE_MAX_PLAN_MONTHS=120
   ```
   
   **Para Supabase:**
   ```
   VITE_APP_NAME=DebtLite
   VITE_STORAGE_TYPE=supabase
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_MAX_PLANS=50
   VITE_MAX_PLAN_AMOUNT=1000000000
   VITE_MAX_PLAN_MONTHS=120
   ```
   
   **Nota sobre Supabase:** Para obtener las credenciales de Supabase:
   1. Ve a [Supabase Dashboard](https://app.supabase.com)
   2. Selecciona tu proyecto → **Project Settings** → **API**
   3. Copia **Project URL** como `VITE_SUPABASE_URL`
   4. Copia **anon public** (bajo "Project API keys") como `VITE_SUPABASE_ANON_KEY`

**Nota:** El plugin de Vite lee automáticamente estas variables de `process.env` durante el build, así que se inyectarán correctamente en `dist/env-config.js`.

### Paso 4: Desplegar

1. Click en **"Deploy"**
2. Espera a que termine el build (2-3 minutos)
3. ¡Listo! Tu app estará disponible en `https://tu-proyecto.vercel.app`

---

## 🎯 Opción 2: Despliegue desde CLI (Rápido)

### Paso 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

### Paso 2: Iniciar sesión

```bash
vercel login
```

### Paso 3: Desplegar

```bash
# Desde la raíz del proyecto
vercel

# Para producción
vercel --prod
```

Vercel CLI te hará algunas preguntas:
- **Set up and deploy?** → Yes
- **Which scope?** → Tu cuenta
- **Link to existing project?** → No (primera vez)
- **Project name?** → monthly-payment-tracker (o el que prefieras)
- **Directory?** → ./ (raíz)
- **Override settings?** → No (usa vercel.json)

---

## ⚙️ Configuración del Proyecto

El archivo `vercel.json` ya está configurado con:

- ✅ Framework: `vite` (para mejor detección y optimización)
- ✅ Build command: `npm run build:prod`
- ✅ Output directory: `dist`
- ✅ Rewrites para routing (SPA) con soporte para assets y páginas
- ✅ Headers de cache para assets
- ✅ Base path configurado como `/` (rutas absolutas)

**Importante:** El proyecto usa `base: '/'` en `vite.config.ts` para generar rutas absolutas que funcionan correctamente en Vercel. El `framework: "vite"` en `vercel.json` permite que Vercel optimice automáticamente el build y la detección de configuración.

### Estructura de Archivos en Vercel

```
dist/
├── index.html          → Landing page
├── pages/
│   ├── start.html     → Onboarding
│   └── dashboard.html → Dashboard
├── scripts.js          → Main bundle
├── start.js           → Start page bundle
├── env-config.js      → Environment variables
├── js/                → Code-split chunks
└── assets/            → CSS, imágenes, etc.
```

---

## 🤖 Configuración de GitHub Actions (Deployment Automático)

Si quieres que el proyecto se despliegue automáticamente a Vercel cuando hagas push a `main`, necesitas configurar los siguientes secrets en GitHub:

### Paso 1: Obtener el Token de Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/account/tokens)
2. Click en **"Create Token"**
3. Dale un nombre (ej: "GitHub Actions")
4. Copia el token generado

### Paso 2: Obtener el Project ID

1. Ve a tu proyecto en Vercel Dashboard
2. Ve a **Settings** → **General**
3. En la sección **"Project ID"**, copia el ID

### Paso 3: Obtener el Team Slug (Opcional, pero recomendado)

El **Team Slug** es el nombre de tu equipo/organización en Vercel (no el ID).

1. Si estás en un equipo, el slug aparece en la URL: `https://vercel.com/[TEAM_SLUG]/projects`
2. Si es tu cuenta personal, el slug es tu nombre de usuario
3. También puedes obtenerlo ejecutando: `vercel teams ls` (si tienes Vercel CLI instalado)

### Paso 4: Configurar Secrets en GitHub

1. Ve a tu repositorio en GitHub
2. Ve a **Settings** → **Secrets and variables** → **Actions**
3. Agrega los siguientes secrets:

   - **`VERCEL_TOKEN`**: El token que obtuviste en el Paso 1
   - **`VERCEL_PROJECT_ID`**: El Project ID del Paso 2
   - **`VERCEL_ORG_SLUG`**: El Team Slug del Paso 3 (opcional, pero recomendado)

**Nota:** Si no configuras `VERCEL_ORG_SLUG`, el workflow intentará auto-detectar el equipo desde el token, pero puede fallar si tienes múltiples equipos.

### Paso 5: Verificar el Deployment

Una vez configurados los secrets, cada push a `main` desplegará automáticamente a Vercel. Puedes ver el progreso en:
- **GitHub**: Actions tab → CD workflow
- **Vercel**: Dashboard → Deployments

---

## 🔧 Solución de Problemas

### Error: "The specified scope does not exist"

**Causa**: El `VERCEL_ORG_ID` o `VERCEL_ORG_SLUG` está incorrecto o no existe.

**Solución**:
1. Verifica que `VERCEL_ORG_SLUG` en GitHub Secrets sea el **slug del equipo** (nombre), no el ID
2. Si es tu cuenta personal, usa tu nombre de usuario como slug
3. Puedes eliminar `VERCEL_ORG_SLUG` y dejar que Vercel lo auto-detecte desde el token (si solo tienes un equipo)

### Error: "Build failed"

**Causa común**: Variables de entorno faltantes

**Solución**:
1. Verifica que `.env.production` exista o
2. Agrega variables en Vercel Dashboard → Settings → Environment Variables

### Error: "404 en rutas"

**Causa**: Vercel no está redirigiendo correctamente o rutas relativas incorrectas

**Solución**: 
1. Verifica que `vercel.json` esté en la raíz del proyecto
2. Verifica que `vite.config.ts` tenga `base: '/'` (no `base: './'`)
3. El `vercel.json` incluye rewrites específicos para `/assets/`, `/js/`, y `/pages/` antes del catch-all
4. Rebuild el proyecto: `npm run build:prod`

### Error: "Module not found"

**Causa**: Dependencias no instaladas

**Solución**: Verifica que `package.json` tenga todas las dependencias necesarias.

---

## 📊 Monitoreo y Analytics

Vercel incluye gratis:

- ✅ Analytics de visitas
- ✅ Logs de errores
- ✅ Métricas de rendimiento
- ✅ Deploy previews (para cada PR)

---

## 🔄 Actualizaciones Automáticas

Una vez conectado con GitHub:

- ✅ Cada push a `main` → Deploy automático a producción
- ✅ Cada PR → Deploy preview (URL temporal)
- ✅ Rollback fácil desde el dashboard

---

## 💰 Costos

**Plan Gratis de Vercel incluye:**
- ✅ 100 GB de ancho de banda/mes
- ✅ Deploys ilimitados
- ✅ SSL automático
- ✅ Dominio personalizado (opcional)
- ✅ CDN global

**Suficiente para proyectos personales y pequeños.**

---

## 🎉 ¡Listo!

Tu aplicación estará disponible en:
- **Producción**: `https://tu-proyecto.vercel.app`
- **Preview**: `https://tu-proyecto-git-branch.vercel.app`

---

## 📚 Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Guía de Vite en Vercel](https://vercel.com/guides/deploying-vite-with-vercel)
- [Variables de Entorno en Vercel](https://vercel.com/docs/concepts/projects/environment-variables)

---

**¿Problemas?** Revisa los logs en Vercel Dashboard → Deployments → [Tu deploy] → Logs


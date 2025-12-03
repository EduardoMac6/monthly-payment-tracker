# 🔧 Variables de Entorno - DebtLite

Guía para configurar y usar variables de entorno en el proyecto.

---

## 📋 Variables Disponibles

| Variable | Descripción | Valor por Defecto | Ejemplo |
|----------|-------------|-------------------|---------|
| `VITE_APP_NAME` | Nombre de la aplicación | `DebtLite` | `DebtLite (Dev)` |
| `VITE_STORAGE_TYPE` | Tipo de almacenamiento | `localStorage` | `localStorage`, `api`, o `supabase` |
| `VITE_API_URL` | URL del API (requerido si `VITE_STORAGE_TYPE=api`) | `http://localhost:3000/api` | `https://api.debtlite.com/api` |
| `VITE_SUPABASE_URL` | URL del proyecto Supabase (requerido si `VITE_STORAGE_TYPE=supabase`) | `` | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima de Supabase (requerido si `VITE_STORAGE_TYPE=supabase`) | `` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_MAX_PLANS` | Máximo número de planes | `50` | `100` |
| `VITE_MAX_PLAN_AMOUNT` | Monto máximo por plan | `1000000000` | `5000000000` |
| `VITE_MAX_PLAN_MONTHS` | Máximo número de meses | `120` | `240` |

---

## 🚀 Configuración Rápida

### 1. Crear archivos de entorno

Copia `.env.example` y crea tus archivos de entorno:

```bash
# Desarrollo
cp .env.example .env.development

# Producción
cp .env.example .env.production
```

### 2. Editar variables

Abre el archivo correspondiente (`.env.development` o `.env.production`) y ajusta los valores según necesites.

**Ejemplo `.env.development` (localStorage):**
```env
VITE_APP_NAME=DebtLite (Dev)
VITE_STORAGE_TYPE=localStorage
VITE_API_URL=http://localhost:3000/api
VITE_MAX_PLANS=50
VITE_MAX_PLAN_AMOUNT=1000000000
VITE_MAX_PLAN_MONTHS=120
```

**Ejemplo `.env.development` (API):**
```env
VITE_APP_NAME=DebtLite (Dev)
VITE_STORAGE_TYPE=api
VITE_API_URL=http://localhost:3000/api
VITE_MAX_PLANS=50
VITE_MAX_PLAN_AMOUNT=1000000000
VITE_MAX_PLAN_MONTHS=120
```

**Ejemplo `.env.development` (Supabase):**
```env
VITE_APP_NAME=DebtLite (Dev)
VITE_STORAGE_TYPE=supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_MAX_PLANS=50
VITE_MAX_PLAN_AMOUNT=1000000000
VITE_MAX_PLAN_MONTHS=120
```

**Nota:** Cuando `VITE_STORAGE_TYPE=api`, asegúrate de que `VITE_API_URL` apunte a un servidor API válido. La aplicación mostrará un indicador de estado de conexión y sincronizará automáticamente las operaciones cuando esté offline.

**Nota:** Cuando `VITE_STORAGE_TYPE=supabase`, asegúrate de que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén configurados correctamente. Puedes obtener estas credenciales desde tu proyecto en [Supabase Dashboard](https://app.supabase.com) → Project Settings → API.

### 3. Compilar con variables de entorno

```bash
# Desarrollo
npm run build:dev

# Producción
npm run build:prod
```

Esto compilará TypeScript e inyectará las variables de entorno en `dist/env-config.js`.

### 4. Incluir en HTML

Agrega el script de configuración **antes** de tu script principal:

```html
<!-- Inyectar variables de entorno -->
<script src="../dist/env-config.js"></script>

<!-- Tu script principal -->
<script type="module" src="../dist/scripts.js"></script>
```

---

## 📝 Uso en Código

### Importar configuración

```typescript
import { env, getAppName, getMaxPlans } from './config/env.config.js';

// Usar objeto env
console.log(env.VITE_APP_NAME);
console.log(env.VITE_MAX_PLANS);

// O usar funciones helper
const appName = getAppName();
const maxPlans = getMaxPlans();
```

### Ejemplo: Validación con límites

```typescript
import { getMaxPlanAmount } from './config/env.config.js';

function validateAmount(amount: number): boolean {
    const maxAmount = getMaxPlanAmount();
    return amount <= maxAmount;
}
```

---

## 🔌 Configuración API (Fase 4)

Cuando `VITE_STORAGE_TYPE=api`, la aplicación usa `ApiStorageService` para conectarse a un backend API.

### Requisitos

1. **Servidor API funcionando**: El servidor debe estar corriendo y accesible en la URL especificada en `VITE_API_URL`
2. **Endpoints implementados**: El API debe implementar los siguientes endpoints:
   - `GET /api/plans` - Listar todos los planes
   - `POST /api/plans` - Crear nuevo plan
   - `PUT /api/plans/:id` - Actualizar plan
   - `DELETE /api/plans/:id` - Eliminar plan
   - `POST /api/plans/bulk` - Guardar múltiples planes
   - `GET /api/plans/:id/payments` - Obtener estado de pagos
   - `PUT /api/plans/:id/payments` - Actualizar estado de pagos
   - `GET /api/plans/:id/totals` - Obtener totales de pagos
   - `PUT /api/plans/:id/totals` - Actualizar totales de pagos

### Características

- **Sincronización offline**: Las operaciones se encolan cuando no hay conexión y se sincronizan automáticamente cuando vuelve
- **Indicador de conexión**: El dashboard muestra un indicador visual del estado de conexión
- **Retry automático**: El HttpClient reintenta automáticamente en caso de errores transitorios (5xx, 429)
- **Fallback a localStorage**: `getActivePlanId` y `setActivePlanId` usan localStorage como fallback (estado de UI)

### Ejemplo de configuración

```env
VITE_STORAGE_TYPE=api
VITE_API_URL=http://localhost:3000/api
```

**Nota**: Si el API no está disponible, la aplicación mostrará errores. Asegúrate de tener el servidor corriendo antes de cambiar a modo API.

## 🗄️ Configuración Supabase

Cuando `VITE_STORAGE_TYPE=supabase`, la aplicación usa `SupabaseStorageService` para conectarse a Supabase como backend.

### Requisitos

1. **Proyecto Supabase creado**: Debes tener un proyecto en [Supabase](https://supabase.com)
2. **Credenciales obtenidas**: Necesitas la URL del proyecto y la clave anónima (anon key)
3. **Tablas configuradas**: Las tablas necesarias se crean automáticamente o puedes configurarlas manualmente

### Obtener Credenciales de Supabase

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto (o crea uno nuevo)
3. Ve a **Project Settings** → **API**
4. Copia los siguientes valores:
   - **Project URL** → Usa como `VITE_SUPABASE_URL`
   - **anon public** (bajo "Project API keys") → Usa como `VITE_SUPABASE_ANON_KEY`

### Características

- **Autenticación integrada**: Supabase maneja autenticación de usuarios automáticamente
- **Persistencia de sesión**: Las sesiones se persisten automáticamente
- **Auto-refresh de tokens**: Los tokens se renuevan automáticamente
- **Detección de sesión en URL**: Soporte para autenticación mediante enlaces
- **Base de datos en tiempo real**: Soporte para actualizaciones en tiempo real (si se configura)

### Seguridad

**Importante sobre la anon key:**
- La `anon key` es **pública** y está diseñada para usarse en el cliente
- Es segura exponerla en el código frontend
- Supabase usa Row Level Security (RLS) para proteger los datos
- **NUNCA** uses la `service_role` key en el frontend (es un secreto del servidor)

### Ejemplo de configuración

```env
VITE_STORAGE_TYPE=supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Nota**: Si las credenciales de Supabase no están configuradas o son inválidas, la aplicación mostrará errores. Asegúrate de tener un proyecto Supabase activo antes de cambiar a modo Supabase.

## 🔄 Flujo de Trabajo

### Desarrollo

1. Edita `.env.development`
2. Ejecuta `npm run build:dev`
3. Incluye `dist/env-config.js` en tu HTML
4. Reinicia el servidor: `npm run start:dev`

### Producción

1. Edita `.env.production`
2. Ejecuta `npm run build:prod`
3. Incluye `dist/env-config.js` en tu HTML
4. Despliega

---

## ⚠️ Notas Importantes

### Seguridad

- **NUNCA** subas archivos `.env.development` o `.env.production` al repositorio
- Solo `.env.example` debe estar en el repositorio
- Las variables se inyectan en el cliente, así que **no uses secretos** aquí

### Valores por Defecto

Si no se proporcionan variables de entorno, el sistema usará valores por defecto definidos en `src/config/env.config.ts`.

### Compatibilidad

- El sistema lee de `window.__ENV__` (inyectado por el script)
- También soporta `import.meta.env` (si usas Vite en el futuro)
- Si ninguna está disponible, usa valores por defecto

### Variables en Vercel/CI/CD

**Importante:** El plugin de Vite (`vite-plugin-inject-env.ts`) lee variables de entorno en este orden de prioridad:

1. **`process.env`** (variables del sistema) - Usado por Vercel y CI/CD
2. **Archivo `.env.production`** o `.env.development` - Para desarrollo local
3. **Valores por defecto** - Si no se encuentran las anteriores

Esto significa que:
- ✅ En Vercel, puedes configurar variables en Settings → Environment Variables
- ✅ El plugin las detectará automáticamente durante el build
- ✅ No necesitas crear archivo `.env.production` en el repositorio
- ✅ Las variables de Vercel tienen prioridad sobre archivos `.env`

---

## 🛠️ Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run build` | Compila TypeScript (sin variables de entorno) |
| `npm run build:dev` | Compila + inyecta variables de desarrollo |
| `npm run build:prod` | Compila + inyecta variables de producción |
| `npm run start:dev` | Build dev + inicia servidor |
| `npm run start:prod` | Build prod + inicia servidor |

---

## 📚 Archivos Relacionados

- `src/config/env.config.ts` - Configuración de variables de entorno
- `src/config/storage.config.ts` - Usa `VITE_STORAGE_TYPE`
- `src/config/supabase.config.ts` - Configuración del cliente Supabase
- `src/services/storage/supabase.service.ts` - Servicio de storage para Supabase
- `src/utils/validators.ts` - Usa `VITE_MAX_PLAN_AMOUNT` y `VITE_MAX_PLAN_MONTHS`
- `src/services/plans/plans.service.ts` - Usa `VITE_MAX_PLANS`
- `scripts/inject-env.js` - Script para inyectar variables

---

## 🐛 Troubleshooting

### Las variables no se cargan

1. Verifica que `dist/env-config.js` existe
2. Verifica que el script se carga antes de `scripts.js`
3. Revisa la consola del navegador para errores

### Valores por defecto siempre

Si siempre se usan valores por defecto:
- Verifica que ejecutaste `npm run build:dev` o `build:prod`
- Verifica que `dist/env-config.js` contiene las variables
- Verifica que el script se carga en el HTML

---

**Última actualización:** 2024


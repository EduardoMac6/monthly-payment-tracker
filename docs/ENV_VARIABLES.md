# 🔧 Variables de Entorno - DebtLite

Guía para configurar y usar variables de entorno en el proyecto.

---

## 📋 Variables Disponibles

| Variable | Descripción | Valor por Defecto | Ejemplo |
|----------|-------------|-------------------|---------|
| `VITE_APP_NAME` | Nombre de la aplicación | `DebtLite` | `DebtLite (Dev)` |
| `VITE_STORAGE_TYPE` | Tipo de almacenamiento | `localStorage` | `localStorage` o `api` |
| `VITE_API_URL` | URL del API (futuro) | `http://localhost:3000/api` | `https://api.debtlite.com/api` |
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

**Ejemplo `.env.development`:**
```env
VITE_APP_NAME=DebtLite (Dev)
VITE_STORAGE_TYPE=localStorage
VITE_API_URL=http://localhost:3000/api
VITE_MAX_PLANS=50
VITE_MAX_PLAN_AMOUNT=1000000000
VITE_MAX_PLAN_MONTHS=120
```

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


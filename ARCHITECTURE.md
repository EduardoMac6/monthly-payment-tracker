# 🏗️ Arquitectura del Proyecto - DebtLite

Documentación técnica sobre la arquitectura, estructura y decisiones de diseño del proyecto.

---

## 📋 Tabla de Contenidos

- [Visión General](#visión-general)
- [Arquitectura de Alto Nivel](#arquitectura-de-alto-nivel)
- [Estructura de Directorios](#estructura-de-directorios)
- [Patrones de Diseño](#patrones-de-diseño)
- [Flujo de Datos](#flujo-de-datos)
- [Gestión de Estado](#gestión-de-estado)
- [Persistencia de Datos](#persistencia-de-datos)
- [Build y Deployment](#build-y-deployment)

---

## 🎯 Visión General

DebtLite es una aplicación web **SPA (Single Page Application)** construida con **TypeScript**, que utiliza una arquitectura **modular** y **orientada a servicios** para gestionar planes de pago.

### Principios de Diseño

1. **Separación de Responsabilidades** - Cada módulo tiene una responsabilidad clara
2. **Abstracción** - Interfaces permiten cambiar implementaciones fácilmente
3. **Testabilidad** - Código diseñado para ser fácil de testear
4. **Escalabilidad** - Preparado para crecer sin grandes refactorizaciones
5. **Mantenibilidad** - Código claro y bien documentado

---

## 🏛️ Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────┐
│                  HTML Pages                      │
│  (index.html, pages/start.html,                │
│   pages/dashboard.html)                          │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│              Page Controllers                    │
│  (DashboardPage, StartPage)                     │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│              UI Components                      │
│  (PaymentTable, PlanList, ThemeToggle, Toast)   │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│              Business Services                   │
│  (PlansService, PaymentsService)                 │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│           Storage Abstraction                    │
│  (IStorageService interface)                     │
└──────────────────┬──────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌──────────────┐    ┌──────────────────┐
│ localStorage │    │  API Service     │
│  Service     │    │  (Future)        │
└──────────────┘    └──────────────────┘
```

---

## 📂 Estructura de Directorios

### Estructura Completa

```
monthly-payment-tracker/
├── src/                          # Código fuente TypeScript
│   ├── components/              # Componentes UI
│   │   ├── form-validator/      # Validación de formularios
│   │   ├── payment-table/       # Tabla de pagos
│   │   ├── plan-list/           # Lista de planes
│   │   ├── theme-toggle/        # Toggle de tema
│   │   ├── toast/               # Notificaciones
│   │   └── index.ts             # Exportaciones
│   │
│   ├── pages/                   # Controladores de páginas
│   │   ├── dashboard/           # Página del dashboard
│   │   ├── start/               # Página de onboarding
│   │   └── index.ts
│   │
│   ├── services/                # Lógica de negocio
│   │   ├── plans/               # Gestión de planes
│   │   │   ├── plans.service.ts
│   │   │   ├── plans.service.test.ts
│   │   │   └── index.ts
│   │   ├── payments/            # Gestión de pagos
│   │   │   ├── payments.service.ts
│   │   │   ├── payments.service.test.ts
│   │   │   └── index.ts
│   │   └── storage/             # Persistencia
│   │       ├── storage.interface.ts    # Interface
│   │       ├── localStorage.service.ts # Implementación
│   │       ├── api.service.ts          # Futuro: API
│   │       ├── storage.factory.ts      # Factory pattern
│   │       └── index.ts
│   │
│   ├── utils/                   # Utilidades
│   │   ├── formatters.ts        # Formateo (moneda, fechas)
│   │   ├── validators.ts        # Validación de datos
│   │   ├── sanitizer.ts         # Sanitización XSS
│   │   ├── errors.ts            # Manejo de errores
│   │   └── index.ts
│   │
│   ├── types/                   # Definiciones de tipos
│   │   ├── plan.ts              # Tipos de Plan
│   │   └── index.ts
│   │
│   ├── config/                  # Configuración
│   │   ├── env.config.ts        # Variables de entorno
│   │   ├── storage.config.ts    # Config de storage
│   │   └── index.ts
│   │
│   ├── __tests__/               # Tests de integración
│   │   └── integration.test.ts
│   │
│   ├── scripts.ts               # Entry point principal
│   └── start.ts                 # Entry point de onboarding
│
├── pages/                       # Archivos HTML
│   ├── dashboard.html
│   └── start.html
│
├── assets/                      # Assets estáticos
│   ├── css/                     # Estilos
│   ├── js/                      # Scripts legacy
│   ├── images/                  # Imágenes
│   └── favicon.ico              # Favicon
│
├── backend/                     # Backend API
│   ├── src/                     # Código fuente del backend
│   │   ├── config/              # Configuración
│   │   ├── constants/           # Constantes
│   │   ├── controllers/         # Controladores HTTP
│   │   ├── errors/              # Clases de error
│   │   ├── middleware/          # Middleware de Express
│   │   ├── routes/              # Definición de rutas
│   │   ├── schemas/             # Schemas de validación
│   │   ├── services/            # Lógica de negocio
│   │   ├── types/               # Tipos TypeScript
│   │   ├── utils/               # Utilidades
│   │   └── server.ts            # Punto de entrada
│   ├── prisma/                  # Esquema y migraciones de BD
│   └── tests/                   # Tests del backend
│
├── dist/                        # Build output
│   ├── scripts.js               # Bundle principal
│   ├── start.js                # Bundle de onboarding
│   ├── env-config.js           # Variables de entorno
│   ├── js/                     # Code-split chunks
│   ├── assets/                 # Assets procesados
│   └── pages/                  # HTML copiados
│
├── docs/                        # Documentación
│   ├── adr/                     # Architecture Decision Records
│   ├── archive/                 # Documentación archivada
│   └── *.md                     # Guías y planes
│
├── scripts/                     # Scripts de build y desarrollo
│   ├── copy-dev-assets.js       # Copiar assets de desarrollo
│   ├── copy-static.js           # Copiar archivos estáticos
│   ├── dev-server.js            # Servidor HTTP de desarrollo
│   ├── generate-env-dev.js       # Generar config de env dev
│   └── inject-env.js            # Inyección de env vars
│
└── tools/                       # Herramientas de desarrollo
    ├── test-env.html            # Tester de variables de entorno
    └── README.md                # Documentación de herramientas
```

---

## 🎨 Patrones de Diseño

### 1. Service Layer Pattern

**Objetivo:** Separar lógica de negocio de la UI

**Implementación:**
- `PlansService` - Gestión de planes
- `PaymentsService` - Gestión de pagos
- Servicios son clases estáticas con métodos async

**Ejemplo:**
```typescript
// En lugar de manipular localStorage directamente
const plans = await PlansService.getAllPlans();
const newPlan = await PlansService.createPlan(planData);
```

### 2. Factory Pattern

**Objetivo:** Abstraer la creación de servicios de storage

**Implementación:**
```typescript
// StorageFactory decide qué implementación usar
const storage = StorageFactory.create();
// Retorna LocalStorageService o ApiStorageService según configuración
```

**Beneficio:** Fácil migración de localStorage a API en el futuro

### 3. Interface Segregation

**Objetivo:** Definir contratos claros para servicios

**Implementación:**
```typescript
interface IStorageService {
    getPlans(): Promise<Plan[]>;
    savePlan(plan: Plan): Promise<void>;
    // ... más métodos
}
```

**Beneficio:** Cualquier implementación que siga la interface funciona

### 4. Component Pattern

**Objetivo:** Componentes UI reutilizables y encapsulados

**Implementación:**
- Cada componente en su propio directorio
- Lógica y template separados
- Métodos públicos claros

**Ejemplo:**
```typescript
class PaymentTableComponent {
    render(plan: Plan): void;
    updatePaymentStatus(monthIndex: number): void;
}
```

---

## 🔄 Flujo de Datos

### Flujo Típico: Crear un Plan

```
1. Usuario llena formulario (HTML)
   ↓
2. StartPage valida datos (FormValidator)
   ↓
3. StartPage crea plan (PlansService.createPlan)
   ↓
4. PlansService valida (PlanValidator)
   ↓
5. PlansService guarda (StorageService.savePlan)
   ↓
6. StorageService persiste (localStorage)
   ↓
7. StartPage redirige a dashboard
   ↓
8. DashboardPage carga planes (PlansService.getAllPlans)
   ↓
9. DashboardPage renderiza (PlanListComponent)
```

### Flujo Típico: Marcar un Pago

```
1. Usuario hace click en toggle (HTML)
   ↓
2. PaymentTableComponent maneja evento
   ↓
3. PaymentTableComponent actualiza estado (PaymentsService.savePaymentStatus)
   ↓
4. PaymentsService calcula totales
   ↓
5. PaymentsService guarda (StorageService)
   ↓
6. PaymentTableComponent actualiza UI
   ↓
7. DashboardPage recalcula estadísticas
   ↓
8. DashboardPage actualiza overview
```

---

## 💾 Gestión de Estado

### Estado de la Aplicación

El estado se gestiona de forma **descentralizada**:

1. **Planes** - Almacenados en `localStorage` (key: `debtLitePlans`)
2. **Estado de Pagos** - Almacenado en `localStorage` (key: `paymentStatus_<planId>`)
3. **Plan Activo** - Almacenado en `localStorage` (key: `debtLiteActivePlanId`)
4. **Tema** - Almacenado en `localStorage` (key: `debtLiteTheme`)
5. **Datos de Onboarding** - Almacenados en `sessionStorage` (temporales)

### Sincronización

- **No hay estado global** - Cada componente lee de storage cuando lo necesita
- **Eventos DOM** - Componentes se comunican vía eventos del DOM
- **Re-render manual** - Componentes actualizan su UI cuando cambian datos

### Futuro: Estado Centralizado

Cuando se agregue backend, se puede considerar:
- **State Management Library** (Redux, Zustand, etc.)
- **React Query** para sincronización con API
- **Event Bus** para comunicación entre componentes

---

## 💿 Persistencia de Datos

### Capa de Abstracción

```
┌─────────────────────────────────┐
│    Business Services            │
│  (PlansService, PaymentsService)│
└──────────────┬──────────────────┘
               │
               │ Usa interface
               ▼
┌─────────────────────────────────┐
│    IStorageService              │
│    (Interface)                   │
└──────────────┬──────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
    ▼                     ▼
┌─────────────┐   ┌──────────────┐
│ localStorage│   │ API Service  │
│  Service    │   │  (Future)    │
└─────────────┘   └──────────────┘
```

### Implementación Actual: localStorage

**Ventajas:**
- ✅ No requiere servidor
- ✅ Funciona offline
- ✅ Rápido y simple
- ✅ Sin configuración

**Limitaciones:**
- ❌ Solo funciona en un navegador
- ❌ Límite de tamaño (~5-10MB)
- ❌ No sincroniza entre dispositivos
- ❌ Datos pueden perderse si se limpia el navegador

### Migración Futura a API

**Cómo funciona:**
1. `StorageFactory` lee `VITE_STORAGE_TYPE` de variables de entorno
2. Si es `'api'`, retorna `ApiStorageService`
3. Si es `'localStorage'`, retorna `LocalStorageService`
4. Los servicios de negocio no cambian - usan la misma interface

**Ejemplo:**
```typescript
// En desarrollo: localStorage
VITE_STORAGE_TYPE=localStorage

// En producción: API
VITE_STORAGE_TYPE=api
VITE_API_URL=https://api.debtlite.com
```

---

## 🏗️ Build y Deployment

### Proceso de Build

```
1. TypeScript Compilation (tsc)
   src/**/*.ts → dist/**/*.js
   ↓
2. Vite Bundling
   - Code splitting
   - Minification (Terser)
   - Tree-shaking
   - Source maps
   ↓
3. Environment Injection
   .env.production → dist/env-config.js
   ↓
4. Static Files Copy
   HTML, assets → dist/
   ↓
5. Output: dist/ (listo para deployment)
```

### Code Splitting

Vite divide el código en chunks:

- `scripts.js` - Entry point principal
- `start.js` - Entry point de onboarding
- `js/services-*.js` - Servicios
- `js/components-*.js` - Componentes
- `js/pages-*.js` - Páginas
- `js/vendor-*.js` - Dependencias (si las hay)

**Beneficio:** Carga solo lo necesario en cada página

### Deployment

**Vercel (Recomendado):**
- Build automático en cada push
- CDN global
- SSL automático
- Preview deployments para PRs

**GitHub Pages:**
- Build manual
- Subir `dist/` a rama `gh-pages`
- Configurar GitHub Pages

---

## 🔐 Seguridad

### Sanitización

- **Input Sanitization** - Todos los inputs se sanitizan antes de guardar
- **XSS Protection** - HTML escapado en renderizado
- **Data Validation** - Validación estricta de tipos y valores

### Límites

- **Max Plans** - Configurable vía `VITE_MAX_PLANS`
- **Max Amount** - Configurable vía `VITE_MAX_PLAN_AMOUNT`
- **Storage Size** - Validación de tamaño máximo (5MB)

---

## 🧪 Testing

### Estrategia de Testing

1. **Unit Tests** - Servicios, utils, componentes
2. **Integration Tests** - Flujos completos entre servicios
3. **E2E Tests** - (Futuro) Tests de UI completa

### Cobertura

- **Meta:** >80% coverage
- **Actual:** 96% coverage
- **Herramienta:** Vitest con coverage-v8

---

## 📊 Métricas y Performance

### Bundle Size

- **scripts.js:** ~0.29 KB (gzipped)
- **start.js:** ~0.68 KB (gzipped)
- **Total:** ~12 KB (gzipped)

### Performance

- **First Contentful Paint:** < 1s
- **Time to Interactive:** < 2s
- **Bundle Loading:** Lazy loading de chunks

---

## 🔮 Futuro: Preparación para Backend

### Cambios Necesarios

1. **Implementar ApiStorageService** - Ya existe la interface
2. **Agregar HttpClient** - Cliente HTTP genérico
3. **Estados de Carga** - Loading spinners, error states
4. **Sincronización** - Manejo de conflictos offline/online
5. **Autenticación** - JWT tokens, refresh logic

### Arquitectura Propuesta

```
Frontend (Actual)
    ↓
IStorageService (Interface)
    ↓
StorageFactory
    ↓
┌─────────────┬──────────────┐
│ localStorage│  API Service  │
│  Service    │  (Nuevo)      │
└─────────────┴──────────────┘
                    ↓
            HttpClient
                    ↓
            Backend API
```

---

## 📚 Referencias

- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Guía de contribución
- **[PLAN_MEJORAS.md](./docs/PLAN_MEJORAS.md)** - Plan de mejoras
- **[API Documentation](./docs/api/)** - Documentación generada con TypeDoc

---

**Última actualización:** 2024
**Versión:** 1.0


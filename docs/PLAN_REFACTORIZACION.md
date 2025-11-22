# 🔧 Plan de Refactorización Modular - DebtLite

## 🎯 Objetivo
Refactorizar el código monolítico (`src/scripts.ts` - 853 líneas) en una arquitectura modular mantenible y escalable, sin romper funcionalidad existente.

---

## 📊 Análisis del Código Actual

### Estructura Actual
- **Archivo único**: `src/scripts.ts` (853 líneas)
- **Responsabilidades mezcladas**: UI, lógica de negocio, datos, utilidades
- **Funcionalidades principales**:
  - Gestión de planes (CRUD)
  - Gestión de pagos y estados
  - Vista general del dashboard
  - Vista de detalle de plan
  - Renderizado de componentes (tabla, lista de planes)
  - Manejo de temas (dark/light)
  - Cálculo de estadísticas agregadas

---

## 🗂️ Estructura Propuesta

```
src/
├── types/
│   ├── plan.ts              # Tipos de Plan
│   ├── payment.ts           # Tipos de Payment
│   └── index.ts             # Exportaciones centralizadas
├── services/
│   ├── storage/
│   │   ├── storage.interface.ts    # Interface para abstracción
│   │   ├── localStorage.service.ts  # Implementación actual
│   │   └── index.ts
│   ├── plans/
│   │   ├── plans.service.ts        # Lógica de negocio de planes
│   │   └── index.ts
│   └── payments/
│       ├── payments.service.ts      # Lógica de pagos
│       └── index.ts
├── components/
│   ├── payment-table/
│   │   ├── payment-table.component.ts
│   │   └── index.ts
│   ├── plan-list/
│   │   ├── plan-list.component.ts
│   │   └── index.ts
│   ├── overview/
│   │   ├── overview.component.ts    # Vista general del dashboard
│   │   └── index.ts
│   └── theme-toggle/
│       ├── theme-toggle.component.ts
│       └── index.ts
├── utils/
│   ├── formatters.ts        # Formateo de moneda, fechas
│   ├── validators.ts        # Validación de datos
│   └── index.ts
├── pages/
│   ├── dashboard/
│   │   ├── dashboard.page.ts        # Lógica principal del dashboard
│   │   └── index.ts
│   └── start/
│       ├── start.page.ts            # Lógica de onboarding (si aplica)
│       └── index.ts
└── config/
    ├── constants.ts         # Constantes de la aplicación
    └── index.ts
```

---

## 📋 Plan de Ejecución - Paso a Paso

### FASE 1: Preparación y Tipos (Día 1)

#### Paso 1.1: Crear estructura de directorios
```bash
mkdir -p src/types
mkdir -p src/services/storage
mkdir -p src/services/plans
mkdir -p src/services/payments
mkdir -p src/components/payment-table
mkdir -p src/components/plan-list
mkdir -p src/components/overview
mkdir -p src/components/theme-toggle
mkdir -p src/utils
mkdir -p src/pages/dashboard
mkdir -p src/config
```

#### Paso 1.2: Extraer tipos TypeScript
**Archivo**: `src/types/plan.ts`
```typescript
export type Plan = {
    id: string;
    planName: string;
    totalAmount: number;
    numberOfMonths: number | 'one-time';
    monthlyPayment: number;
    debtOwner?: 'self' | 'other';
    createdAt: string;
    isActive: boolean;
};
```

**Archivo**: `src/types/payment.ts`
```typescript
export type TotalsSnapshot = {
    totalPaid: number;
    remaining: number;
};

export type PaymentStatus = 'paid' | 'pending' | 'pagado';
```

**Archivo**: `src/types/index.ts`
```typescript
export * from './plan';
export * from './payment';
```

**Tiempo estimado**: 30 minutos

---

### FASE 2: Servicios - Storage (Día 1-2)

#### Paso 2.1: Crear interface de storage
**Archivo**: `src/services/storage/storage.interface.ts`
```typescript
import { Plan } from '../../types';
import { PaymentStatus } from '../../types';

export interface IStorageService {
    getPlans(): Plan[];
    savePlans(plans: Plan[]): void;
    getActivePlanId(): string | null;
    setActivePlanId(planId: string): void;
    getPaymentStatus(planId: string): PaymentStatus[];
    savePaymentStatus(planId: string, status: PaymentStatus[]): void;
    getPaymentTotals(planId: string): { totalPaid: number; remaining: number } | null;
    savePaymentTotals(planId: string, totals: { totalPaid: number; remaining: number }): void;
    removePlan(planId: string): void;
}
```

#### Paso 2.2: Implementar LocalStorageService
**Archivo**: `src/services/storage/localStorage.service.ts`
- Mover toda la lógica de localStorage del `scripts.ts` actual
- Implementar todos los métodos de la interface
- Manejar errores de parsing JSON
- Manejar errores de quota exceeded

**Tiempo estimado**: 2-3 horas

---

### FASE 3: Servicios - Plans (Día 2)

#### Paso 3.1: Crear PlansService
**Archivo**: `src/services/plans/plans.service.ts`
```typescript
import { Plan } from '../../types';
import { IStorageService } from '../storage/storage.interface';

export class PlansService {
    constructor(private storage: IStorageService) {}

    getAllPlans(): Plan[]
    getActivePlan(): Plan | null
    getPlanById(planId: string): Plan | undefined
    createPlan(plan: Omit<Plan, 'id' | 'createdAt' | 'isActive'>): Plan
    updatePlan(planId: string, updates: Partial<Plan>): void
    deletePlan(planId: string): void
    setActivePlan(planId: string): void
    sortPlans(plans: Plan[]): Plan[]
}
```

**Tiempo estimado**: 2-3 horas

---

### FASE 4: Servicios - Payments (Día 2-3)

#### Paso 4.1: Crear PaymentsService
**Archivo**: `src/services/payments/payments.service.ts`
```typescript
import { Plan, TotalsSnapshot } from '../../types';
import { IStorageService } from '../storage/storage.interface';

export class PaymentsService {
    constructor(private storage: IStorageService) {}

    getPaymentStatus(planId: string): PaymentStatus[]
    savePaymentStatus(planId: string, status: PaymentStatus[]): void
    getPaidMonthsCount(planId: string): number
    calculateTotals(plan: Plan): TotalsSnapshot
    getPlanPaymentStatus(planId: string, plan: Plan): { totalPaid: number; remaining: number }
    calculateOverviewStats(allPlans: Plan[]): OverviewStats
}
```

**Tiempo estimado**: 3-4 horas

---

### FASE 5: Utilidades (Día 3)

#### Paso 5.1: Formatters
**Archivo**: `src/utils/formatters.ts`
```typescript
export const currencyFormatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
});

export function formatCurrency(amount: number): string
export function formatMonthsText(paidMonths: number, totalMonths: number | 'one-time'): string
```

#### Paso 5.2: Validators (preparación futura)
**Archivo**: `src/utils/validators.ts`
```typescript
export function validatePlanName(name: string): boolean
export function validateAmount(amount: number): boolean
export function validateMonths(months: number | 'one-time'): boolean
```

**Tiempo estimado**: 1-2 horas

---

### FASE 6: Componentes (Día 3-4)

#### Paso 6.1: PaymentTable Component
**Archivo**: `src/components/payment-table/payment-table.component.ts`
- Extraer función `generateTable()`
- Extraer función `updateToggleVisual()`
- Manejar eventos de cambio de estado

#### Paso 6.2: PlanList Component
**Archivo**: `src/components/plan-list/plan-list.component.ts`
- Extraer función `renderPlansList()`
- Manejar clicks en planes
- Manejar eliminación de planes

#### Paso 6.3: Overview Component
**Archivo**: `src/components/overview/overview.component.ts`
- Extraer función `renderOverview()`
- Extraer función `calculateOverviewStats()`
- Manejar navegación a plan específico

#### Paso 6.4: ThemeToggle Component
**Archivo**: `src/components/theme-toggle/theme-toggle.component.ts`
- Extraer toda la lógica de temas
- Manejar cambio de logo según tema

**Tiempo estimado**: 4-5 horas

---

### FASE 7: Páginas (Día 4-5)

#### Paso 7.1: Dashboard Page
**Archivo**: `src/pages/dashboard/dashboard.page.ts`
- Orquestar todos los componentes
- Manejar navegación entre vistas
- Inicializar servicios
- Configurar event listeners

**Tiempo estimado**: 3-4 horas

---

### FASE 8: Integración y Testing (Día 5)

#### Paso 8.1: Actualizar HTML
- Actualizar `pages/dashboard.html` para usar nuevos módulos
- Verificar que todos los imports funcionen

#### Paso 8.2: Testing Manual
- Probar todas las funcionalidades
- Verificar que no se haya roto nada
- Probar en diferentes navegadores

#### Paso 8.3: Limpiar código antiguo
- Eliminar `src/scripts.ts` original (después de verificar que todo funciona)
- Actualizar `tsconfig.json` si es necesario

**Tiempo estimado**: 2-3 horas

---

## 🎯 Estrategia de Migración

### Enfoque Incremental (Recomendado)

1. **Crear nuevos módulos** sin tocar código existente
2. **Migrar función por función** del código antiguo al nuevo
3. **Probar después de cada migración**
4. **Hacer commits pequeños** después de cada módulo migrado
5. **Eliminar código antiguo** solo cuando todo esté migrado y probado

### Orden de Migración Recomendado

1. ✅ Tipos (más fácil, sin dependencias)
2. ✅ Utils (formatters, sin dependencias complejas)
3. ✅ Storage Service (base para todo lo demás)
4. ✅ Plans Service (depende de Storage)
5. ✅ Payments Service (depende de Storage y Plans)
6. ✅ Componentes (dependen de servicios)
7. ✅ Páginas (orquestan componentes y servicios)

---

## ✅ Checklist de Progreso

### Preparación
- [ ] Estructura de directorios creada
- [ ] Tipos extraídos a `src/types/`
- [ ] Configuración de TypeScript verificada

### Servicios
- [ ] `IStorageService` interface creada
- [ ] `LocalStorageService` implementado y probado
- [ ] `PlansService` implementado y probado
- [ ] `PaymentsService` implementado y probado

### Componentes
- [ ] `PaymentTable` componente creado y probado
- [ ] `PlanList` componente creado y probado
- [ ] `Overview` componente creado y probado
- [ ] `ThemeToggle` componente creado y probado

### Páginas
- [ ] `Dashboard` página creada y probada
- [ ] HTML actualizado con nuevos imports
- [ ] Todas las funcionalidades probadas

### Limpieza
- [ ] Código antiguo eliminado
- [ ] Imports actualizados
- [ ] Build funcionando correctamente
- [ ] Documentación actualizada

---

## 🚨 Puntos de Atención

### No Romper Funcionalidad
- **Hacer commits frecuentes** para poder revertir si algo falla
- **Probar después de cada cambio** antes de continuar
- **Mantener código antiguo** hasta que el nuevo esté completamente probado

### Manejo de Errores
- Implementar manejo de errores desde el inicio
- Validar datos al cargar de localStorage
- Manejar casos edge (datos corruptos, quota exceeded)

### Testing
- Probar cada módulo individualmente
- Probar integración entre módulos
- Probar en diferentes navegadores
- Probar con datos existentes de usuarios

---

## 📊 Tiempo Total Estimado

| Fase | Descripción | Tiempo |
|------|------------|--------|
| Fase 1 | Preparación y Tipos | 1-2 horas |
| Fase 2 | Storage Service | 2-3 horas |
| Fase 3 | Plans Service | 2-3 horas |
| Fase 4 | Payments Service | 3-4 horas |
| Fase 5 | Utilidades | 1-2 horas |
| Fase 6 | Componentes | 4-5 horas |
| Fase 7 | Páginas | 3-4 horas |
| Fase 8 | Integración y Testing | 2-3 horas |
| **TOTAL** | | **18-26 horas (2.5-3.5 días)** |

---

## 🎓 Recursos y Referencias

### Estructura de Módulos ES6
- [MDN: ES6 Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

### TypeScript Modules
- [TypeScript: Modules](https://www.typescriptlang.org/docs/handbook/modules.html)

### Patrón de Servicios
- Separación de responsabilidades
- Dependency Injection
- Single Responsibility Principle

---

## 📝 Notas Finales

### Principios a Seguir
1. **Una responsabilidad por módulo**
2. **Dependencias claras y explícitas**
3. **Interfaces para abstracción**
4. **Código testeable**
5. **Documentación clara**

### Beneficios Esperados
- ✅ Código más fácil de mantener
- ✅ Más fácil de testear
- ✅ Más fácil de escalar
- ✅ Preparado para migración a API
- ✅ Mejor colaboración en equipo

---

**Última actualización**: 2024
**Versión del plan**: 1.0


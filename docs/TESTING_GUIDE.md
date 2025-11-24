# 🧪 Guía de Testing - DebtLite

Guía completa para ejecutar y entender los tests del proyecto.

---

## 🚀 Cómo Ejecutar los Tests

### Opción 1: Ejecutar todos los tests (recomendado para empezar)

```bash
npm run test:run
```

**Qué verás:**
- Lista de todos los tests ejecutados
- Resultados: ✅ PASS o ❌ FAIL para cada test
- Resumen final con total de tests pasados/fallidos
- Tiempo de ejecución

**Ejemplo de salida esperada:**
```
✓ src/utils/validators.test.ts (5) 1234ms
  ✓ PlanValidator (3)
    ✓ validatePlanName (6)
      ✓ should return valid for a valid plan name
      ✓ should return invalid for empty string
      ...
  ✓ validateAmount (5)
  ✓ validateMonths (5)
  ✓ validatePlan (3)

✓ src/utils/formatters.test.ts (3) 567ms
  ✓ formatCurrency (4)
  ✓ formatMonthsText (4)
  ✓ formatOwnerText (2)

✓ src/services/plans/plans.service.test.ts (5) 890ms
  ✓ getAllPlans (2)
  ✓ getActivePlan (2)
  ✓ getPlanById (2)
  ✓ createPlan (5)
  ✓ deletePlan (2)

Test Files  3 passed (3)
     Tests  19 passed (19)
  Start at  12:34:56
  Duration  2.68s
```

---

### Opción 2: Interfaz Visual (más fácil de usar)

```bash
npm run test:ui
```

**Qué verás:**
- Se abrirá una ventana del navegador con una interfaz visual
- Lista de todos los tests en el panel izquierdo
- Detalles de cada test al hacer clic
- Filtros para buscar tests específicos
- Botones para ejecutar tests individuales
- Colores: Verde = PASS, Rojo = FAIL

**Ventajas:**
- Más fácil de entender
- Puedes ejecutar tests individuales
- Ver detalles de errores más claramente
- Útil para debugging

---

### Opción 3: Modo Watch (desarrollo activo)

```bash
npm run test:watch
```

**Qué verás:**
- Tests se ejecutan automáticamente cuando guardas archivos
- Útil cuando estás escribiendo tests o código
- Se actualiza en tiempo real

---

### Opción 4: Con Coverage (cobertura de código)

```bash
npm run test:coverage
```

**Qué verás:**
- Todos los resultados de tests
- **Reporte de cobertura** mostrando:
  - Porcentaje de líneas cubiertas
  - Porcentaje de funciones cubiertas
  - Porcentaje de branches cubiertas
  - Archivos con menos cobertura
- Se genera carpeta `coverage/` con reporte HTML detallado

**Ejemplo de salida:**
```
Test Files  3 passed (3)
     Tests  19 passed (19)

% Coverage report from v8
-------------------------------
Statements   : 85.23% ( 234/274 )
Branches     : 82.15% ( 123/150 )
Functions    : 88.90% (  89/100 )
Lines        : 85.23% ( 234/274 )
-------------------------------
```

---

## 📊 Qué Tests Existen Actualmente

### Tests de Integración (`__tests__/integration.test.ts`)

**Qué testean:**
- ✅ Flujo completo de usuario (crear plan → marcar pagos → eliminar plan)
- ✅ Persistencia de datos en localStorage
- ✅ Integración entre PlansService, PaymentsService y StorageService
- ✅ Manejo de errores en contexto de integración
- ✅ Gestión de plan activo con múltiples planes

**Ejemplos de tests:**
- Crear plan, marcar pagos, eliminar plan → debe funcionar correctamente
- Datos persisten entre llamadas de servicio → debe funcionar
- Múltiples planes con diferentes estados de pago → debe funcionar

**Total:** 12 tests de integración

---

### 1. Tests de Validadores (`validators.test.ts`)

**Qué testean:**
- ✅ Validación de nombres de planes
- ✅ Validación de montos
- ✅ Validación de número de meses
- ✅ Validación completa de planes

**Ejemplos de tests:**
- Nombre vacío → debe fallar
- Nombre muy corto → debe fallar
- Monto negativo → debe fallar
- Meses inválidos → debe fallar

---

### 2. Tests de Formatters (`formatters.test.ts`)

**Qué testean:**
- ✅ Formateo de moneda (MXN)
- ✅ Formateo de texto de meses ("5 / 12 months")
- ✅ Formateo de propietario ("My Debt" / "Receivable")

**Ejemplos de tests:**
- `formatCurrency(1000)` → "$1,000.00 MXN"
- `formatMonthsText(plan, 5)` → "5 / 12 months"
- `formatOwnerText(plan)` → "My Debt" o "Receivable"

---

### 3. Tests de PlansService (`plans.service.test.ts`)

**Qué testean:**
- ✅ Obtener todos los planes
- ✅ Obtener plan activo
- ✅ Obtener plan por ID
- ✅ Crear nuevo plan
- ✅ Eliminar plan
- ✅ Validaciones al crear plan

**Ejemplos de tests:**
- Crear plan válido → debe funcionar
- Crear plan con nombre inválido → debe lanzar error
- Eliminar plan existente → debe eliminarlo
- Eliminar plan inexistente → debe lanzar error

---

## ✅ Interpretando los Resultados

### Test Pasa (✅)
```
✓ should return valid for a valid plan name
```
**Significa:** El test funcionó correctamente, el código hace lo que se espera.

### Test Falla (❌)
```
✗ should return invalid for empty string
  AssertionError: expected true to be false
    at Object.<anonymous> (validators.test.ts:25:15)
```
**Significa:** 
- El código no está haciendo lo esperado
- Hay un bug o el test está mal escrito
- Revisa el mensaje de error para entender qué falló

### Test con Error
```
✗ should create a new plan
  Error: Storage service not initialized
```
**Significa:**
- El código lanzó una excepción inesperada
- Puede ser un error de configuración o un bug

---

## 🔍 Ejemplos de Uso

### Ejecutar un test específico

```bash
# Ejecutar solo tests de validators
npm run test:run -- validators

# Ejecutar solo tests de formatters
npm run test:run -- formatters

# Ejecutar solo tests de plans service
npm run test:run -- plans.service
```

### Ver detalles de un test que falla

Si un test falla, verás algo como:

```
✗ should return invalid for empty string
  AssertionError: expected true to be false

  Expected: false
  Received: true

  23 |     it('should return invalid for empty string', () => {
  24 |       const result = PlanValidator.validatePlanName('');
> 25 |       expect(result.isValid).toBe(false);
     |                            ^
  26 |       expect(result.error).toBe('Plan name is required');
  27 |     });
```

**Cómo interpretarlo:**
- **Expected:** Lo que esperábamos (false)
- **Received:** Lo que obtuvimos (true)
- **Línea 25:** Dónde falló el test
- **El problema:** El validador está retornando `true` cuando debería retornar `false`

---

## 📈 Coverage (Cobertura)

### ¿Qué es Coverage?

El coverage mide qué porcentaje de tu código está siendo probado por los tests.

### Ver Coverage en HTML

Después de ejecutar `npm run test:coverage`:

1. Se crea carpeta `coverage/`
2. Abre `coverage/index.html` en tu navegador
3. Verás:
   - Porcentajes por archivo
   - Líneas cubiertas (verde) y no cubiertas (rojo)
   - Funciones probadas y no probadas

### Meta de Coverage

Según el plan, el objetivo es **80% de cobertura** en:
- Líneas
- Funciones
- Branches (condicionales)
- Statements

---

## 🐛 Troubleshooting

### Error: "Cannot find module"

**Problema:** Vitest no encuentra los módulos
**Solución:** Verifica que los imports usen `.js` en lugar de `.ts`

### Error: "window is not defined"

**Problema:** Código intenta usar APIs del navegador
**Solución:** Verifica que `environment: 'jsdom'` esté en `vitest.config.ts`

### Tests muy lentos

**Problema:** Tests tardan mucho en ejecutarse
**Solución:** 
- Usa mocks para servicios pesados
- Evita operaciones de I/O reales
- Usa `vi.mock()` para mockear dependencias

### Coverage no se genera

**Problema:** No aparece reporte de coverage
**Solución:** 
- Verifica que `@vitest/coverage-v8` esté instalado
- Ejecuta `npm run test:coverage` (no solo `test:run`)

---

## 📝 Escribir Nuevos Tests

### Estructura básica

```typescript
import { describe, it, expect } from 'vitest';
import { MiFuncion } from './mi-archivo.js';

describe('MiFuncion', () => {
    it('should do something correctly', () => {
        const result = MiFuncion('input');
        expect(result).toBe('expected output');
    });
});
```

### Patrones comunes

```typescript
// Test de función que debe retornar algo
expect(result).toBe(expected);

// Test de función que debe lanzar error
await expect(funcion()).rejects.toThrow();

// Test de arrays
expect(array).toHaveLength(3);
expect(array).toContain(item);

// Test de objetos
expect(obj).toMatchObject({ key: 'value' });
```

---

## 🎯 Próximos Pasos

Después de verificar que los tests funcionan:

1. ✅ **Fase 2.2** - Tests unitarios completados:
   - ✅ PaymentsService
   - ✅ StorageService (localStorage)
   - ✅ Componentes (PaymentTable, PlanList) - cubiertos indirectamente

2. ✅ **Fase 2.3** - Tests de integración completados:
   - ✅ Flujos completos (crear plan → pagar → eliminar)
   - ✅ Persistencia de datos
   - ✅ Integración entre servicios

3. **Futuro** - Tests E2E (opcional):
   - Tests de navegación entre páginas
   - Tests de UI completa con Playwright/Cypress

---

## 📚 Recursos

- [Documentación de Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Guía de Testing en TypeScript](https://vitest.dev/guide/typescript.html)

---

**Última actualización:** 2024


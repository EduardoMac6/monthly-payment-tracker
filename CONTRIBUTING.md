# 🤝 Guía de Contribución - DebtLite

¡Gracias por tu interés en contribuir a DebtLite! Esta guía te ayudará a entender cómo contribuir al proyecto de manera efectiva.

---

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Contribuir](#cómo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Flujo de Trabajo](#flujo-de-trabajo)
- [Estándares de Código](#estándares-de-código)
- [Testing](#testing)
- [Commits](#commits)
- [Pull Requests](#pull-requests)

---

## 📜 Código de Conducta

Al participar en este proyecto, te comprometes a mantener un ambiente respetuoso y colaborativo. Sé amable, constructivo y profesional en todas las interacciones.

---

## 🚀 Cómo Contribuir

### Reportar Bugs

1. **Verifica que el bug no haya sido reportado** - Revisa los issues existentes
2. **Crea un nuevo issue** con:
   - Título claro y descriptivo
   - Descripción detallada del problema
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Información del entorno (navegador, OS, versión)

### Sugerir Mejoras

1. **Revisa la documentación** - Asegúrate de que la mejora no esté ya planificada
2. **Crea un issue** con:
   - Descripción clara de la mejora
   - Casos de uso
   - Beneficios esperados
   - Alternativas consideradas

### Contribuir Código

1. **Fork el repositorio**
2. **Crea una rama** para tu feature/fix
3. **Haz tus cambios** siguiendo los estándares
4. **Escribe tests** para tu código
5. **Asegúrate de que todo pase** (tests, lint, build)
6. **Crea un Pull Request**

---

## ⚙️ Configuración del Entorno

### Requisitos Previos

- **Node.js** 18+ (recomendado: 20+)
- **npm** 9+ o **yarn**
- **Git**

### Setup Inicial

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/monthly-payment-tracker.git
cd monthly-payment-tracker

# 2. Instalar dependencias
npm install

# 3. Verificar que todo funciona
npm run test:run
npm run build:prod
```

### Verificación Rápida

```bash
# Ejecutar todos los checks
npm run test:run && npx tsc --noEmit && npm run format:check && npm run lint
```

---

## 🔄 Flujo de Trabajo

### 1. Crear una Rama

```bash
# Desde main/develop
git checkout -b feature/nombre-de-tu-feature
# o
git checkout -b fix/nombre-del-fix
```

**Convención de nombres:**
- `feature/` - Nuevas funcionalidades
- `fix/` - Corrección de bugs
- `docs/` - Cambios en documentación
- `refactor/` - Refactorización de código
- `test/` - Agregar o mejorar tests

### 2. Hacer Cambios

- Escribe código limpio y bien documentado
- Sigue los estándares de código del proyecto
- Haz commits pequeños y frecuentes
- Escribe tests para nuevas funcionalidades

### 3. Verificar Antes de Commit

```bash
# Tests
npm run test:run

# Type check
npx tsc --noEmit

# Formato
npm run format:check

# Linting
npm run lint

# Build
npm run build:prod
```

### 4. Hacer Commit

Usa mensajes de commit descriptivos siguiendo [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: Add new payment plan feature"
git commit -m "fix: Resolve issue with payment calculation"
git commit -m "docs: Update README with new instructions"
```

**Tipos de commit:**
- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bug
- `docs:` - Cambios en documentación
- `style:` - Formato, punto y coma, etc. (no afecta código)
- `refactor:` - Refactorización de código
- `test:` - Agregar o modificar tests
- `chore:` - Tareas de mantenimiento

### 5. Push y Pull Request

```bash
# Push tu rama
git push origin feature/nombre-de-tu-feature

# Luego crea un PR en GitHub
```

---

## 📝 Estándares de Código

### TypeScript

- **Usa tipos explícitos** - Evita `any` cuando sea posible
- **Sigue las reglas de ESLint** - El proyecto tiene reglas estrictas
- **Documenta funciones públicas** - Usa JSDoc para funciones exportadas
- **Nombres descriptivos** - Variables y funciones deben ser claras

**Ejemplo:**
```typescript
/**
 * Calculate monthly payment for a plan
 * @param totalAmount - Total amount to pay
 * @param numberOfMonths - Number of months or 'one-time'
 * @returns Monthly payment amount
 */
function calculateMonthlyPayment(
    totalAmount: number,
    numberOfMonths: number | 'one-time'
): number {
    if (numberOfMonths === 'one-time') {
        return totalAmount;
    }
    return totalAmount / numberOfMonths;
}
```

### Estructura de Archivos

- **Un archivo, una responsabilidad** - Cada archivo debe tener un propósito claro
- **Nombres descriptivos** - `payment-table.component.ts` no `table.ts`
- **Organización por feature** - Agrupa archivos relacionados

### Formato

El proyecto usa **Prettier** para formateo automático:

```bash
# Formatear código
npm run format

# Verificar formato
npm run format:check
```

**Reglas principales:**
- Indentación: 4 espacios
- Comillas: simples
- Punto y coma: sí
- Línea máxima: 100 caracteres

### Linting

El proyecto usa **ESLint** con reglas TypeScript:

```bash
# Verificar linting
npm run lint

# Auto-corregir
npm run lint:fix
```

**Reglas importantes:**
- No `console.log` en producción (usa `console.warn` o `console.error`)
- Evita `any` types
- Variables no usadas deben empezar con `_`
- Usa `const` cuando sea posible

---

## 🧪 Testing

### Escribir Tests

- **Cubre nueva funcionalidad** - Cada feature debe tener tests
- **Tests descriptivos** - Nombres claros que expliquen qué testean
- **Tests independientes** - Cada test debe poder ejecutarse solo
- **Limpia después de tests** - Usa `beforeEach`/`afterEach` para limpiar estado

**Ejemplo:**
```typescript
describe('PlansService', () => {
    beforeEach(() => {
        // Limpiar localStorage antes de cada test
        localStorage.clear();
    });

    it('should create a new plan with valid data', async () => {
        const plan = await PlansService.createPlan({
            planName: 'Test Plan',
            totalAmount: 10000,
            numberOfMonths: 12,
            debtOwner: 'self',
        });

        expect(plan.id).toBeDefined();
        expect(plan.planName).toBe('Test Plan');
    });
});
```

### Ejecutar Tests

```bash
# Todos los tests
npm run test:run

# Modo watch (desarrollo)
npm run test:watch

# Con coverage
npm run test:coverage

# UI interactiva
npm run test:ui
```

### Coverage

- **Mantén coverage > 80%** - Es la meta del proyecto
- **Cubre casos edge** - No solo el happy path
- **Tests de integración** - Para flujos completos

---

## 📤 Commits

### Mensajes de Commit

Sigue el formato [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<ámbito>): <descripción>

[descripción opcional más detallada]

[notas opcionales]
```

**Ejemplos:**

```bash
feat(plans): Add ability to edit plan names

fix(payments): Correct calculation for one-time payments

docs(readme): Update installation instructions

test(integration): Add tests for plan deletion flow

refactor(services): Extract payment calculation logic
```

### Buenas Prácticas

- **Un cambio por commit** - Commits pequeños y enfocados
- **Mensajes descriptivos** - Explica QUÉ y POR QUÉ, no CÓMO
- **Usa el cuerpo del commit** - Para explicaciones más largas
- **Referencia issues** - Usa `Closes #123` o `Fixes #456`

---

## 🔍 Pull Requests

### Antes de Crear un PR

- [ ] Código sigue los estándares del proyecto
- [ ] Todos los tests pasan (`npm run test:run`)
- [ ] Type check pasa (`npx tsc --noEmit`)
- [ ] Formato correcto (`npm run format:check`)
- [ ] Linting pasa (`npm run lint`)
- [ ] Build funciona (`npm run build:prod`)
- [ ] Tests nuevos agregados (si aplica)
- [ ] Documentación actualizada (si aplica)

### Crear el PR

1. **Título descriptivo** - Explica claramente qué hace el PR
2. **Descripción detallada**:
   - Qué cambia y por qué
   - Cómo probar los cambios
   - Screenshots (si aplica)
   - Referencias a issues relacionados
3. **Mantén el PR pequeño** - Un PR grande es difícil de revisar
4. **Responde a feedback** - Sé abierto a sugerencias

### Template de PR

```markdown
## Descripción
Breve descripción de los cambios

## Tipo de cambio
- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Breaking change
- [ ] Documentación

## Cómo probar
1. Paso 1
2. Paso 2
3. Paso 3

## Checklist
- [ ] Tests agregados/actualizados
- [ ] Documentación actualizada
- [ ] Código sigue estándares
- [ ] Todos los checks pasan
```

---

## 🏗️ Estructura del Proyecto

### Directorios Principales

```
src/
├── components/     # Componentes UI reutilizables
├── pages/          # Lógica de páginas
├── services/        # Lógica de negocio
├── utils/          # Utilidades y helpers
├── types/          # Definiciones de tipos
└── config/         # Configuración
```

### Agregar Nuevo Código

**Nuevo componente:**
```
src/components/nuevo-componente/
├── nuevo-componente.component.ts
└── index.ts
```

**Nuevo servicio:**
```
src/services/nuevo-servicio/
├── nuevo-servicio.service.ts
├── nuevo-servicio.service.test.ts
└── index.ts
```

---

## 📚 Recursos Adicionales

- **[TESTING_GUIDE.md](./docs/TESTING_GUIDE.md)** - Guía completa de testing
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitectura del proyecto
- **[ENV_VARIABLES.md](./docs/ENV_VARIABLES.md)** - Variables de entorno
- **[CI_CD_GUIDE.md](./docs/CI_CD_GUIDE.md)** - Guía de CI/CD
- **[VERIFICACION_COMPLETA.md](./docs/VERIFICACION_COMPLETA.md)** - Cómo verificar cambios

---

## ❓ Preguntas Frecuentes

### ¿Cómo empiezo a contribuir?

1. Lee esta guía completa
2. Revisa los issues abiertos (busca "good first issue")
3. Fork el repositorio
4. Crea una rama y empieza a trabajar

### ¿Qué hago si tengo dudas?

- Revisa la documentación en `docs/`
- Abre un issue con tu pregunta
- Revisa código existente para ver ejemplos

### ¿Puedo trabajar en múltiples features a la vez?

Sí, pero crea una rama separada para cada feature. No mezcles cambios no relacionados en un solo PR.

### ¿Qué pasa si mi PR tiene conflictos?

1. Actualiza tu rama con los últimos cambios de `main`
2. Resuelve los conflictos
3. Verifica que todo siga funcionando
4. Actualiza tu PR

---

## 🎉 ¡Gracias!

Tu contribución hace que DebtLite sea mejor. ¡Apreciamos tu tiempo y esfuerzo!

---

**Última actualización:** 2024
**Versión:** 1.0


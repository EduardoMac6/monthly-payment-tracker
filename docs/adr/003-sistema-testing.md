# ADR-003: Sistema de Testing

## Estado
Aceptada

## Contexto

Necesitábamos un sistema de testing para:
- Asegurar calidad del código
- Prevenir regresiones
- Facilitar refactorización
- Documentar comportamiento esperado

Opciones consideradas:
- **Jest** - Estándar de la industria, pero más pesado
- **Vitest** - Rápido, compatible con Vite, moderno
- **Mocha** - Más antiguo, menos features

## Decisión

Usar **Vitest** como framework de testing porque:
- ✅ Compatible con Vite (mismo ecosistema)
- ✅ Muy rápido (usa Vite para transformación)
- ✅ API compatible con Jest (fácil migración)
- ✅ Soporte nativo para TypeScript
- ✅ Coverage integrado
- ✅ UI interactiva

**Configuración:**
- Environment: `happy-dom` (más rápido que jsdom)
- Coverage: `v8` provider
- Threshold: 80% mínimo

## Consecuencias

### Positivas
- ✅ Tests muy rápidos
- ✅ Integración perfecta con Vite
- ✅ Fácil de configurar
- ✅ Buen DX (Developer Experience)

### Negativas
- ⚠️ Menos maduro que Jest (pero suficiente)
- ⚠️ Comunidad más pequeña (pero creciendo)

### Alternativas Consideradas
- **Jest**: Más pesado, requiere más configuración
- **Mocha**: Menos features, más setup manual

---

**Fecha:** 2024
**Autor:** Equipo de desarrollo


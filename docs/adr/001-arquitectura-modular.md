# ADR-001: Arquitectura Modular

## Estado
Aceptada

## Contexto

El proyecto comenzó con un archivo monolítico `src/scripts.ts` de 853 líneas que contenía:
- Lógica de UI (renderizado, eventos)
- Lógica de negocio (cálculos, validaciones)
- Lógica de persistencia (localStorage)
- Utilidades (formatters, validators)

Este código era difícil de:
- Mantener
- Testear
- Escalar
- Colaborar

## Decisión

Refactorizar el código a una **arquitectura modular** con separación clara de responsabilidades:

```
src/
├── components/    # Componentes UI reutilizables
├── pages/         # Controladores de páginas
├── services/      # Lógica de negocio
├── utils/         # Utilidades
├── types/         # Definiciones de tipos
└── config/        # Configuración
```

**Principios aplicados:**
- Single Responsibility Principle
- Separation of Concerns
- Dependency Injection (vía interfaces)

## Consecuencias

### Positivas
- ✅ Código más fácil de mantener
- ✅ Más fácil de testear (cada módulo por separado)
- ✅ Más fácil de escalar (agregar features sin tocar código existente)
- ✅ Mejor colaboración (múltiples desarrolladores pueden trabajar en paralelo)
- ✅ Reutilización de código

### Negativas
- ⚠️ Más archivos que gestionar
- ⚠️ Curva de aprendizaje inicial para nuevos desarrolladores
- ⚠️ Posible over-engineering para proyectos pequeños

### Mitigación
- Documentación clara (ARCHITECTURE.md)
- Estructura consistente
- Ejemplos en código

---

**Fecha:** 2024
**Autor:** Equipo de desarrollo


# 📋 Architecture Decision Records (ADR)

Este directorio contiene las decisiones técnicas importantes tomadas durante el desarrollo del proyecto.

---

## ¿Qué es un ADR?

Un **Architecture Decision Record (ADR)** es un documento que captura una decisión arquitectónica importante junto con su contexto y consecuencias.

### Formato de ADR

Cada ADR sigue este formato:

```markdown
# ADR-XXX: Título de la Decisión

## Estado
[Propuesta | Aceptada | Rechazada | Deprecada]

## Contexto
¿Qué problema estamos tratando de resolver?

## Decisión
¿Qué decisión tomamos?

## Consecuencias
¿Cuáles son las implicaciones de esta decisión?
```

---

## ADRs Existentes

- **[ADR-001: Arquitectura Modular](./001-arquitectura-modular.md)** - Decisión de refactorizar a módulos
- **[ADR-002: Abstracción de Storage](./002-abstraccion-storage.md)** - Interface para storage
- **[ADR-003: Sistema de Testing](./003-sistema-testing.md)** - Elección de Vitest
- **[ADR-004: Build Tool](./004-build-tool.md)** - Elección de Vite
- **[ADR-005: CI/CD Platform](./005-cicd-platform.md)** - Elección de GitHub Actions

---

## Cómo Crear un Nuevo ADR

1. **Crea un nuevo archivo** `docs/adr/XXX-titulo.md`
2. **Usa el template** de arriba
3. **Numera secuencialmente** (001, 002, 003...)
4. **Actualiza este README** con el nuevo ADR

---

**Última actualización:** 2024


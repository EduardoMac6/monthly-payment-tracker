# ADR-005: CI/CD Platform

## Estado
Aceptada

## Contexto

Necesitábamos automatizar:
- Tests en cada commit
- Verificación de calidad de código
- Builds de producción
- Deployment automático

Opciones consideradas:
- **GitHub Actions** - Integrado con GitHub, gratis para repos públicos
- **GitLab CI** - Requiere GitLab
- **CircleCI** - Límites en plan gratis
- **Travis CI** - Menos popular ahora

## Decisión

Usar **GitHub Actions** porque:
- ✅ Gratis para repos públicos
- ✅ Integrado con GitHub (no requiere configuración externa)
- ✅ Fácil de configurar (YAML)
- ✅ Marketplace de acciones
- ✅ Preview deployments automáticos
- ✅ Bueno para proyectos open source

**Workflows:**
- `ci.yml` - Tests, linting, type check, build
- `cd.yml` - Deployment a Vercel/GitHub Pages

## Consecuencias

### Positivas
- ✅ Automatización completa
- ✅ Feedback rápido en PRs
- ✅ Deployment automático
- ✅ Sin costo adicional

### Negativas
- ⚠️ Atado a GitHub (pero es el estándar)
- ⚠️ Límites en minutos gratuitos (suficiente para proyectos pequeños)

### Alternativas Consideradas
- **GitLab CI**: Requiere migrar a GitLab
- **CircleCI**: Límites más restrictivos en plan gratis

---

**Fecha:** 2024
**Autor:** Equipo de desarrollo


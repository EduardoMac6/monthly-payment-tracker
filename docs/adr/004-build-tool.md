# ADR-004: Build Tool

## Estado
Aceptada

## Contexto

Necesitábamos un build tool que:
- Compile TypeScript
- Optimice para producción
- Soporte code splitting
- Sea rápido en desarrollo

Opciones consideradas:
- **Webpack** - Estándar, pero lento y complejo
- **Vite** - Rápido, moderno, simple
- **Rollup** - Bueno para librerías, menos para apps
- **Parcel** - Automático, pero menos control

## Decisión

Usar **Vite** como build tool porque:
- ✅ Extremadamente rápido (HMR instantáneo)
- ✅ Configuración simple
- ✅ Optimizaciones automáticas
- ✅ Code splitting integrado
- ✅ Soporte nativo para TypeScript
- ✅ Ecosistema moderno

**Configuración:**
- Minificación: Terser
- Code splitting: Manual chunks por tipo (services, components, pages)
- Source maps: Habilitados para debugging

## Consecuencias

### Positivas
- ✅ Desarrollo muy rápido (HMR)
- ✅ Builds optimizados automáticamente
- ✅ Configuración simple
- ✅ Excelente DX

### Negativas
- ⚠️ Requiere Node.js 18+ (pero es estándar ahora)
- ⚠️ Menos plugins que Webpack (pero suficientes)

### Alternativas Consideradas
- **Webpack**: Más lento, más complejo, más plugins
- **Rollup**: Mejor para librerías, menos para apps completas

---

**Fecha:** 2024
**Autor:** Equipo de desarrollo


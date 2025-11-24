# ADR-002: Abstracción de Storage

## Estado
Aceptada

## Contexto

El proyecto actualmente usa `localStorage` para persistencia, pero en el futuro necesitará:
- Sincronización entre dispositivos
- Múltiples usuarios
- Backup en la nube
- Funcionalidades colaborativas

Cambiar de `localStorage` a API requeriría modificar todo el código que accede a storage.

## Decisión

Crear una **abstracción de storage** usando el patrón **Interface**:

```typescript
interface IStorageService {
    getPlans(): Promise<Plan[]>;
    savePlan(plan: Plan): Promise<void>;
    // ... más métodos
}
```

**Implementaciones:**
- `LocalStorageService` - Implementación actual
- `ApiStorageService` - Implementación futura para API

**Factory Pattern:**
- `StorageFactory.create()` - Retorna la implementación correcta según configuración

## Consecuencias

### Positivas
- ✅ Migración a API será transparente
- ✅ Código de negocio no cambia al cambiar storage
- ✅ Fácil de testear (mock de storage)
- ✅ Preparado para futuro

### Negativas
- ⚠️ Overhead de abstracción (mínimo)
- ⚠️ Todos los métodos deben ser async (incluso localStorage)

### Mitigación
- Interface bien diseñada
- Documentación clara
- Tests de ambas implementaciones

---

**Fecha:** 2024
**Autor:** Equipo de desarrollo


# Evidencia de Tests Automáticos

A continuación, se detalla la evidencia de ejecución exitosa de la suite de tests automáticos del backend requerida para la aprobación de la materia.

Los tests fueron ejecutados utilizando el framework [Vitest](https://vitest.dev/) con una base de datos `sqlite::memory:` configurada de forma temporal.

### Resumen de la Ejecución

- **Tests Totales:** 24
- **Archivos de Test:** 6
- **Resultado:** 100% Passed (24/24)

---

## Output de la Consola

Ejecutando el comando:
```bash
npm run test:all
```

**Resultado:**

```text
 ✓ test/integration/orders.routes.integration.spec.js (2 tests) 65ms
 ✓ test/unit/user.model.unit.spec.js (4 tests) 26ms
 ✓ test/unit/review.model.unit.spec.js (3 tests) 15ms
 ✓ test/unit/orderProduct.model.unit.spec.js (4 tests) 17ms
 ✓ test/unit/category.model.unit.spec.js (5 tests) 19ms
 ✓ test/unit/product.model.unit.spec.js (6 tests) 18ms

 Test Files  6 passed (6)
      Tests  24 passed (24)
   Start at  19:58:14
   Duration  871ms (transform 135ms, setup 0ms, import 2.01s, tests 277ms, environment 1ms)
```

## Cobertura

La suite actual se divide en dos secciones principales:

1. **Tests Unitarios (`test/unit/`):** Validan el comportamiento aislado de los modelos de base de datos (`User`, `Product`, `Category`, `Review`, `OrderProduct`), sus restricciones, validaciones personalizadas y defaults (por ejemplo, validación de contraseñas de usuarios, stock mínimo de productos).
2. **Tests de Integración (`test/integration/`):** Validan que las rutas y controladores interactuen correctamente con la base de datos real o simulada (en este caso SQLite in-memory), el middleware de autenticación (supertest simulando peticiones HTTP), y las externalidades simuladas (ej. bypass para tests de Stripe).

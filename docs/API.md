# Documentación de la API (Backend)

Esta sección detalla los diferentes endpoints expuestos por la API REST del backend. Todas las rutas se acceden bajo el prefijo `/api`.

Los endpoints que requieren autenticación HTTP deben incluir el token en la cabecera `Authorization` con el formato `Bearer <token>`.

---

## Usuarios (`/api/users`)

| Método | Endpoint | Acceso | Descripción |
| ------ | -------- | ------ | ----------- |
| `POST` | `/register` | Público | Registra un nuevo usuario en la aplicación. |
| `POST` | `/login` | Público | Autentica a un usuario y devuelve un token JWT. |
| `GET`  | `/profile` | Auth | Devuelve los datos del perfil del usuario autenticado. |
| `PUT`  | `/profile` | Auth | Actualiza la información del perfil del usuario autenticado. |
| `PUT`  | `/:id` | Auth | Actualiza los datos de un usuario específico. |
| `DELETE`| `/:id` | Auth | Elimina un usuario. |
| `GET`  | `/` | Admin | Devuelve una lista con todos los usuarios registrados. |
| `GET`  | `/:id` | Admin | Devuelve el detalle de un usuario por su ID. |

---

## Productos (`/api/products`)

| Método | Endpoint | Acceso | Descripción |
| ------ | -------- | ------ | ----------- |
| `GET`  | `/top-selling` | Público | Obtiene los productos más vendidos. |
| `GET`  | `/` | Público | Obtiene el listado de productos activos. |
| `GET`  | `/category/:categoryId` | Público | Filtra productos activos pertenecientes a una categoría específica. |
| `GET`  | `/by-ids` | Público | Obtiene múltiples productos por una lista de IDs proporcionados. |
| `GET`  | `/:id` | Público | Devuelve la información detallada de un producto por su ID. |
| `GET`  | `/admin/all` | Admin | Obtiene **todos** los productos, incluyendo los inactivos/deshabilitados. |
| `POST` | `/` | Admin | Crea un nuevo producto. |
| `PUT`  | `/:id` | Admin | Actualiza los detalles de un producto existente. |
| `PUT`  | `/:id/disable` | Admin | Desactiva (oculta) un producto del catálogo público. |
| `PUT`  | `/:id/enable` | Admin | Vuelve a activar un producto. |

---

## Pedidos / Órdenes (`/api/orders`)

| Método | Endpoint | Acceso | Descripción |
| ------ | -------- | ------ | ----------- |
| `GET`  | `/productos-mas-vendidos` | Público | Obtiene métricas o lista de los productos más vendidos. |
| `GET`  | `/my-orders` | Auth | Obtiene el historial de pedidos del propio usuario. |
| `GET`  | `/:id` | Auth | Obtiene el detalle de un pedido (el usuario debe ser el propietario o ser admin). |
| `POST` | `/` | Auth | Crea o registra un nuevo pedido manualmente. |
| `GET`  | `/` | Admin | Obtiene el listado completo de todos los pedidos del sistema. |
| `PUT`  | `/:id` | Admin | Actualiza el estado de un pedido específico. |
| `DELETE`| `/:id` | Admin | Elimina una orden. |

---

## Checkout / Pagos (`/api/checkout`)

| Método | Endpoint | Acceso | Descripción |
| ------ | -------- | ------ | ----------- |
| `POST` | `/` | Auth | Genera una sesión de pago (Stripe Checkout) y devuelve la URL para redirigir al usuario. |
| `POST` | `/confirm` | Auth | Confirma un pago exitoso y registra la orden y sus detalles en base de datos. |

---

## Categorías (`/api/categories`)

| Método | Endpoint | Acceso | Descripción |
| ------ | -------- | ------ | ----------- |
| `GET`  | `/` | Público | Devuelve una lista con todas las categorías. |
| `GET`  | `/:id` | Público | Devuelve el detalle de una categoría por su ID. |
| `POST` | `/` | Admin | Crea una nueva categoría en el sistema. |
| `PUT`  | `/:id` | Admin | Actualiza el nombre o descripción de una categoría. |
| `DELETE`| `/:id` | Admin | Elimina una categoría del sistema. |

---

## Reseñas (`/api/reviews`)

| Método | Endpoint | Acceso | Descripción |
| ------ | -------- | ------ | ----------- |
| `GET`  | `/product/:productId`| Público | Obtiene todas las reseñas asociadas a un producto. |
| `GET`  | `/:id` | Público | Obtiene una reseña por su ID. |
| `PUT`  | `/:id` | Público | Actualiza una reseña específica. |
| `POST` | `/` | Auth | Crea una nueva reseña para un producto habiendo comprobado la autoría. |
| `DELETE`| `/:id`| Auth | Elimina una reseña (requiere ser el autor o admin). |

---

## Relación Pedido-Producto (`/api/orderProducts`)

Rutas internas para gestionar las transacciones o items individuales vinculados a una orden de compra.

| Método | Endpoint | Acceso | Descripción |
| ------ | -------- | ------ | ----------- |
| `GET`  | `/` | Público | Obtiene todas las relaciones creadas. |
| `POST` | `/` | Público | Crea un item dentro de una orden. |
| `GET`  | `/:orderId/:productId` | Público | Localiza el cruce entre una orden y un producto. |
| `PUT`  | `/:orderId/:productId` | Público | Modifica la cantidad o precio congelado de un item dentro de un pedido. |
| `DELETE`| `/:orderId/:productId` | Público | Elimina un producto de una orden específica. |

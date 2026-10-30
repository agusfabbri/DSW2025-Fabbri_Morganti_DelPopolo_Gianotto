# TP DSW

📄 **[Ver Documentación del Proyecto y API](./docs/README.md)** | 🌐 **[Ver Deploy Backend](https://dsw2025-fabbri-morganti-delpopolo.onrender.com)**

## ⚙️ Instrucciones de Instalación y Ejecución (Backend)

Sigue estos pasos para instalar y ejecutar el entorno de desarrollo localmente.

### 1. Requisitos Previos
- **[Node.js](https://nodejs.org/)** (v18 o superior) y **npm**.
- **[MySQL](https://www.mysql.com/)** instalado y ejecutándose en el puerto `3306`.
- Opcional pero recomendado: un cliente de DB como MySQL Workbench o DBeaver para gestionar la base de datos `ecommerce`.

### 2. Instalación
1. Clona el repositorio del proyecto.
2. Abre una terminal y sitúate en la carpeta `backend`:
   ```bash
   cd backend
   ```
3. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```
   > **Nota:** Esto instalará `express`, `sequelize`, `mysql2`, `dotenv`, librerías para auth (`jsonwebtoken`, `bcryptjs`), pagos (`stripe`, `mercadopago`) y herramientas de desarrollo (`vitest`, `nodemon`, etc).

### 3. Configuración del Entorno (.env)
En la raíz de la carpeta `backend/`, crea un archivo llamado `.env` y configura las variables de entorno basándote en este ejemplo:

```env
PORT=3000

# Configuración de Base de Datos (MySQL)
DB_HOST=localhost
DB_USER=root
# Cambia esta contraseña por la que uses en tu MySQL local
DB_PASSWORD=1234
DB_NAME=ecommerce
DB_PORT=3306

# Secretos y Claves
JWT_SECRET=tpdsw
FRONTEND_ORIGIN=http://localhost:4200
STRIPE_SECRET_KEY=tu_clave_secreta_de_stripe_test
RECAPTCHA_SECRET=tu_clave_secreta_de_recaptcha
```
> **Importante:** Asegúrate de que tu servidor MySQL local tenga creada la base de datos `ecommerce`. Si no existe, créala antes de iniciar el proyecto (`CREATE DATABASE ecommerce;`).

### 4. Ejecución del Servidor
Para iniciar el servidor en **modo desarrollo** (con recarga automática mediante `nodemon`):
```bash
npm run dev
```

Para iniciar el servidor en **modo producción**:
```bash
npm start
```

El servidor estará corriendo en `http://localhost:3000`.

### 5. Pruebas (Testing)
El proyecto utiliza **Vitest** (junto a SQLite en memoria) para las pruebas unitarias y de integración.
Para ejecutar los tests, utiliza:
```bash
# Ejecutar todos los tests (unitarios + integración)
npm run test:all

# Ejecutar tests en modo watch
npm run test:watch
```
# Guía de Deploy del Backend

Esta guía detalla los pasos sugeridos para desplegar (deployar) el backend de la aplicación utilizando plataformas gratuitas comúnmente usadas en entornos académicos o proyectos iniciales.

El proyecto es una API construida en **Node.js (Express)**, que usa **MySQL** como base de datos externa.

---

## Opciones de Hosting Gratuito Recomendadas

Para cumplir con los requisitos del TP (Backend agnóstico + DB persistente), se recomiendan usar dos servicios separados pero conectados entre sí:

### 1. Base de Datos MySQL
En general, los servicios gratuitos de Node (como Render) no incluyen bases de datos relacionales gratuitas de forma permanente.
* **[Aiven](https://aiven.io/)**: (🌟 Recomendado) Ofrecen un plan MySQL 8.0 completamente gratuito sin necesidad de tarjeta de crédito.
* **[Railway](https://railway.app/)**: Ideal para la base de datos (y también pueden alojar el backend ahí, pero dan un crédito mensual que se puede agotar).
* **[PlanetScale](https://planetscale.com/)**: Opcional, pero están quitando los tiers gratuitos, por lo que Aiven o Railway son apuestas más seguras actualmente.

### 2. Hosting para el Backend (Node.js)
* **[Render.com](https://render.com)**: (🌟 Recomendado) Muy fácil de usar conectando directamente el repositorio de GitHub y usando el Web Service gratuito.
* **[Vercel](https://vercel.com)**: Opcional, pero la configuración para una app de Express puede requerir crear un archivo `vercel.json`.

---

## 🚀 Paso a Paso (Backend en Render + DB en Aiven)

### Paso 1: Crear la Base de Datos Externa
1. Regístrate en [Aiven.io](https://aiven.io/).
2. Crea un nuevo servicio seleccionando **MySQL**.
3. Elige la región más cercana (ej. USA East o Brasil) y selecciona el **Free Plan**.
4. Una vez creado, ve a la pestaña de `Overview` o `Connection Information`. Ahí obtendrás:
   * **Host:** `mysql-...aivencloud.com`
   * **Port:** `2xxxx`
   * **User:** `avnadmin`
   * **Password:** (Copia la contraseña provista)
   * **Database:** `defaultdb`

> **Nota:** Conectate temporalmente a esa DB remota desde tu computadora (usando DBeaver o el propio backend) para validar que la conexión funciona antes de subir tu backend.

### Paso 2: Preparar el Repositorio de GitHub
Tu código ya de por si está listo para producción mediante el comando `npm start`, pero asegurate de lo siguiente antes de hacer push en GitHub:

1. El archivo `package.json` debe tener el script de `start`:
   ```json
   "scripts": {
     "start": "node src/index.js",
     "dev": "nodemon src/index.js", ...
   }
   ```
2. Asegurarte de **no subir nunca el archivo `.env`** al repositorio público (está ignorado en `.gitignore`).

### Paso 3: Subir a Render
1. Inicia sesión en [Render.com](https://render.com) usando GitHub.
2. Ve a **"New +" -> "Web Service"**.
3. Selecciona la opción de **"Build and deploy from a Git repository"** y vincula el repositorio de tu proyecto DSW.
4. En la configuración del servicio, usa lo siguiente:
   * **Environment:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `npm start`
   * **Plan:** Free
5. **¡Importante! Variables de Entorno (Environment Variables):**
   Debajo en la misma sección, ve a **Environment** y añade las variables de tu archivo `.env` local, pero con los datos de producción:
   * `PORT`: `3000` (o dejarlo vacío, Render usa el suyo).
   * `DB_HOST`: (El Host de Aiven)
   * `DB_USER`: `avnadmin`
   * `DB_PASSWORD`: (La contraseña de Aiven)
   * `DB_NAME`: `defaultdb`
   * `DB_PORT`: (El puerto generado por Aiven)
   * `JWT_SECRET`: (Tu secreto duro)
   * `STRIPE_SECRET_KEY`: (La key de Stripe)
   * `FRONTEND_ORIGIN`: (La URL donde vayas a subir tu frontend, ej: `https://tp-dsw-front.vercel.app`. Si el front todavía no está subido, puedes poner `*` temporalmente, pero no recomendado para producción).
   * `ALLOW_DB_SYNC`: `true` (⚠️ Importante: Agrega esto al menos en el primer deploy para que las tablas de la base de datos se creen mágicamente la primera vez que inicia).
6. Haz clic en **Create Web Service**.

### Paso 4: Finalizar
El sistema construirá el proyecto y levantará la API Node. Te asignarán una URL parecida a `https://tu-proyecto.onrender.com`.

Esa URL será la que deberás reemplazar en tu frontend o en Postman para hacerle pegadas a la API y probar que todo funcione.

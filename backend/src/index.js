require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();

// Configurar CORS
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:4200',
  })
);

app.use(express.json());

// Middleware para tests (inyecta req.user si llega x-test-user-id)
if (process.env.NODE_ENV === 'test') {
  app.use((req, res, next) => {
    if (req.headers['x-test-user-id']) {
      req.user = { id: Number(req.headers['x-test-user-id']) };
    }
    next();
  });
}

// Ruta base
app.get('/', (req, res) => {
  res.send('API de ecommerce funcionando ');
});

// Rutas del proyecto
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderProductRoutes = require('./routes/orderProductRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes'); // Stripe

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orderProducts', orderProductRoutes);
app.use('/api/checkout', checkoutRoutes);

// Exportamos app para tests (supertest) sin ejecutar listen()
module.exports = app;

// Si el archivo se ejecuta directamente, inicializamos DB y arrancamos el servidor.
// Protegemos sync() para evitar tocar la BD real por accidente.
if (require.main === module) {
  (async () => {
    try {
      await sequelize.authenticate();
      console.log(' Conexión a la base de datos establecida');

      if (process.env.NODE_ENV === 'test') {
        // tests => usar force (esperamos sqlite in-memory)
        await sequelize.sync({ force: true });
        console.log(' Modelos sincronizados con la base de datos (test - force true)');
      } else if (process.env.NODE_ENV !== 'production' && process.env.ALLOW_DB_SYNC === 'true') {
        // desarrollo explícito (solo si ALLOW_DB_SYNC=true)
        await sequelize.sync({ alter: true });
        console.log(' Modelos sincronizados con la base de datos (dev - alter true)');
      } else {
        // por defecto no sincronizar automáticamente en dev/production
        console.log(
          'Sincronización automática de la BD deshabilitada. Para habilitar alter en development ejecutá:\n  ALLOW_DB_SYNC=true npm start'
        );
      }

      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => {
        console.log(` Servidor corriendo en puerto ${PORT}`);
      });
    } catch (err) {
      console.error(' Error al iniciar la app:', err);
      process.exit(1);
    }
  })();
}

/* version anterior por si falla algo:
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models'); 

const app = express();

//  Configurar CORS correctamente para permitir solo tu front
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "http://localhost:4200"
}));

app.use(express.json());

// Ruta base 
app.get('/', (req, res) => {
  res.send('API de ecommerce funcionando ');
});

// Rutas del proyecto
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderProductRoutes = require('./routes/orderProductRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes'); // Stripe 

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orderProducts', orderProductRoutes);
app.use('/api/checkout', checkoutRoutes);

// Conexión a la base de datos
sequelize.authenticate()
  .then(() => console.log(' Conexión a la base de datos establecida'))
  .catch(err => console.error(' Error de conexión:', err));

sequelize.sync({ alter: true }) // solo para desarrollo
  .then(() => console.log(' Modelos sincronizados con la base de datos'))
  .catch(err => console.error(' Error al sincronizar modelos:', err));

// Servidor escuchando
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` Servidor corriendo en puerto ${PORT}`);
}); */
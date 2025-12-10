// fijar NODE_ENV antes de cualquier require
process.env.NODE_ENV = 'test';

const request = require('supertest');
const sequelize = require('../../src/config/db'); // instancia de Sequelize (ahora sqlite::memory:)
const User = require('../../src/models/user');
const Order = require('../../src/models/order');
const app = require('../../src/index');

describe('GET /api/orders/my-orders (integration)', () => {
  beforeAll(async () => {
    // sincroniza esquema en sqlite::memory:
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    // limpia datos antes de cada test
    await sequelize.truncate({ cascade: true });
  });

  afterAll(async () => {
    // cierra conexión DB
    await sequelize.close();
  });

  it('debería devolver 200 y una lista de pedidos de un usuario existente', async () => {
    // crea user de prueba
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password',
    });

    // crea pedidos asociados (usa la FK correcta según tu modelo)
    await Order.create({ totalAmount: 100.0, status: 'pendiente', userId: user.id });
    await Order.create({ totalAmount: 50.0, status: 'pendiente', userId: user.id });

    // DEBUG opcional: comprobar qué hay en DB antes de la petición
    // const all = await Order.findAll(); console.log('Orders in DB:', all.map(o=> ({id:o.id, userId: o.userId || o.UserId, totalAmount: o.totalAmount})));

    const res = await request(app)
      .get('/api/orders/my-orders')
      .set('x-test-user-id', String(user.id))
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);

    const first = res.body[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('totalAmount');
    expect(first.totalAmount).toBeDefined();
  });

  it('debería devolver 200 (array vacío) para un usuario sin ordenes', async () => {
    const user = await User.create({
      name: 'Empty',
      email: `empty-${Date.now()}@example.com`,
      password: 'x',
    });

    const res = await request(app)
      .get('/api/orders/my-orders')
      .set('x-test-user-id', String(user.id))
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });
});

/* const request = require('supertest');
const sequelize = require('../../src/config/db'); // debe devolver la instancia de Sequelize
const User = require('../../src/models/user');     
const Order = require('../../src/models/order'); 
const app = require('../../src/index');           // exportar app sin listen()

describe('GET /api/orders/my-orders (integration)', () => {
  beforeAll(async () => {
    // validación del modo test
    process.env.NODE_ENV = 'test';
    // sincroniza esquema en sqlite::memory:
    await sequelize.sync({ force: true });
 });

  afterAll(async () => {
    // cierra conexión DB
    await sequelize.close();
  });

  it('debería devolver 200 y una lista de pedidos de un usuario existente', async () => {
    // crea user de prueba
    const user = await User.create({
      // adapta campos según tu modelo user.js
      name: 'Test User',
      email: 'test@example.com',
      password: 'password' 
    });

    // crea algunos pedidos para ese usuario
    await Order.create({ totalAmount: 100.0, status: 'pendiente', userId: user.id });
    await Order.create({ totalAmount: 50.0, status: 'pendiente', userId: user.id });

    // hace una petición indicando header de test para que middleware inyecte req.user
    const res = await request(app)
      .get('/api/orders/my-orders')
      .set('x-test-user-id', String(user.id))
      .expect(200);

    // chequea estructura de respuesta
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);

    // chequea estructura del primer pedido
    const first = res.body[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('totalAmount');
    expect(first.totalAmount).toBeDefined();
  });

  it('debería devolver 200 (array vacío) para un usuario sin ordenes', async () => {
    const user = await User.create({
      name: 'Empty',
      email: `empty-${Date.now()}@example.com`,
      password: 'x'
    });

    const res = await request(app)
      .get('/api/orders/my-orders')
      .set('x-test-user-id', String(user.id))
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

});*/

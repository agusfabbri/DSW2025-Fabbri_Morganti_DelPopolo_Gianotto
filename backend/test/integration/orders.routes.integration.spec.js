// fijar NODE_ENV antes de cualquier require
process.env.NODE_ENV = 'test';

const request = require('supertest');
const sequelize = require('../../src/config/db'); // instancia de Sequelize (ahora sqlite::memory:)
const User = require('../../src/models/user');
const Order = require('../../src/models/order');
const app = require('../../src/index');

// Lifecycle global para todos los describes del archivo
beforeAll(async () => {
  await sequelize.sync({ force: true });
});

beforeEach(async () => {
  await sequelize.truncate({ cascade: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('GET /api/orders/my-orders (integration)', () => {

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

describe('POST /api/orders (integration - validación middleware)', () => {

  it('debería devolver 401 si no se envía autenticación', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ items: [{ productId: 1, quantity: 2 }], totalAmount: 100 });

    expect(res.status).toBe(401);
  });

  it('debería devolver 400 si items está vacío (middleware validateCreateOrder)', async () => {
    const user = await User.create({
      name: 'Test',
      email: `test-${Date.now()}@example.com`,
      password: 'password',
    });

    const res = await request(app)
      .post('/api/orders')
      .set('x-test-user-id', String(user.id))
      .send({ items: [], totalAmount: 100 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('debería devolver 400 si un item no tiene productId válido', async () => {
    const user = await User.create({
      name: 'Test2',
      email: `test2-${Date.now()}@example.com`,
      password: 'password',
    });

    const res = await request(app)
      .post('/api/orders')
      .set('x-test-user-id', String(user.id))
      .send({ items: [{ quantity: 2 }], totalAmount: 50 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
});


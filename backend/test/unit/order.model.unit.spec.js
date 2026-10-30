const { Sequelize, DataTypes } = require('sequelize');

describe('Order model (unit)', () => {
  /** @type {Sequelize} */
  let sequelize;
  let Order;

  // instancia en memoria para test unitario
  beforeAll(async () => {
    sequelize = new Sequelize('sqlite::memory:', { logging: false });

    // definición el modelo order
    Order = sequelize.define('Order', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      status: { type: DataTypes.STRING, defaultValue: 'pendiente' },
      totalAmount: { type: DataTypes.FLOAT, allowNull: false },
    }, { timestamps: true });

    // sincronización del esquema en memoria
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('debería establecer el estado "pendiente" por defecto cuando se crea sin estado', async () => {
    const order = await Order.create({ totalAmount: 123.45 });
    expect(order.status).toBe('pendiente');
    //comprobar que totalAmount se guarda correctamente
    expect(order.totalAmount).toBeCloseTo(123.45, 5);
  });

  it('debería requerir totalAmount (no acepta un valor vacío)', async () => {
    // intentar crear una orden sin totalAmount debería fallar
    await expect(Order.create({})).rejects.toThrow();
  });

  it('debería autoincrementar el id y almacenar los decimales', async () => {
    const a = await Order.create({ totalAmount: 1.5 });
    const b = await Order.create({ totalAmount: 2.5 });
    expect(typeof a.id).toBe('number');
    expect(b.id).toBeGreaterThan(a.id);
    expect(a.totalAmount).toBeCloseTo(1.5, 5);
    expect(b.totalAmount).toBeCloseTo(2.5, 5);
  });
});

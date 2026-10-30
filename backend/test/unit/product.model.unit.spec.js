const { ValidationError, UniqueConstraintError } = require('sequelize');
const sequelize = require('../../src/config/db');
const Product = require('../../src/models/Product');

describe('Product model (unit)', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true }); // crea esquema en sqlite::memory:
  });

  beforeEach(async () => {
    await sequelize.truncate({ cascade: true }); // limpia estado entre tests
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('debería mostrar el modelo y sus atributos básicos', () => {
    expect(Product).toBeDefined();
    expect(Product.rawAttributes).toBeDefined();
    expect(Product.rawAttributes).toHaveProperty('id');
    expect(Product.rawAttributes).toHaveProperty('name');
    expect(Product.rawAttributes).toHaveProperty('price');
    expect(Product.rawAttributes).toHaveProperty('description');
    expect(Product.rawAttributes).toHaveProperty('image');
    expect(Product.rawAttributes).toHaveProperty('stock');
    expect(Product.rawAttributes).toHaveProperty('active');

    expect(Product.rawAttributes.name.allowNull).toBe(false);  // checks de constraints/defaults
    expect(Product.rawAttributes.name.unique).toBeTruthy();
    expect(Product.rawAttributes.price.allowNull).toBe(false);
    expect(Product.rawAttributes.stock.defaultValue).toBe(0);
    expect(Product.rawAttributes.active.defaultValue).toBe(true);
  });

  it('debería crear un producto válido y aplicar defaults', async () => {
    const p = await Product.create({
      name: `Producto ${Date.now()}`,
      price: 123.45,
      description: 'Descripción de prueba',
      image: 'img.jpg'   // stock y active se aplican con default
    });

    expect(p).toBeDefined();
    expect(p.id).toBeGreaterThan(0);
    expect(p.name).toBeDefined();
    expect(p.price).toBeCloseTo(123.45);
    expect(p.description).toBe('Descripción de prueba');
    expect(p.image).toBe('img.jpg');
    expect(p.stock).toBe(0);
    expect(p.active).toBe(true);
  });

  it('debería fallar cuando faltan campos requeridos (name o price)', async () => {
    await expect(Product.create({})).rejects.toBeInstanceOf(ValidationError); // sin nada -> ValidationError (NOT NULL)
    
    await expect(Product.create({ name: `P-${Date.now()}` })).rejects.toBeInstanceOf(ValidationError); // sin price (name presente) -> ValidationError
    
    await expect(Product.create({ price: 10.0 })).rejects.toBeInstanceOf(ValidationError); // sin name (price presente) -> ValidationError
  });

  it('debería respetar restricción UNIQUE en name', async () => {
    const name = `UNIQ-${Date.now()}`;
    await Product.create({ name, price: 1.0 });
    await expect(Product.create({ name, price: 2.0 })).rejects.toBeInstanceOf(UniqueConstraintError);
  });

  it('stock y active deben aceptar valores personalizados', async () => {
    const p = await Product.create({ name: `P2-${Date.now()}`, price: 9.99, stock: 5, active: false });
    expect(p.stock).toBe(5);
    expect(p.active).toBe(false);
  });
});

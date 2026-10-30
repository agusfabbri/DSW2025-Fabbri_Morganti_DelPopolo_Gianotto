const { ValidationError } = require('sequelize');
const sequelize = require('../../src/config/db');
const Review = require('../../src/models/review');

describe('Review model (unit)', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true }); // crea esquema en sqlite::memory:
  });

  beforeEach(async () => {
    await sequelize.truncate({ cascade: true }); // limpia estado entre tests
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('debería exponer el modelo y sus atributos básicos', () => {
    expect(Review).toBeDefined();
    expect(Review.rawAttributes).toBeDefined();
    expect(Review.rawAttributes).toHaveProperty('id');
    expect(Review.rawAttributes).toHaveProperty('rating');
    expect(Review.rawAttributes).toHaveProperty('comment');
    expect(Review.rawAttributes.rating.allowNull).toBe(false); // rating no debe permitir null
  });

  it('debería crear una review válida (rating + comment opcional) y tener timestamps', async () => {
    const r = await Review.create({ rating: 4, comment: 'Buen producto' });
    expect(r).toBeDefined();
    expect(r.id).toBeGreaterThan(0);
    expect(r.rating).toBe(4);
    expect(r.comment).toBe('Buen producto');

    expect(r.createdAt).toBeDefined(); // timestamps (createdAt/updatedAt) están activados en el modelo
    expect(r.updatedAt).toBeDefined();

    const found = await Review.findByPk(r.id);
    expect(found).toBeTruthy();
    expect(found.rating).toBe(4);
  });

  it('debería permitir crear una review sin comment (campo opcional)', async () => {
    const r = await Review.create({ rating: 5 });
    expect(r).toBeDefined();
    expect(r.comment == null).toBe(true);
  });

  it('debería fallar cuando falta rating (ValidationError)', async () => {
    await expect(Review.create({})).rejects.toBeInstanceOf(ValidationError);
  });

  it('debería fallar cuando rating está fuera del rango (menor que 1)', async () => {
    await expect(Review.create({ rating: 0 })).rejects.toBeInstanceOf(ValidationError);
  });

  it('debería fallar cuando rating está fuera del rango (mayor que 5)', async () => {
    await expect(Review.create({ rating: 10 })).rejects.toBeInstanceOf(ValidationError);
  });
});

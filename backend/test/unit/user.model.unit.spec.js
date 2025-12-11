const { ValidationError, UniqueConstraintError } = require('sequelize');
const sequelize = require('../../src/config/db');
const User = require('../../src/models/user');

describe('User model (unit)', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true }); // crea el esquema en sqlite::memory:
  });

  beforeEach(async () => {
    await sequelize.truncate({ cascade: true }); // limpia estado entre tests
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('debería exponer el modelo y sus atributos básicos', () => {
    expect(User).toBeDefined();
    expect(User.rawAttributes).toBeDefined();
    expect(User.rawAttributes).toHaveProperty('id');
    expect(User.rawAttributes).toHaveProperty('name');
    expect(User.rawAttributes).toHaveProperty('email');
    expect(User.rawAttributes).toHaveProperty('password');
    expect(User.rawAttributes).toHaveProperty('role');

    expect(User.rawAttributes.name.allowNull).toBe(false);
    expect(User.rawAttributes.email.allowNull).toBe(false);
    expect(User.rawAttributes.password.allowNull).toBe(false);

    expect(User.rawAttributes.role.defaultValue).toBe('user'); // role tiene default 'user'
  });

  it('debería crear un usuario válido', async () => {
    const u = await User.create({
      name: 'Usuario Test',
      email: `u${Date.now()}@example.com`,
      password: 'secreto',
    });

    expect(u).toBeDefined();
    expect(u.id).toBeGreaterThan(0);
    expect(u.name).toBe('Usuario Test');
    expect(u.role).toBe('user'); // default
  });

  it('debería fallar si faltan campos requeridos', async () => {
    await expect(User.create({})).rejects.toBeInstanceOf(ValidationError); // sin campos requeridos
  });

  it('si email no es único (unique comentado) permite duplicados', async () => {
    const email = `dup-${Date.now()}@example.com`;
    const u1 = await User.create({ name: 'A', email, password: 'x' });
    const u2 = await User.create({ name: 'B', email, password: 'y' });

    expect(u1).toBeDefined();
    expect(u2).toBeDefined();
    expect(u2.id).toBeGreaterThan(u1.id);
  });
});

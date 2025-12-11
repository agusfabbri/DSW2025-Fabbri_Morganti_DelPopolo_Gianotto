const {UniqueConstraintError, ValidationError} = require('sequelize');
const sequilize = require('../../src/config/db');
const Category = require('../../src/models/category');

describe('Category model (unit)', () => {
    beforeAll(async () => {
        await sequilize.sync({ force: true }); //crea esquema en sqlite::memory:
    });
    
    beforeEach(async () => {
        await sequilize.truncate({ cascade: true }); //limpia estado antes de cada test
    });

    afterAll(async () => {
        await sequilize.close();
    });
    it('debería mostrar el modelo y sus atributos básicos', () => {
        expect(Category).toBeDefined();
        expect(Category.rawAttributes).toBeDefined();
        expect(Category.rawAttributes).toHaveProperty('id');
        expect(Category.rawAttributes).toHaveProperty('name');
        expect(Category.rawAttributes.name.allowNull).toBe(false); //no debería permitir nombre nulo
        expect(Category.rawAttributes.name.unique).toBeTruthy; //nombre debería ser único
    });
    it('debería crear una categoría válida', async () => {
        const cat = await Category.create({ name: 'Electrónica' });
        expect(cat.id).toBeDefined();
        expect(cat.id).toBeGreaterThan(0);
        expect(cat.name).toBe('Electrónica');

        const found = await Category.findOne({where: {name: 'Electrónica'}});
        expect(found).toBeTruthy();
        expect(found.name).toBe('Electrónica');
    });

    it('debería fallar al crear una categoría sin nombre', async () => {
        await expect(Category.create({})).rejects.toBeInstanceOf(ValidationError);
    });

    it('debería fallar al crear categorías con nombres duplicados', async () => {
        await Category.create({ name: 'Libros' });
        await expect(Category.create({ name: 'Libros' })).rejects.toBeInstanceOf(UniqueConstraintError);
    });
});
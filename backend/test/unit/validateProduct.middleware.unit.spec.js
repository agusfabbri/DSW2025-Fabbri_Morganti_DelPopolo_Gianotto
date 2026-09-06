const validateProduct = require('../../src/middlewares/validateProduct');

// Helper para crear objetos mock de req, res, next
const mockReq = (body = {}) => ({ body });
const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};
const mockNext = () => vi.fn();

describe('validateProduct middleware (unit)', () => {

  it('debería pasar al next() cuando todos los campos son válidos', () => {
    const req = mockReq({ name: 'Remera', price: 25.5, stock: 10, categoryId: 1 });
    const res = mockRes();
    const next = mockNext();

    validateProduct(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('debería devolver 400 si falta el nombre', () => {
    const req = mockReq({ price: 10, stock: 5, categoryId: 1 });
    const res = mockRes();
    const next = mockNext();

    validateProduct(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'El nombre del producto es requerido.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debería devolver 400 si el nombre es un string vacío', () => {
    const req = mockReq({ name: '   ', price: 10, stock: 5, categoryId: 1 });
    const res = mockRes();
    const next = mockNext();

    validateProduct(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('debería devolver 400 si falta el precio', () => {
    const req = mockReq({ name: 'Remera', stock: 5, categoryId: 1 });
    const res = mockRes();
    const next = mockNext();

    validateProduct(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'El precio es requerido y debe ser un número mayor o igual a 0.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debería devolver 400 si el precio es negativo', () => {
    const req = mockReq({ name: 'Remera', price: -5, stock: 5, categoryId: 1 });
    const res = mockRes();
    const next = mockNext();

    validateProduct(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('debería devolver 400 si el stock no es entero', () => {
    const req = mockReq({ name: 'Remera', price: 10, stock: 2.5, categoryId: 1 });
    const res = mockRes();
    const next = mockNext();

    validateProduct(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'El stock es requerido y debe ser un entero mayor o igual a 0.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debería devolver 400 si falta categoryId', () => {
    const req = mockReq({ name: 'Remera', price: 10, stock: 5 });
    const res = mockRes();
    const next = mockNext();

    validateProduct(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'La categoría es requerida.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debería aceptar precio 0 y stock 0 como válidos', () => {
    const req = mockReq({ name: 'Gratis', price: 0, stock: 0, categoryId: 2 });
    const res = mockRes();
    const next = mockNext();

    validateProduct(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});

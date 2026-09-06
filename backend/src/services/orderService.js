const { Product } = require('../models');

const validateOrderProducts = async (items, transaction = null) => {
  const productIds = items.map(i => Number(i.productId));
  const productsDB = await Product.findAll({ where: { id: productIds }, transaction });

  for (const item of items) {
    const prod = productsDB.find(p => Number(p.id) === Number(item.productId));
    
    if (!prod) {
      const error = new Error(`Producto con ID ${item.productId} no encontrado`);
      error.status = 404;
      throw error;
    }
    if (!prod.active) {
      const error = new Error(`El producto "${prod.name}" fue desactivado y no puede comprarse.`);
      error.status = 400;
      throw error;
    }
    if (prod.stock < item.quantity) {
      const error = new Error(`Stock insuficiente para "${prod.name}". Stock actual: ${prod.stock}`);
      error.status = 400;
      throw error;
    }
  }
  
  return productsDB;
};

module.exports = { validateOrderProducts };

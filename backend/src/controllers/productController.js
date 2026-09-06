const { Sequelize } = require('sequelize');
const Category = require('../models/category');
const { OrderProduct, Product } = require('../models');

// ===============================
// GET TODOS (solo activos por defecto)
// ===============================
const getAllProducts = async (req, res) => {
  try {
    const { categoryId } = req.query;

    const options = {
      where: { active: true },
      include: Category,
    };

    if (categoryId) {
      options.where.categoryId = categoryId;
    }

    const products = await Product.findAll(options);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// ===============================
// GET TODOS ADMIN
// ===============================
const getAllProductsAdmin = async (req, res) => {
  try {
    const { categoryId } = req.query;

    const options = {
      include: Category,
    };

    if (categoryId) {
      options.where = { categoryId };
    }

    const products = await Product.findAll(options);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos para admin' });
  }
};

// ===============================
// GET PRODUCT BY ID (👉 FIX REALIZADO)
// ===============================
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: {
        model: Category,
        attributes: ['id', 'name'], // <<-- CARGA EL NOMBRE DE LA CATEGORÍA
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener producto por ID' });
  }
};

// ===============================
// GET POR CATEGORÍA (solo activos)
// ===============================
const getProductsByCategory = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const products = await Product.findAll({
      where: { categoryId, active: true },
      include: Category,
    });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos por categoría' });
  }
};

// ===============================
// CREATE PRODUCT
// ===============================
const createProduct = async (req, res) => {
  try {
    const product = await Product.create({ ...req.body, active: true });
    res.status(201).json(product);
    } catch (err) {
    console.error(err);

    // Si el backend detecta que el nombre ya existe
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        error: "Ya existe un producto con ese nombre."
      });
    }

    return res.status(500).json({ error: "Error al crear producto" });
  }
  
};

// ===============================
// UPDATE PRODUCT
// ===============================
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product)
      return res.status(404).json({ error: 'Producto no encontrado' });

    await product.update(req.body);
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

// ===============================
// DESACTIVAR PRODUCTO
// ===============================
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product)
      return res.status(404).json({ error: 'Producto no encontrado' });

    await product.update({ active: false });

    res.json({ message: 'Producto desactivado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al desactivar producto' });
  }
};

// ===============================
// ACTIVAR PRODUCTO
// ===============================
const activateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product)
      return res.status(404).json({ error: 'Producto no encontrado' });

    await product.update({ active: true });

    res.json({ message: 'Producto activado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al activar producto' });
  }
};

// ===============================
// MÁS VENDIDOS
// ===============================
const getTopSellingProducts = async (req, res) => {
  try {
    const topProducts = await OrderProduct.findAll({
      attributes: [
        'productId',
        [Sequelize.fn('SUM', Sequelize.col('quantity')), 'totalVendidas']
      ],
      group: ['productId', 'Product.id'],
      order: [[Sequelize.fn('SUM', Sequelize.col('quantity')), 'DESC']],
      limit: 8,
      include: {
        model: Product,
        where: { active: true },
        attributes: [
          'id',
          'name',
          'description',
          'stock',
          'price',
          ['image', 'imageUrl']
        ],
        required: true
      }
    });

    res.json(topProducts);
  } catch (err) {
    console.error('Error al obtener productos más vendidos:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ===============================
// GET POR LISTA DE IDS (carrito)
// ===============================
const getProductsByIds = async (req, res) => {
  try {
    const ids = req.query.ids.split(',').map(id => Number(id));

    const products = await Product.findAll({
      where: { id: ids }
    });

    return res.json(products);

  } catch (error) {
    console.error("Error al obtener productos por IDs:", error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// ===============================
// EXPORTS
// ===============================
module.exports = {
  getAllProducts,
  getAllProductsAdmin,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  activateProduct,
  getProductsByCategory,
  getTopSellingProducts,
  getProductsByIds,
};

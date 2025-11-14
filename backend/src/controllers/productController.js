const { Sequelize } = require('sequelize');
const Category = require('../models/category');
const { OrderProduct, Product } = require('../models');


// GET TODOS (solo activos por defecto)

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



// GET POR CATEGORÍA (solo activos)
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


// GET POR ID (solo si está activo)

const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, { include: Category });

    if (!product || !product.active)
      return res.status(404).json({ error: 'Producto no encontrado' });

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar producto' });
  }
};


const createProduct = async (req, res) => {
  try {
    const product = await Product.create({ ...req.body, active: true });
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear producto' });
  }
};


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


// DESACTIVAR PRODUCTO (ANTES era delete)

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
        where: { active: true }, //  solo productos activos
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

const getProductsByIds = async (req, res) => {
  try {
    const ids = req.query.ids?.split(',').map(id => Number(id));

    if (!ids || ids.length === 0) {
      return res.status(400).json({ message: 'No se proporcionaron IDs' });
    }

    const products = await Product.findAll({
      where: { id: ids }
    });

    return res.json(products);

  } catch (error) {
    console.error("Error al obtener productos por IDs:", error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};


module.exports = {
  getAllProducts,
  getAllProductsAdmin,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct, // ahora DESACTIVA
  activateProduct, // nuevo
  getProductsByCategory,
  getTopSellingProducts,
  getProductsByIds ,
};

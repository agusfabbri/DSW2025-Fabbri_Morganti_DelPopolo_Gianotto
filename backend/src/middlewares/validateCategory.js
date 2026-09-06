const validateCategory = (req, res, next) => {
  const { name } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'El nombre de la categoría es requerido.' });
  }

  next();
};

module.exports = validateCategory;

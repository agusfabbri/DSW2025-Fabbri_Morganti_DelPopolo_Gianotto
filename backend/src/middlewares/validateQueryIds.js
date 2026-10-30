const validateQueryIds = (req, res, next) => {
  const { ids } = req.query;

  if (!ids || typeof ids !== 'string' || ids.trim().length === 0) {
    return res.status(400).json({ message: 'No se proporcionaron IDs.' });
  }

  const idArray = ids.split(',');
  for (const id of idArray) {
    if (isNaN(Number(id.trim())) || !Number.isInteger(Number(id.trim()))) {
      return res.status(400).json({ message: `El ID "${id.trim()}" no es un entero válido.` });
    }
  }

  next();
};

module.exports = validateQueryIds;

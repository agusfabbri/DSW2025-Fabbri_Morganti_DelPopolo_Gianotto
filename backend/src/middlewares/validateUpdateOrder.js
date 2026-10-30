const validateUpdateOrder = (req, res, next) => {
  const { status } = req.body;

  if (!['pendiente', 'enviado', 'entregado', 'cancelado'].includes(status)) {
    return res.status(400).json({ message: 'Estado inválido' });
  }

  next();
};

module.exports = validateUpdateOrder;

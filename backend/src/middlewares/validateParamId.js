const validateParam = (paramName = 'id') => {
  return (req, res, next) => {
    const value = req.params[paramName];

    if (value !== undefined && (isNaN(Number(value)) || !Number.isInteger(Number(value)))) {
      return res.status(400).json({ error: `El parámetro ${paramName} "${value}" no es un entero válido.` });
    }

    next();
  };
};

const validateParamId = validateParam('id');

module.exports = validateParamId;
module.exports.validateParam = validateParam;

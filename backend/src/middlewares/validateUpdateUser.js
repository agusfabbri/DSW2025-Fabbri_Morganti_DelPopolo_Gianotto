const validateUpdateUser = (req, res, next) => {
  const { name, email, password } = req.body;

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ message: 'El nombre no puede estar vacío.' });
    }
  }

  if (email !== undefined) {
    if (typeof email !== 'string' || email.trim().length === 0) {
      return res.status(400).json({ message: 'El email no puede estar vacío.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'El formato del email no es válido.' });
    }
  }

  if (password !== undefined) {
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
    }
  }

  next();
};

module.exports = validateUpdateUser;

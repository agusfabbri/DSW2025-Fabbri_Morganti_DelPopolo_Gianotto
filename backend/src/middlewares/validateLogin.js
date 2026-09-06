const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    return res.status(400).json({ message: 'El email es requerido.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'El formato del email no es válido.' });
  }

  if (!password || typeof password !== 'string' || password.trim().length === 0) {
    return res.status(400).json({ message: 'La contraseña es requerida.' });
  }

  next();
};

module.exports = validateLogin;

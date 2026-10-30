const isOwnerOrAdmin = (req, res, next) => {
  const paramId = Number(req.params.id);

  if (req.user.id === paramId || req.user.role === 'admin') {
    return next();
  }

  res.status(403).json({ message: 'No tenés permiso para modificar este usuario.' });
};

module.exports = isOwnerOrAdmin;

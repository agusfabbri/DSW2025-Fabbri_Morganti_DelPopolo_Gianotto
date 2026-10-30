const { Order } = require('../models');

const canAccessOrder = async (req, res, next) => {
    try {
        const order = await Order.findByPk(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        if (order.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No tienes permiso para ver este pedido' });
        }

        next();
    } catch (err) {
        console.error('Error en middleware canAccessOrder:', err);
        res.status(500).json({ message: 'Error al validar acceso al pedido' });
    }
};

module.exports = canAccessOrder;

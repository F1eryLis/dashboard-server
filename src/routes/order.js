
const express = require('express');
const prisma = require('../prisma');
const router = express.Router();

const auth = require('../middleware/auth');

// Create a new order
router.post('/', auth.authenticateJWT, auth.authorizeRoles(['Admin', 'Agency', 'Client']), async (req, res) => {
    try {
        const order = await prisma.order.create({
            data: req.body,
        });
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all orders with query parameters
router.get('/', auth.authenticateJWT, auth.authorizeRoles(['Admin', 'Agency', 'Client']), async (req, res) => {
    try {
        const { _start, end, _sort, _order } = req.query;
        const skip = _start ? parseInt(_start) : 0;
        const take = end ? parseInt(end) - skip : undefined;
        const orderBy = _sort ? { [_sort]: _order?.toLowerCase() || 'asc' } : undefined;

        let orders;
        if (req.user.roles.includes('Admin')) {
            orders = await prisma.order.findMany({
                skip,
                take,
                orderBy
            });
        } else if (req.user.roles.includes('Agency')) {
            orders = await prisma.order.findMany({
                where: {
                    userOrder: {
                        agencyId: req.user.id,
                    }
                },
                skip,
                take,
                orderBy
            });
        } else if (req.user.roles.includes('Client')) {
            orders = await prisma.order.findMany({
                where: {
                    clientId: req.user.id,
                },
                skip,
                take,
                orderBy
            });
        } else {
            return res.status(403).json({ error: 'Access denied' });
        }

        const totalCount = await prisma.order.count();

        res.header('Access-Control-Expose-Headers', 'X-Total-Count');
        res.header('X-Total-Count', totalCount);
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific order
router.get('/:id', auth.authenticateJWT, auth.authorizeRoles(['Admin', 'Agency', 'Client']), async (req, res) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: parseInt(req.params.id) },
        });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a order
router.put('/:id', auth.authenticateJWT, auth.authorizeRoles(['Admin', 'Agency', 'Client']), async (req, res) => {
    try {
        const order = await prisma.order.update({
            where: { id: parseInt(req.params.id) },
            data: req.body,
        });
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a order
router.delete('/:id', auth.authenticateJWT, auth.authorizeRoles(['Admin', 'Agency', 'Client']), async (req, res) => {
    try {
        await prisma.order.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.status(204).json();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

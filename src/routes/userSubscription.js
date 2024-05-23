
const express = require('express');
const prisma = require('../prisma');
const router = express.Router();

// Create a new userSubscription
router.post('/', async (req, res) => {
    try {
        const userSubscription = await prisma.userSubscription.create({
            data: req.body,
        });
        res.status(201).json(userSubscription);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all userSubscriptions with query parameters
router.get('/', async (req, res) => {
    try {
        const { _start, end, _sort, _order } = req.query;
        const skip = _start ? parseInt(_start) : 0;
        const take = end ? parseInt(end) - skip : undefined;
        const orderBy = _sort ? { [_sort]: _order?.toLowerCase() || 'asc' } : undefined;

        const totalCount = await prisma.userSubscription.count();
        const userSubscriptions = await prisma.userSubscription.findMany({
            skip,
            take,
            orderBy,
        });

        res.header('Access-Control-Expose-Headers', 'X-Total-Count');
        res.header('X-Total-Count', totalCount);
        res.status(200).json(userSubscriptions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific userSubscription
router.get('/:id', async (req, res) => {
    try {
        const userSubscription = await prisma.userSubscription.findUnique({
            where: { id: parseInt(req.params.id) },
        });
        if (!userSubscription) return res.status(404).json({ error: 'UserSubscription not found' });
        res.status(200).json(userSubscription);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a userSubscription
router.put('/:id', async (req, res) => {
    try {
        const userSubscription = await prisma.userSubscription.update({
            where: { id: parseInt(req.params.id) },
            data: req.body,
        });
        res.status(200).json(userSubscription);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a userSubscription
router.delete('/:id', async (req, res) => {
    try {
        await prisma.userSubscription.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.status(204).json();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;


const express = require('express');
const prisma = require('../prisma');
const router = express.Router();

// Create a new subscriptionModule
router.post('/', async (req, res) => {
    try {
        const subscriptionModule = await prisma.subscriptionModule.create({
            data: req.body,
        });
        res.status(201).json(subscriptionModule);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all subscriptionModules with query parameters
router.get('/', async (req, res) => {
    try {
        const { _start, end, _sort, _order } = req.query;
        const skip = _start ? parseInt(_start) : 0;
        const take = end ? parseInt(end) - skip : undefined;
        const orderBy = _sort ? { [_sort]: _order?.toLowerCase() || 'asc' } : undefined;

        const totalCount = await prisma.subscriptionModule.count();
        const subscriptionModules = await prisma.subscriptionModule.findMany({
            skip,
            take,
            orderBy,
        });

        res.header('Access-Control-Expose-Headers', 'X-Total-Count');
        res.header('X-Total-Count', totalCount);
        res.status(200).json(subscriptionModules);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific subscriptionModule
router.get('/:id', async (req, res) => {
    try {
        const subscriptionModule = await prisma.subscriptionModule.findUnique({
            where: { id: parseInt(req.params.id) },
        });
        if (!subscriptionModule) return res.status(404).json({ error: 'SubscriptionModule not found' });
        res.status(200).json(subscriptionModule);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a subscriptionModule
router.put('/:id', async (req, res) => {
    try {
        const subscriptionModule = await prisma.subscriptionModule.update({
            where: { id: parseInt(req.params.id) },
            data: req.body,
        });
        res.status(200).json(subscriptionModule);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a subscriptionModule
router.delete('/:id', async (req, res) => {
    try {
        await prisma.subscriptionModule.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.status(204).json();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;


const express = require('express');
const prisma = require('../prisma');
const router = express.Router();

// Create a new client
router.post('/', async (req, res) => {
    try {
        const client = await prisma.client.create({
            data: req.body,
        });
        res.status(201).json(client);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all clients with query parameters
router.get('/', async (req, res) => {
    try {
        const { _start, end, _sort, _order } = req.query;
        const skip = _start ? parseInt(_start) : 0;
        const take = end ? parseInt(end) - skip : undefined;
        const orderBy = _sort ? { [_sort]: _order?.toLowerCase() || 'asc' } : undefined;

        const totalCount = await prisma.client.count();
        const clients = await prisma.client.findMany({
            skip,
            take,
            orderBy,
        });

        res.header('Access-Control-Expose-Headers', 'X-Total-Count');
        res.header('X-Total-Count', totalCount);
        res.status(200).json(clients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific client
router.get('/:id', async (req, res) => {
    try {
        const client = await prisma.client.findUnique({
            where: { id: parseInt(req.params.id) },
        });
        if (!client) return res.status(404).json({ error: 'Client not found' });
        res.status(200).json(client);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a client
router.put('/:id', async (req, res) => {
    try {
        const client = await prisma.client.update({
            where: { id: parseInt(req.params.id) },
            data: req.body,
        });
        res.status(200).json(client);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a client
router.delete('/:id', async (req, res) => {
    try {
        await prisma.client.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.status(204).json();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

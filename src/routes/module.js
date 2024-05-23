
const express = require('express');
const prisma = require('../prisma');
const router = express.Router();

// Create a new module
router.post('/', async (req, res) => {
    try {
        const module = await prisma.module.create({
            data: req.body,
        });
        res.status(201).json(module);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all modules with query parameters
router.get('/', async (req, res) => {
    try {
        const { _start, end, _sort, _order } = req.query;
        const skip = _start ? parseInt(_start) : 0;
        const take = end ? parseInt(end) - skip : undefined;
        const orderBy = _sort ? { [_sort]: _order?.toLowerCase() || 'asc' } : undefined;

        const totalCount = await prisma.module.count();
        const modules = await prisma.module.findMany({
            skip,
            take,
            orderBy,
        });

        res.header('Access-Control-Expose-Headers', 'X-Total-Count');
        res.header('X-Total-Count', totalCount);
        res.status(200).json(modules);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific module
router.get('/:id', async (req, res) => {
    try {
        const module = await prisma.module.findUnique({
            where: { id: parseInt(req.params.id) },
        });
        if (!module) return res.status(404).json({ error: 'Module not found' });
        res.status(200).json(module);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a module
router.put('/:id', async (req, res) => {
    try {
        const module = await prisma.module.update({
            where: { id: parseInt(req.params.id) },
            data: req.body,
        });
        res.status(200).json(module);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a module
router.delete('/:id', async (req, res) => {
    try {
        await prisma.module.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.status(204).json();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;


const express = require('express');
const prisma = require('../prisma');
const router = express.Router();

// Create a new role
router.post('/', async (req, res) => {
    try {
        const role = await prisma.role.create({
            data: req.body,
        });
        res.status(201).json(role);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all roles with query parameters
router.get('/', async (req, res) => {
    try {
        const { _start, end, _sort, _order } = req.query;
        const skip = _start ? parseInt(_start) : 0;
        const take = end ? parseInt(end) - skip : undefined;
        const orderBy = _sort ? { [_sort]: _order?.toLowerCase() || 'asc' } : undefined;

        const totalCount = await prisma.role.count();
        const roles = await prisma.role.findMany({
            skip,
            take,
            orderBy,
        });

        res.header('Access-Control-Expose-Headers', 'X-Total-Count');
        res.header('X-Total-Count', totalCount);
        res.status(200).json(roles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific role
router.get('/:id', async (req, res) => {
    try {
        const role = await prisma.role.findUnique({
            where: { id: parseInt(req.params.id) },
        });
        if (!role) return res.status(404).json({ error: 'Role not found' });
        
        res.header('Access-Control-Expose-Headers', 'X-Total-Count');
        res.header('X-Total-Count', 1);
        res.status(200).json(role);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a role
router.put('/:id', async (req, res) => {
    try {
        const role = await prisma.role.update({
            where: { id: parseInt(req.params.id) },
            data: req.body,
        });
        res.status(200).json(role);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a role
router.delete('/:id', async (req, res) => {
    try {
        await prisma.role.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.status(204).json();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

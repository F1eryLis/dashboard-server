
const express = require('express');
const prisma = require('../prisma');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');
const router = express.Router();
const bcrypt = require('bcrypt');

// Create a new user
router.post('/', async (req, res) => {
    try {
        const dataToCreate = {};

        if(req.body.username) {
            dataToCreate.username = req.body.username;
        }

        if(req.body.email) {
            dataToCreate.email = req.body.email;
        }

        if(req.body.password) {
            dataToCreate.password = bcrypt.hashSync(req.body.password, 8);
        }

        if(req.body.phone) {
            dataToCreate.phone = req.body.phone;
        }

        if(req.body.role) {
            dataToCreate.role = {
                create: req.body.role.map(roleId => ({
                    role: {
                        connect: {
                            id: parseInt(roleId)
                        }
                    }
                }))
            };
        }

        const user = await prisma.user.create({
            data: dataToCreate,
            include: {
                role: true
            }
        });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all users with query parameters
router.get('/', authenticateJWT, authorizeRoles(['Admin', 'Agency']), async (req, res) => {
    try {
        const { _start, end, _sort, _order } = req.query;
        const skip = _start ? parseInt(_start) : 0;
        const take = end ? parseInt(end) - skip : undefined;
        const orderBy = _sort ? { [_sort]: _order?.toLowerCase() || 'asc' } : undefined;

        let users;
        if(req.user.roles.includes('Admin')) {
            users = await prisma.user.findMany({
                skip,
                take,
                orderBy
            });
        } else if(req.user.roles.includes('Agency')) {
            users = await prisma.user.findMany({
                where: { agency: req.user.agency },
                skip,
                take,
                orderBy
            });
        } else {
            return res.status(403).json({ error: 'Access denied' });
        }

        const totalCount = await prisma.user.count();
        // const users = await prisma.user.findMany({
        //     skip,
        //     take,
        //     orderBy,
        // });

        res.header('Access-Control-Expose-Headers', 'X-Total-Count');
        res.header('X-Total-Count', totalCount);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific user
router.get('/:id', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                role: true
            }
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a user
router.put('/:id', async (req, res) => {
    try {
        const user = await prisma.user.update({
            where: { id: parseInt(req.params.id) },
            data: req.body,
        });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a user
router.delete('/:id', async (req, res) => {
    try {
        await prisma.user.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.status(204).json();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

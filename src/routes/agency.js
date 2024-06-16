
const express = require('express');
const prisma = require('../prisma');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

// Create a new agency
router.post('/', authenticateJWT, authorizeRoles(['Admin']), async (req, res) => {
    try {
        const agency = await prisma.agency.create({
            data: {
                agencyName: req.body.agencyName,
                domain: req.body.domain,
                owner: {
                    connectOrCreate: {
                        where: {
                            userId: req.body.userId
                        },
                        create: {
                            userId: req.body.userId,
                        }
                    }
                }
            },
            include: {
                owner: true
            }
        });
        res.status(201).json(agency);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all agencys with query parameters
router.get('/', authenticateJWT, authorizeRoles(['Admin', 'Agency']), async (req, res) => {
    try {
        const { _start, end, _sort, _order } = req.query;
        const skip = _start ? parseInt(_start) : 0;
        const take = end ? parseInt(end) - skip : undefined;
        const orderBy = _sort ? { [_sort]: _order?.toLowerCase() || 'asc' } : undefined;

        let agencys;
        if(req.user.roles.includes('Admin')) {
          agencys = await prisma.agency.findMany({
            skip,
            take,
            orderBy,
            include: {
              owner: true
            }
          });
        } else if(req.user.roles.includes('Agency')) {
          agencys = await prisma.agency.findMany({
            where: {
              owner: {
                userId: req.user.id
              }
            },
            skip,
            take,
            orderBy
          });
        } else {
          return res.status(403).json({ error: 'Access denied' });
        }
        const totalCount = await prisma.agency.count();

        res.header('Access-Control-Expose-Headers', 'X-Total-Count');
        res.header('X-Total-Count', totalCount);
        res.status(200).json(agencys);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific agency
router.get('/:id', authenticateJWT, authorizeRoles(['Admin']), async (req, res) => {
    try {
        const agency = await prisma.agency.findUnique({
            where: { id: parseInt(req.params.id) },
        });
        if (!agency) return res.status(404).json({ error: 'Agency not found' });
        res.status(200).json(agency);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a agency
router.put('/:id', authenticateJWT, authorizeRoles(['Admin', 'Agency']), async (req, res) => {
    try {
        const dataToUpdate = {};

        if (req.body.agencyName) {
          dataToUpdate.agencyName = req.body.agencyName;
        }
        if (req.body.domain) {
          dataToUpdate.domain = req.body.domain;
        }
        if (req.body.subscription) {
          dataToUpdate.subscription = {
            update: req.body.subscription.map(sub => ({
              where: { agencyId: parseInt(req.params.id) },
              data: sub,
            })),
          };
        }
        if (req.body.owner) {
          dataToUpdate.owner = {
            update: req.body.owner,
          };
        }
        if (req.body.employee) {
          dataToUpdate.employee = {
            update: req.body.employee.map(emp => ({
              where: { agencyId: parseInt(req.params.id) },
              data: emp,
            })),
          };
        }
        if (req.body.client) {
          dataToUpdate.client = {
            update: req.body.client.map(cli => ({
              where: { agencyId: parseInt(req.params.id) },
              data: cli,
            })),
          };
        }
        if (req.body.order) {
          dataToUpdate.order = {
            update: req.body.order.map(ord => ({
              where: { agencyId: parseInt(req.params.id) },
              data: ord,
            })),
          };
        }    
        
        const agency = await prisma.agency.update({
            where: { id: parseInt(req.params.id) },
            data: dataToUpdate
        });
        res.status(200).json(agency);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a agency
router.delete('/:id', authenticateJWT, authorizeRoles(['Admin']), async (req, res) => {
    try {
        await prisma.agency.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.status(204).json();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

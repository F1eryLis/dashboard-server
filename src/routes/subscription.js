
const express = require('express');
const prisma = require('../prisma');
const router = express.Router();

const auth = require('../middleware/auth');

// Create a new subscription
router.post('/', auth.authenticateJWT, auth.authorizeRoles(['Admin']), async (req, res) => {
    try {
        const { dateTo, dateFrom, domain, userId, modules } = req.body;

        let subscription;
        if(req.user.roles.includes('Admin')) {
            subscription = await prisma.subscription.create({
                data: {
                    dateTo: new Date(dateTo).toISOString(),
                    dateFrom: new Date(dateFrom).toISOString(),
                    domain,
                    agency: { connect: { id: userId } },
                    modules: { connect: modules.map(moduleId => ({ id: moduleId })) },
                },
            });
        } else {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.status(201).json(subscription);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all subscriptions with query parameters
router.get('/', auth.authenticateJWT, auth.authorizeRoles(['Admin', 'Agency']), async (req, res) => {
    try {
        const { _start, end, _sort, _order } = req.query;
        const skip = _start ? parseInt(_start) : 0;
        const take = end ? parseInt(end) - skip : undefined;
        const orderBy = _sort ? { [_sort]: _order?.toLowerCase() || 'asc' } : undefined;

        let subscriptions;
        if(req.user.roles.includes('Admin')) {
            subscriptions = await prisma.subscription.findMany({
                skip,
                take,
                orderBy,
                include: {
                    modules: true,
                }
            });
        } else if (req.user.roles.includes('Agency')) {
            subscriptions = await prisma.subscription.findMany({
                where: {
                    agencyId: req.user.id
                },
                skip,
                take,
                orderBy,
                include: {
                    modules: true,
                },
            });
        } else {
            return res.status(403).json({ error: 'Access denied' });
        }

        const totalCount = await prisma.subscription.count();
        // const subscriptions = await prisma.subscription.findMany({
        //     skip,
        //     take,
        //     orderBy,
        //     include: {
        //         modules: true,
        //     }
        // });

        res.header('Access-Control-Expose-Headers', 'X-Total-Count');
        res.header('X-Total-Count', totalCount);
        res.status(200).json(subscriptions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/getByDomain', async (req, res) => {
    try {
        // const url = req.headers['referer'];
        const subscription = await prisma.subscription.findUnique({
            where: {
                domain: req.headers['referer'],
            }
        });
        if(!subscription) res.status(404).send('Not found');
        if(subscription.dateTo >= Date.now()) res.status(200).send(true);
        else res.status(404).send(false);
        // res.status(200).json(subscription);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
});
// Get a specific subscription
router.get('/:id', async (req, res) => {
    try {
        const subscription = await prisma.subscription.findUnique({
            where: { id: parseInt(req.params.id) },
        });
        if (!subscription) return res.status(404).json({ error: 'Subscription not found' });
        res.status(200).json(subscription);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { dateTo, dateFrom, domain, userId, modules } = req.body;
        const { id } = req.params;

        const subscription = await prisma.subscription.update({
            where: {
                id: parseInt(id)
            },
            data: {
                dateTo: new Date(dateTo).toISOString(),
                dateFrom: new Date(dateFrom).toISOString(),
                domain: domain,
                agency: {
                    connect: {
                        id: userId
                    }
                },
                modules: {
                    connect: modules.map(moduleId => ({ id: moduleId }))
                }
            }
        });

        res.json(subscription);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Delete a subscription
router.delete('/:id', async (req, res) => {
    try {
        await prisma.subscription.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.status(204).json();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

const fs = require('fs');
const path = require('path');

// Function to generate CRUD routes
function generateCrud(modelName) {
    const modelNameCapitalized = modelName.charAt(0).toUpperCase() + modelName.slice(1);
    const routeTemplate = `
const express = require('express');
const prisma = require('../prisma');
const router = express.Router();

// Create a new ${modelName}
router.post('/', async (req, res) => {
    try {
        const ${modelName} = await prisma.${modelName}.create({
            data: req.body,
        });
        res.status(201).json(${modelName});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all ${modelName}s with query parameters
router.get('/', async (req, res) => {
    try {
        const { _start, end, _sort, _order } = req.query;
        const skip = _start ? parseInt(_start) : 0;
        const take = end ? parseInt(end) - skip : undefined;
        const orderBy = _sort ? { [_sort]: _order?.toLowerCase() || 'asc' } : undefined;

        const totalCount = await prisma.${modelName}.count();
        const ${modelName}s = await prisma.${modelName}.findMany({
            skip,
            take,
            orderBy,
        });

        res.header('Access-Control-Expose-Headers', 'X-Total-Count');
        res.header('X-Total-Count', totalCount);
        res.status(200).json(${modelName}s);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific ${modelName}
router.get('/:id', async (req, res) => {
    try {
        const ${modelName} = await prisma.${modelName}.findUnique({
            where: { id: parseInt(req.params.id) },
        });
        if (!${modelName}) return res.status(404).json({ error: '${modelNameCapitalized} not found' });
        res.status(200).json(${modelName});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a ${modelName}
router.put('/:id', async (req, res) => {
    try {
        const ${modelName} = await prisma.${modelName}.update({
            where: { id: parseInt(req.params.id) },
            data: req.body,
        });
        res.status(200).json(${modelName});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a ${modelName}
router.delete('/:id', async (req, res) => {
    try {
        await prisma.${modelName}.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.status(204).json();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
`;

    const filePath = path.join(__dirname, 'routes', `${modelName}.js`);
    fs.writeFileSync(filePath, routeTemplate, 'utf8');
    console.log(`Generated CRUD routes for ${modelName}`);
}

// List of models to generate CRUD routes for
const models = [
    'user',
    'subscription',
    'module',
];

// Generate CRUD routes for each model
models.forEach(model => generateCrud(model));

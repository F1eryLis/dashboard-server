const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const router = express.Router();

router.post('/', async (req, res) => {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({
        where: { email: username },
        include: { 
            role: {
                include: { role: true }
            },
            agency: {
                include: { Agency: true }
            }
        }
    });

    if(!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: 'Invalid' });
    }

    const roles = user.role.map(userRole => userRole.role.name);

    const token = jwt.sign({ id: user.id, email: user.email, agency: user.agency, roles }, 'secret', { expiresIn: '1h' });
    res.json({ token });
})

module.exports = router;

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const router = express.Router();

router.post('/', async (req, res) => {
    const { email, password, username, phone } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);
    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            username,
            phone
        }
    });

    res.status(201).json({ message: 'User created: ', user });
})

module.exports = router;

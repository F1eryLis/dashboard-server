const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const prisma = require('../prisma');

const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if(!token) {
        return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret', (err, user) => {
        if(err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    })
}

const authorizeRoles = (roles) => (req, res, next) => {
    const userRoles = req.user.roles;
    const hasRole = roles.some(role => userRoles.includes(role));

    if(!hasRole) {
        return res.status(403).json({ message: 'Access denied from authorize' });
    }

    next();
}

export { authenticateJWT, authorizeRoles };
const express = require('express');
const bodyParser = require('body-parser');
const prisma = require('./prisma');

const userRoutes = require('./routes/user');
const subscriptionRoutes = require('./routes/subscription');
const moduleRoutes = require('./routes/module');
const loginRoutes = require('./routes/login');
const registerRoutes = require('./routes/register');
const orderRoutes = require('./routes/order');
const agencyRoutes = require('./routes/agency');
const clientRoutes = require('./routes/client');
const roleRoutes = require('./routes/role');

const cors = require('cors');
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Use the generated user routes
app.use('/users', userRoutes);
app.use('/subscriptions', subscriptionRoutes);
app.use('/modules', moduleRoutes);
app.use('/login', loginRoutes);
app.use('/register', registerRoutes);
app.use('/order', orderRoutes);
app.use('/agency', agencyRoutes);
app.use('/client', clientRoutes);
app.use('/role', roleRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

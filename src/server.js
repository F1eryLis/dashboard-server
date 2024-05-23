const express = require('express');
const bodyParser = require('body-parser');
const prisma = require('./prisma');
const userRoutes = require('./routes/user');
const subscriptionRoutes = require('./routes/subscription');

const moduleRoutes = require('./routes/module');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Use the generated user routes
app.use('/users', userRoutes);
app.use('/subscriptions', subscriptionRoutes);
app.use('/modules', moduleRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

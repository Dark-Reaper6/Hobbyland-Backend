require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { ConnectDB } = require('./helpers/database');
const { allowedOrigins } = require("./hobbyland.config");

const server = express();

// Using middlewares
server.use(cors({ credentials: true, origin: allowedOrigins }));
server.use(cookieParser());
server.use(express.json())
server.use(morgan('dev'));

// api handlers
server.use('/api/auth', require('./api/routes/auth'));
server.use('/api/socket', require('./api/routes/socket'));
server.use('/api/2fa', require('./api/routes/2fa'));
server.use('/api/user', require('./api/routes/user'));
server.use('/api/agency', require('./api/routes/agency'));
server.use('/api/admin', require('./api/routes/admin'));
server.post('/api/test', (req, res) => { })

// initializing server
server.listen(process.env.PORT, async () => {
    await ConnectDB();
    console.log(`✅ Server connection established at http://localhost:${process.env.PORT}`);
});

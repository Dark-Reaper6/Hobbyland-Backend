require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { ConnectDB } = require('./helpers/database');

const server = express();

// Using middlewares
server.use(cors());
server.use(cookieParser());
server.use(express.json())
server.use(morgan('dev'));

// api handlers
server.post('/api/test', (req, res) => { })
server.use('/api/auth', require('./api/routes/auth'));
server.use('/api/2fa', require('./api/routes/2fa'));
server.use('/api/user', require('./api/routes/user'));

// initializing server
server.listen(process.env.PORT, async () => {
    await ConnectDB();
    console.log(`✅ Server connection established at http://localhost:${process.env.PORT}`);
});

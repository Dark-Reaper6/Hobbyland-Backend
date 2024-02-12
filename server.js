require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { ConnectDB } = require('./helpers/database');

const server = express();

server.use(cors());
server.use(cookieParser())
server.use(express.static('public'));
server.use(morgan('dev'));

// api handlers
server.use('/api/auth', require('./api/routes/auth'));
server.use('/api/users', require('./api/routes/user'));

// initializing server
server.listen(process.env.PORT, async () => {
    await ConnectDB();
    console.log(`✅ Server connection established at http://localhost:${process.env.PORT}`);
});

// app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const entregadorRoutes = require('./routes/entregador.routes');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/entregadores', entregadorRoutes);

module.exports = app;

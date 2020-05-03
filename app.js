const express = require('express');
const mongoose = require('mongoose');
const debug = require('debug')('app');
// const morgan = require('morgan'); //logger
const chalk = require('chalk');
const bodyParser = require('body-parser');

const app = express();
require('./config/config.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.sendStatus(200).json({ message: 'go to path /v1/signup to start' });

});

app.listen(global.gConfig.node_port, function () {
  console.log(`${global.gConfig.app_name} Listening on port ${global.gConfig.node_port}...`)
})
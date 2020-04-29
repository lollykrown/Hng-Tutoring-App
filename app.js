const express = require('express');
const mongoose = require('mongoose');
const debug = require('debug')('app');
const morgan = require('morgan'); //logger
const chalk = require('chalk');
const bodyParser = require('body-parser');
const cors = require('cors')

const app = express();
require('./config/config.js');

mongoose.connect(global.gConfig.database_url, { useNewUrlParser: true, useUnifiedTopology: true })

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('tiny'));
app.use(cors());


const authRouter = require('./src/routes/authRoutes')();
app.use('/', authRouter);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Connected to MongoDB');

    // (async function mongo() {
    //   try {
    //       // Sites.insertMany(tourists, function(err, docs) {
    //       //   if (err) {debug(chalk.red(err))}
    //       //   debug(chalk.red(docs.length));
    //       // });
    //   } catch (err) {
    //     debug(err.stack);
    //   }
    // })();
});

app.get('/', (req, res) => {
  res.send('home');
//   (async function mongo() {
//     try {
//       const tourSites = await Sites.find({}).exec();
//       res.render(
//         'index', { title: tourSites });
//       debug(chalk.yellow(tourSites.length));
//     } catch (err) {
//       debug(err.stack);
//     }
//   })();
});
app.listen(global.gConfig.node_port, function () {
  console.log(`${global.gConfig.app_name} Listening on port ${global.gConfig.node_port}...`)
})
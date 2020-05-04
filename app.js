const mongoose = require('mongoose');
const express = require('express');
const debug = require('debug')('app');
const morgan = require('morgan'); //logger
const bodyParser = require('body-parser');

// const cors = require('cors')

//process.env.NODE_ENV = 'production';

const app = express();
require('./config/config.js');

mongoose.connect(global.gConfig.database_url, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('tiny'));
//app.use(cors());


const authRouter = require('./src/routes/authRoutes')();
const categoryRouter = require('./src/routes/categoryRoutes')();
const subjectRouter = require('./src/routes/subjectRoutes')();
const tutorRouter = require('./src/routes/tutorRoutes')();
const lessonRouter = require('./src/routes/lessonRoutes')();

app.use('/v1', authRouter);
app.use('/v1/categories', categoryRouter);
app.use('/v1/subjects', subjectRouter);
app.use('/v1/tutors', tutorRouter);
app.use('/v1/lessons', lessonRouter);

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Connected to MongoDB');
});

app.get('/', (req, res) => {
  res.send(`
    <h2>Welcome to the Tutoring api, please visit path '/signup' to register and start</h2>
  `);
});

app.listen(process.env.PORT || global.gConfig.node_port, function () {
  console.log(`${global.gConfig.app_name} Listening on port ${global.gConfig.node_port}...`)
})
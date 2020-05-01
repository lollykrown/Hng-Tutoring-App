const express = require('express');
const Tutor = require('../models/tutor');
const Subject = require('../models/subject');
const Category = require('../models/category');
const tutorRouter = express.Router();
const debug = require('debug')('app:tutorRoutes');
const chalk = require('chalk');

function router() {
  tutorRouter.route('/')
    .post((req, res) => {
      (async function pos() {
        try {
          const { name, level, classes, subject } = req.body;
          debug(name, subject);
          const tutor = new Tutor({ name, level, classes, subject });
          const tu = await tutor.save();
          const newtutor = await Category.findOneAndUpdate({category: 'tutor'}, {$push: {tutors: tu._id}}, {useFindAndModify: false, new: true});

          debug(chalk.red(tu, newtutor));

          let subj = [];
          let addedSubject;
          for (let s of subject){
            debug(s);
            subj.push(
              { subject: s, 
                tutors: [tu._id],
                category: level }
                );
          let addedSubject = await Subject.findOneAndUpdate({subject: s}, {$push: {tutors: tu._id}}, {useFindAndModify: false, new: true}).exec()
          debug(chalk.grey(addedSubject));
          }

          if (!addedSubject){
            const sub = await Subject.insertMany(subj);
            debug(chalk.blue(sub));
          }
          res.status(200).json({
            status: true,
            message: 'Tutor saved',
          })
        } catch (err) {
          console.log(err.stack);
        }
      }());
    })
    .get((req, res) => {
      (async function getAll() {
        try {
          // const up = await Tutor.updateMany({ subject: 'Chemistry'}, { subject: 'chemistry'} );
          // debug(up);
          Tutor.find({}).exec()
            .then(docs => res.json(docs))
            .catch(err => console.log(`Oops! ${err}`));
        } catch (err) {
          console.log(err.stack);
        }
      }());
    });
    tutorRouter.route('/first')
    .get((req, res) => {
      (async function searchTutorByFirstName() {
        try {
          const str = req.query.q;
          const q = str[0].toUpperCase() +  str.slice(1); ;
          debug(q);
          Tutor.find({ name: {$regex: '^' + q, $options: 'i'}}).exec()
            .then(docs => res.json(docs))
            .catch(err => console.log(`Oops! ${err}`));
        } catch (err) {
          console.log(err.stack);
        }
      }());
    });
  return tutorRouter;
}

module.exports = router;
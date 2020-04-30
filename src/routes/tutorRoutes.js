const express = require('express');
const Tutor = require('../models/tutor');
const Subject = require('../models/subject');
const tutorRouter = express.Router();
const debug = require('debug')('app:tutorRoutes');
const mongoose = require('mongoose');
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
          debug(chalk.red(tu));

          const subj = new Subject(
            { subject: subject, 
              tutors: [tu._id],
              level: level });
          const su = await Subject.find({subject});
          debug(chalk.yellow(su));
          const addedSubject = await Subject.findOneAndUpdate({subject}, {$push: {tutors: tu._id}}, {useFindAndModify: false, new: true}).exec()
          debug(chalk.green(addedSubject));
          if (!addedSubject){
            const sub = await subj.save();
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
          Tutor.find({}).exec()
            .then(docs => res.json(docs))
            .catch(err => console.log(`Oops! ${err}`));
        } catch (err) {
          console.log(err.stack);
        }
      }());
    });
    tutorRouter.route('/:tut')
    .get((req, res) => {
      (async function get() {
        try {
          Tutor.find({ name: req.params.tutor}).populate("subjects").exec()
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
const express = require('express');
const Subject = require('../models/subject');
const subjectRouter = express.Router();
const debug = require('debug')('app:subjectRoutes');
const chalk = require('chalk');

function router() {
  subjectRouter.route('/')
    .post((req, res) => {
      (async function post() {
        try {
          const { subject, tutors, level } = req.body;
          debug(subject, tutors, level);
          const sub = new Subject({ subject, tutors, level });
          sub.save();

          res.status(200).json({
            status: true,
            message: 'Subject saved',
          })
        } catch (err) {
          console.log(err.stack);
        }
      }());
    })
    .get((req, res) => {
      (async function get() {
        try {
          Subject.find({}).exec()
            .then(docs => res.json(docs))
            .catch(err => console.log(`Oops! ${err.stack}`));
        } catch (err) {
          console.log(err.stack);
        }
      }());
    });
    subjectRouter.route('/:subj')
    .get((req, res) => {
      (async function get() {
        try {
          Subject.findOne({ subject: req.params.subj }).populate('tutors').exec()
          .then(docs => res.status(200).json(docs))
          .catch(err => console.log(`Oops! ${err.stack}`));
        } catch (err) {
          console.log(err.stack);
        }
      }());
    });
  return subjectRouter;
}

module.exports = router;
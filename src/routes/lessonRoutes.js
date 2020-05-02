const express = require('express');
const Category = require('../models/category');
const Lesson = require('../models/lesson');
const Tutor = require('../models/tutor');
const lessonRouter = express.Router();
const debug = require('debug')('app:lessonRoutes');
const chalk = require('chalk');
const admin = require('../utils/admin');

function router() {
  lessonRouter.route('/')
    //book lesson (only admin)
    .post(admin, (req, res) => {
      (async function pos() {
        try {
          let { subject, time, tutor, level } = req.body;

          debug(subject, tutor);
          const lesson = new Lesson({ subject, time, tutor: tutor, level });
          const lu = await lesson.save();
          const newLesson = await Category.findOneAndUpdate({ category: 'tutor' }, { $push: { lessons: lu._id } }, { useFindAndModify: false, new: true });
          const newLesson2 = await Tutor.findOneAndUpdate({ name: tutor }, { $push: { lessons: lu._id } }, { useFindAndModify: false, new: true });
          if (!newLesson2) {
            const newTutor = new Tutor({ name: tutor, level, subject, lessons: lu._id })
            const newe = await newTutor.save();
            debug(newe);
          }
          debug(chalk.red(newLesson));
          debug(chalk.blue(newLesson2));

          res.status(200).json({
            status: true,
            message: 'Lesson saved',
          })
        } catch (err) {
          console.log(err.stack);
        }
      }());
    })
    // retrieve all lessons (only admin)
    .get(admin, (req, res) => {
      (async function getAll() {
        try {
          Lesson.find({}).exec()
            .then(docs => res.json(docs))
            .catch(err => console.log(`Oops! ${err}`));
        } catch (err) {
          console.log(err.stack);
        }
      }());
    });
  // get a lesson by id (only admin)
  lessonRouter.route('/:id')
    .get(admin, (req, res) => {
      (async function getLessonById() {
        try {
          Lesson.find({ _id: req.params.id }).exec()
            .then(docs => res.json(docs))
            .catch(err => console.log(`Oops! ${err}`));
        } catch (err) {
          console.log(err.stack);
        }
      }());
    })
    // update a lesson by id (only admin)
    .patch(admin, (req, res) => {
      (async function updateLessonById() {
        let { subject, time, tutor, level } = req.body;
        try {
          Lesson.findByIdAndUpdate({ _id: req.params.id }, { $set: { subject, time, tutor, level } }, { useFindAndModify: false, new: true }).exec()
            .then(docs => res.status(200).json(docs))
            .catch(err => console.log(`Oops! ${err.stack}`));
        } catch (err) {
          console.log(err.stack);
        }
      }());
    })
    // delete a lesson by id (only admin)
    .delete(admin, (req, res) => {
      (async function deleteLessonById() {
        try {
          Lesson.findByIdAndDelete({ _id: req.params.id }).exec()
            .then(docs => res.status(200).json({
              status: true,
              message: `${docs.subject} lesson by ${docs.tutor} deleted`,
            }))
            .catch(err => console.log(`Oops! ${err.stack}`));
        } catch (err) {
          console.log(err.stack);
        }
      }());
    });
  return lessonRouter;
}

module.exports = router;
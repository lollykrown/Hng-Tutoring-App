const express = require('express');
const Category = require('../models/category');
const Lesson = require('../models/lesson');
const Tutor = require('../models/tutor');
const lessonRouter = express.Router();
const debug = require('debug')('app:lessonRoutes');
const chalk = require('chalk');

function router() {
  lessonRouter.route('/')
    .post((req, res) => {
      (async function pos() {
        try {
          const { subject, time, tutor, level } = req.body;
          function toCaps(num){
            let arr = [];
            for(let n of num.split(' ')) {
                n[0].toUpperCase() +  n.slice(1); 
                arr
            }
            return arr.join('');
          }
          const tutorName = toCaps(tutor);
          debug(subject, tutorName);
          const lesson = new Lesson({ subject, time, tutorName, level });
          const lu = await lesson.save();
          const newLesson = await Category.findOneAndUpdate({category: 'tutor'}, {$push: {lessons: lu._id}}, {useFindAndModify: false, new: true});
          const newLesson2 = await Tutor.findOneAndUpdate({name: tutorName}, {$push: {lessons: lu._id}}, {useFindAndModify: false, new: true});

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
    .get((req, res) => {
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
    lessonRouter.route('/:id')
    .get((req, res) => {
      // (async function get() {
      //   try {
      //     Tutor.find({ name: req.params.tutor}).populate("subjects").exec()
      //       .then(docs => res.json(docs))
      //       .catch(err => console.log(`Oops! ${err}`));
      //   } catch (err) {
      //     console.log(err.stack);
      //   }
      // }());
    });
  return lessonRouter;
}

module.exports = router;
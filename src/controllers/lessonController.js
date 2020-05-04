const debug = require('debug')('app:lessonController');
const Category = require('../models/category');
const Lesson = require('../models/lesson');
const Tutor = require('../models/tutor');
const User = require('../models/users');
const chalk = require('chalk');

function lessonController() {
  function bookLesson(req, res) {
      (async function book() {
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
            const newSub = await User.findOneAndUpdate({ name: tutor }, { $push: { subjects: subject, lessons: newe._id } }, { useFindAndModify: false, new: true });
            debug(newSub);
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
  };

  function getAll(req, res) {
    (async function get() {
      try {
        Lesson.find({}).exec()
          .then(docs => res.json(docs))
          .catch(err => console.log(`Oops! ${err}`));
      } catch (err) {
        console.log(err.stack);
      }
    }());
  }

  function bookLessonStudent(req, res) {
    if (req.user.category === 'student') {
      (async function book() {
        try {
          let { subject } = req.body;

          debug(subject);
          const lesson = await Lesson.findOne({ subject }).exec();
          if (!lesson) {
            return res.status(423)
              .send({ status: false, message: `no lesson on ${subject} yet` });
          }
          const newLesson = await User.findOneAndUpdate({ _id: req.user.id }, { $push: { lessons: lesson._id } }, { useFindAndModify: false, new: true });

          res.status(200).json({
            status: true,
            message: 'You have successfully booked a Lesson'
          })
        } catch (err) {
          console.log(err.stack);
        }
      }());
    } else {
      res.status(401).send('Access denied. You are not a Student.');
    }
  }

  function getLessonById(req, res) {
    (async function get() {
      try {
        Lesson.find({ _id: req.params.id }).exec()
          .then(docs => res.json(docs))
          .catch(err => console.log(`Oops! ${err}`));
      } catch (err) {
        console.log(err.stack);
      }
    }());
  }

  function updateLessonById(req, res) {
    (async function update() {
      let { subject, time, tutor, level } = req.body;
      try {
        Lesson.findByIdAndUpdate({ _id: req.params.id }, { $set: { subject, time, tutor, level } }, { useFindAndModify: false, new: true }).exec()
          .then(docs => res.status(200).json(docs))
          .catch(err => console.log(`Oops! ${err.stack}`));
      } catch (err) {
        console.log(err.stack);
      }
    }());
  }

  function deleteLessonById(req, res) {
    (async function del() {
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
  }

  return {
    bookLesson,
    getAll,
    bookLessonStudent,
    getLessonById,
    updateLessonById,
    deleteLessonById
  };
}

module.exports = lessonController;
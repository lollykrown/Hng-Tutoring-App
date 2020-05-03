const express = require('express');
const Subject = require('../models/subject');
const Category = require('../models/category');
const User = require('../models/users');
const subjectRouter = express.Router();
const debug = require('debug')('app:subjectRoutes');
const chalk = require('chalk');
const auth = require('../utils/auth');
const admin = require('../utils/admin')

function router() {
  subjectRouter.route('/')
    // retrieve all subjects
    .get(auth, (req, res) => {
      (async function getAll() {
        try {
          Subject.find({}).exec()
            .then(docs => res.json(docs))
            .catch(err => console.log(`Oops! ${err.stack}`));
        } catch (err) {
          console.log(err.stack);
        }
      }());
    });
  // retrieve all categories
  subjectRouter.route('/categories')
    .get(auth, (req, res) => {
      (async function getAllCategories() {
        try {
          Subject.find({}, { _id: 0, category: 1, subject: 1 }).exec()
            .then(docs => res.status(200).json(docs))
            .catch(err => console.log(`Oops! ${err.stack}`));
        } catch (err) {
          console.log(err.stack);
        }
      }());
    });
  // search for subjects by name, sorted alphabetically in ascending order
  subjectRouter.route('/search')
    .get(auth, (req, res) => {
      (async function search() {
        const str = req.query.q;
        try {
          Subject.find({ subject: { $regex: '^' + str, $options: 'i' } }, null, { sort: { subject: 1 } }).select("-tutors").exec()
            .then(docs => res.status(200).json(docs))
            .catch(err => console.log(`Oops! ${err.stack}`));
        } catch (err) {
          console.log(err.stack);
        }
      }());
    });
  subjectRouter.route('/:category')
    // create subjects under any of 3 categories (only admin)
    .post(auth, (req, res) => {
      if (req.user.isAdmin === true) {
        (async function postSubjectsByCategory() {
          try {
            const { subject } = req.body;
            if (!subject) {
              res.status(400).send({
                status: false,
                message: 'All fields are required'
              });
              return;
            }
            const category = req.params.category;

            debug(chalk.blue(category))
            const sub = new Subject({ subject, category });

            const exists = await Subject.exists({ subject });
            debug(chalk.yellow(exists));
            if (exists) {
              return res.status(423)
                .send({ status: false, message: `${subject} already exist` });
            }
            const su = await sub.save();
            debug(su);
            const newSubject = await Category.findOneAndUpdate({ category: 'student' }, { $push: { subjects: su._id } }, { useFindAndModify: false, new: true });
            const newSubject2 = await Category.findOneAndUpdate({ category: 'tutor' }, { $push: { subjects: su._id } }, { useFindAndModify: false, new: true });

            debug(newSubject, newSubject2);
            res.status(200).json({ status: true, message: 'Subject saved' });
          } catch (err) {
            console.log(err.stack);
          }
        }());
      } else {
        res.status(401).send('Access denied. You are not an Admin.');
      }
    })
    // retrieve all subjects, by category
    .get(auth, (req, res) => {
      (async function getAllSubjectsByCategory() {
        try {
          Subject.find({ category: req.params.category }).select("-tutors").exec()
            .then(docs => res.status(200).json(docs))
            .catch(err => console.log(`Oops! ${err.stack}`));
        } catch (err) {
          console.log(err.stack);
        }
      }());
    })
    //update a category (only admin)
    .patch(admin, (req, res) => {
      (async function updateCategory() {
        const { category } = req.body;
        try {
          Subject.updateMany({ category: req.params.category }, { $set: { category } }).exec()
            .then(docs => res.status(200).json(docs))
            .catch(err => console.log(`Oops! ${err.stack}`));
        } catch (err) {
          console.log(err.stack);
        }
      }());
    })
    // delete a category with all subjects under it (only admin)
    .delete(admin, (req, res) => {
      (async function deleteCategory() {
        try {
          Subject.deleteMany({ category: req.params.category }).exec()
            .then(docs => res.status(200).json({
              status: true,
              message: `category ${req.params.category} deleted`,
            }))
            .catch(err => console.log(`Oops! ${err.stack}`));
        } catch (err) {
          console.log(err.stack);
        }
      }());
    });
  subjectRouter.route('/:category/student')
  // see all tutors taking a subject in a category (only students)
  .get(auth, (req, res) => {
    if (req.user.category === 'student') {
    (async function getAllTutorsByCategory() {
      try {
        Subject.find({ category: req.params.category, subject: req.body.subject }).populate('tutors', '-_id name subject').select('-_id').exec()
          .then(docs => res.status(200).json(docs))
          .catch(err => console.log(`Oops! ${err.stack}`));
      } catch (err) {
        console.log(err.stack);
      }
    }());
  } else {
    res.status(401).send('Access denied. You are not a Student.');
  }
  });
  subjectRouter.route('/:category/tutor')
    // register to take a subject in a category (only tutor)
    .post(auth, (req, res) => {
      if (req.user.category === 'tutor') {
        (async function registerSubjectByCategory() {
          try {
            const { subject } = req.body;
            if (!subject) {
              res.status(400).send({
                status: false,
                message: 'Subject field is required'
              });
              return;
            }
            const category = req.params.category;

            debug(chalk.blue(category))
            const sub = new Subject({ subject, category });

            const exists = await Subject.exists({ subject });
            debug(chalk.yellow(exists));
            if (exists) {
              const newSub = await User.findByIdAndUpdate({ _id: req.user.id }, { $push: { subjects: subject } }, { useFindAndModify: false, new: true });
              return res.status(200)
                .send({ status: true, message: `${subject} saved successfully` });
            }
            const su = await sub.save();
            debug(su);
            const newSubject = await Category.findOneAndUpdate({ category: 'student' }, { $push: { subjects: su._id } }, { useFindAndModify: false, new: true });
            const newSubject2 = await Category.findOneAndUpdate({ category: 'tutor' }, { $push: { subjects: su._id } }, { useFindAndModify: false, new: true });
            const newSub = await User.findByIdAndUpdate({ _id: req.user.id }, { $push: { subjects: subject } }, { useFindAndModify: false, new: true });

            debug(newSubject, newSubject2, newSub);
            res.status(200).json({ status: true, message: `${subject} saved successfully` });
          } catch (err) {
            console.log(err.stack);
          }
        }());
      } else {
        res.status(401).send('Access denied. You are not a Tutor.');
      }
    })
    //see all subjects you registered to take (only tutor)
    .get(auth, (req, res) => {
      if (req.user.category === 'tutor') {
        (async function AllRegisteredSubjects() {
          try {
            User.findById({ _id: req.user.id }).select('subjects').exec()
              .then(docs =>
                res.json(docs))
              .catch(err => console.log(`Oops! ${err.stack}`));
          } catch (err) {
            console.log(err.stack);
          }
        }());
      } else {
        res.status(401).send('Access denied. You are not a Tutor.');
      }
    })
    // update a registered subject (only tutor)
    .patch(auth, (req, res) => {
      if (req.user.category === 'tutor') {
        (async function updateRegisteredSubject() {
          const { old_subject, new_subject } = req.body;
          const category = req.params.category;

          const replaceArrItem = (original, replacement, arr) => {
            const index = arr.indexOf(original);
            if (~index) {
              arr[index] = replacement;
            }
            return arr;
          };

          try {
            const us = await User.findById({ _id: req.user.id }).exec();
              debug(us.subjects);
              const newArr = replaceArrItem(old_subject, new_subject, us.subjects)
              debug(newArr)
              //user.subjects = newArr;
              //const updated = user.save();
              const updated = await User.updateOne({ _id: req.user.id }, {$set: {subjects: newArr}}, { useFindAndModify: false, new: true })
              res.status(200).json(updated);
          } catch (err) {
            console.log(err.stack);
          }
        }());
      } else {
        res.status(401).send('Access denied. You are not a Tutor.');
      }
    })
    //delete a registered subject (only tutor)
    .delete(auth, (req, res) => {
      (async function deleteSubjectByCategoryById() {
        const { subject } = req.body;
        debug(subject);

        const deleteArrItem = (item, arr) => {
          const index = arr.indexOf(item);
          if (~index) {
            arr.splice(index,1);
          }
          return arr;
        };

        try {
          const us = await User.findById({ _id: req.user.id }).exec();
          debug(us.subjects);
          const del = deleteArrItem(subject, us.subjects);
          debug(chalk.yellow(del));

          const updated = await User.updateOne({ _id: req.user.id }, {$set: {subjects: del}}, { useFindAndModify: false, new: true })
           res.status(200).json({
              status: true,
              message: `${subject} has been succesfully deleted`,
            });

        } catch (err) {
          console.log(err.stack);
        }
      }());
    });
  subjectRouter.route('/:category/:id')
    // retrieve a subject in a category (by Id)
    .get(auth, (req, res) => {
      (async function getSubjectByCategoryById() {
        try {
          Subject.find({ category: req.params.category, _id: req.params.id }).exec()
            .then(docs => res.status(200).json(docs))
            .catch(err => console.log(`Oops! ${err.stack}`));
        } catch (err) {
          console.log(err.stack);
        }
      }());
    })
    // update a subject in a category by id (only admin)
    .patch(admin, (req, res) => {
      (async function updateSubjectByCategoryById() {
        const { subject } = req.body;
        debug(subject);
        try {
          Subject.findByIdAndUpdate({ _id: req.params.id }, { $set: { subject } }, { useFindAndModify: false, new: true }).exec()
            .then(docs => res.status(200).json(docs))
            .catch(err => console.log(`Oops! ${err.stack}`));
        } catch (err) {
          console.log(err.stack);
        }
      }());
    })
    // delete a subject in a category by id (only admin)
    .delete(admin, (req, res) => {
      (async function deleteSubjectByCategoryById() {
        const { subject } = req.body;
        debug(subject);
        try {
          Subject.findByIdAndDelete({ _id: req.params.id }).exec()
            .then(docs => res.status(200).json({
              status: true,
              message: `${docs.subject} deleted`,
            }))
            .catch(err => console.log(`Oops! ${err.stack}`));
        } catch (err) {
          console.log(err.stack);
        }
      }());
    });
  return subjectRouter;
}

module.exports = router;
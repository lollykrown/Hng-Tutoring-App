const express = require('express');
const Subject = require('../models/subject');
const Category = require('../models/category');
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
          Subject.updateMany({ category: req.params.category }, { $set: { category} }).exec()
            .then(docs => res.status(200).json(docs))
            .catch(err => console.log(`Oops! ${err.stack}`));
        } catch (err) {
          console.log(err.stack);
        }
      }());
    })
    // delete a category (only admin)
    .delete(admin, (req, res) => {
      (async function deleteCategory() {
        try {
          Subject.deleteMany({category: req.params.category}).exec()
            .then(docs => res.status(200).json({
              status: true,
              message: `category deleted`,
            }))
            .catch(err => console.log(`Oops! ${err.stack}`));
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
          Subject.findByIdAndUpdate({_id: req.params.id}, { $set: { subject } }, { useFindAndModify: false, new: true }).exec()
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
          Subject.findByIdAndDelete({_id: req.params.id}).exec()
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
const express = require('express');
const Subject = require('../models/subject');
const Category = require('../models/category');
const subjectRouter = express.Router();
const debug = require('debug')('app:subjectRoutes');
const chalk = require('chalk');

function router() {
  subjectRouter.route('/')
    .post((req, res) => {
      (async function post() {
        try {
          const { subject, category } = req.body;
          debug(subject, category);
          const sub = new Subject({ subject, category });
          const su = await sub.save();
          debug(su);
          const newSubject = await Category.findOneAndUpdate({category: 'student'}, {$push: {subjects: su._id}}, {useFindAndModify: false, new: true});
          const newSubject2 = await Category.findOneAndUpdate({category: 'tutor'}, {$push: {subjects: su._id}}, {useFindAndModify: false, new: true});

          debug(newSubject, newSubject2);

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
      (async function getAll() {
        try {
          Subject.find({}, null, {sort: {subject: 1}}).exec()
            .then(docs => res.json(docs))
            .catch(err => console.log(`Oops! ${err.stack}`));
        } catch (err) {
          console.log(err.stack);
        }
      }());
    });
    subjectRouter.route('/categories')
    .get((req, res) => {
      (async function getAllCategories() {
        try {
          Subject.find({}, {_id: 0, category: 1}).exec()
          .then(docs => res.status(200).json(docs))
          .catch(err => console.log(`Oops! ${err.stack}`));
        } catch (err) {
          console.log(err.stack);
        }
      }());
    });
    subjectRouter.route('/search')
    .get((req, res) => {
      (async function search() {
        const str = req.query.q;
        searchString = str.toLowerCase();
        debug(searchString)
        try {
          Subject.find({ subject: searchString}).exec()
          .then(docs => res.status(200).json(docs))
          .catch(err => console.log(`Oops! ${err.stack}`));
        } catch (err) {
          console.log(err.stack);
        }
      }());
    });
    subjectRouter.route('/:category')
    .get((req, res) => {
      (async function getAllSubjectsByCategory() {
        try {
          Subject.find({ category: req.params.category }).exec()
          .then(docs => res.status(200).json(docs))
          .catch(err => console.log(`Oops! ${err.stack}`));
        } catch (err) {
          console.log(err.stack);
        }
      }());
    });
    subjectRouter.route('/:category/:id')
    .get((req, res) => {
      (async function getAllSubjectsByCategoryById() {
        try {
          Subject.find({ category: req.params.category, _id: req.params.id}).exec()
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
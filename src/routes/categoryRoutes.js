const express = require('express');
const categoryRouter = express.Router();
const Category = require('../models/category');
const debug = require('debug')('app:categoryRoutes');

function router() {
  categoryRouter.route('/')
    .post((req, res) => {
      (async function pos() {
        try {
          const { category } = req.body;
          debug(category);
          const cat = new Category({ category });
          cat.save();
          res.status(200).json({
            status: true,
            message: `One new ${cat.category} saved`,
          })
        } catch (err) {
          console.log(err.stack);
        }
      }());
    })
    .get((req, res) => {
      (async function get() {
        try {
          Category.find({}).exec()
            .then(docs => res.json(docs))
            .catch(err => console.log(`Oops! ${err}`));
        } catch (err) {
          console.log(err.stack);
        }
      }());
    });
  categoryRouter.route('/pop')
    .get((req, res) => {
      (async function get() {
        try {
          Category.find({ category: 'tutor'}).populate('users subjects tutors lessons').exec()
            .then(docs => res.json(docs))
            .catch(err => console.log(`Oops! ${err}`));
        } catch (err) {
          console.log(err.stack);
        }
      }());
    });
  return categoryRouter;
}

module.exports = router;
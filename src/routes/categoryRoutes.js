const express = require('express');
const categoryRouter = express.Router();
const Category = require('../models/category');
const debug = require('debug')('app:categoryRoutes');
const mongoose = require('mongoose');

function router() {
  categoryRouter.route('/')
    .post((req, res) => {
      (async function pos() {
        try {
          const { category, subjects } = req.body;
          debug(category, subjects);
          const cat = new Category({ category, subjects });
          cat.save();
          res.status(200).json({
            status: true,
            message: 'Category saved',
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
    categoryRouter.route('/:cat')
    .get((req, res) => {
      (async function get() {
        try {
          Category.find({ category: req.params.category}).populate("subjects").exec()
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
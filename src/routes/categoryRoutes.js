const express = require('express');
const categoryRouter = express.Router();
const Category = require('../models/category');
const debug = require('debug')('app:categoryRoutes');


function router() {

  authRouter.route('/category')
    .post((req, res) => {
      (async function get() {
        try {
          const { category, subjects } = req.body;
          debug(category, subjects);
          const categories = await Category.find({}).exec()

          Category.find({}).exec()
            .then(docs => res.status(200).json(docs))
            .catch(err => console.log(`Oops! ${err}`));
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
  return categoryRouter;
}

module.exports = router;
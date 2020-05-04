const debug = require('debug')('app:categoryController');
const chalk = require("chalk");
const User = require('../models/users');
const Category = require('../models/category');

function categoryController() {
  function postCategories(req, res) {
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
  };

  function getCategories(req, res) {
    (async function get() {
      try {
        Category.find({}).exec()
          .then(docs => res.json(docs))
          .catch(err => console.log(`Oops! ${err}`));
      } catch (err) {
        console.log(err.stack);
      }
    }());
  };

  
  function populateCategories(req, res) {
    (async function get() {
      try {
        Category.find({ category: 'tutor'}).populate('users subjects tutors lessons').exec()
          .then(docs => res.json(docs))
          .catch(err => console.log(`Oops! ${err}`));
      } catch (err) {
        console.log(err.stack);
      }
    }());
  }

  return {
    postCategories,
    getCategories,
    becomeAdmin
  };
}

module.exports = categoryController;
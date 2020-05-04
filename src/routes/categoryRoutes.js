const express = require('express');
const categoryRouter = express.Router();
const debug = require('debug')('app:categoryRoutes');
const categoryController = require('../controllers/categoryController');

function router() {
  const { postCategories, getCategories, populateCategories } = categoryController();

  categoryRouter.route('/').post(postCategories).get(getCategories);
  categoryRouter.route('/pop').get(populateCategories);
  return categoryRouter;
}

module.exports = router;
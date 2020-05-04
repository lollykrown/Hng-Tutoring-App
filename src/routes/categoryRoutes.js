const express = require('express');
const categoryRouter = express.Router();
const Category = require('../models/category');
const debug = require('debug')('app:categoryRoutes');

function router() {
  categoryRouter.route('/')
    .post()
    .get();
  categoryRouter.route('/pop')
    .get();
  return categoryRouter;
}

module.exports = router;
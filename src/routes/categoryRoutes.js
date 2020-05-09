const express = require('express')
const categoryRouter = express.Router()
const cacheMiddleware = require('../utils/cacheMiddleware')
const categoryController = require('../controllers/categoryController')

function router() {
  const { postCategories, getCategories, populateCategories } = categoryController()

  categoryRouter.route('/').post(postCategories).get(cacheMiddleware, getCategories)
  categoryRouter.route('/pop').get(cacheMiddleware, populateCategories)
  return categoryRouter
}

module.exports = router
const express = require('express')
const authRouter = express.Router()
const userController = require('../controllers/userController')
const auth = require('../utils/auth')

function router() {
  const { signUp, signIn, becomeAdmin } = userController()

  authRouter.route('/signup').post(signUp)
  authRouter.route('/signin').post(signIn)
  authRouter.route('/admin').get(auth, becomeAdmin)
  return authRouter
}

module.exports = router
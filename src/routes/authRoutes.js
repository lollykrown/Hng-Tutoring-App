const express = require('express');
const authRouter = express.Router();
const userController = require('../controllers/userController');

function router() {
  const { signUp, signIn } = userController();

  authRouter.route('/signup').post(signUp);
  authRouter.route('/signin').post(signIn);
  return authRouter;
}

module.exports = router;
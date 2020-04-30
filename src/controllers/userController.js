const debug = require('debug')('app:userController');
const jwt = require("jsonwebtoken");
const chalk = require("chalk");
const bcrypt = require("bcryptjs");
const User = require('../models/users');

function userController() {
  function signUp(req, res) {
    (async function auth() {
      try {
        const { email, password, username, cat } = req.body;
        const category = cat.toLowerCase();
        if (!email || !password || !category) {
          res.status(400).send({
            status: false,
            message: 'All fields are required'
          });
          return;
        }
        const user = await User.findOne({ email }).exec();
        if (user) {
          return res.status(423)
            .send({ status: false, message: 'This email already exists' })
        }

        bcrypt.hash(password, 12)
          .then(hashedPassword => {
            const user = new User({ email, hashedPassword, username, category });
            user.save();
          })
          .then(() => {
            res.status(200).json({
              status: true,
              message: 'You have been successfully registered, Welcome to the Tutoring App',
              email: email
            });
          })
          .catch(err => console.log(err));
      } catch (err) {
        console.log(err.stack);
      }
    }());
  }
  function signIn(req, res) {
    (async function auth() {
      try {
        const { email, password } = req.body;
        debug(chalk.blue(email, password));
        const user = await User.findOne({ email }).exec();
        debug(chalk.green(user));
        if (!user) {
          return res
            .status(404)
            .send("User not found, please provide valid credentials");
        }
        bcrypt.compare(password, user.hashedPassword).then(valid => {
          if (!valid) {
            return res.status(403).send("Incorrect username or password, please review details and try again");
          }
          const token = jwt.sign(
            { email: user.email, _id: user._id },
            "mysecretkey",
            { expiresIn: "1hr" }
          );
          res.status(200).send({
            status: true,
            message: 'You are now logged in'
          });
        })
          .catch(err => console.log(err));
      } catch (err) {
        console.log(err.stack);
      }
    }());
  }
  return {
    signUp,
    signIn,
  };
}

module.exports = userController;
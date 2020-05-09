const debug = require('debug')('app:userController')
const jwt = require("jsonwebtoken")
const chalk = require("chalk")
const bcrypt = require("bcryptjs")
const User = require('../models/users')
const Category = require('../models/category')

function userController() {
  function signUp(req, res) {
    (async function auth() {
      try {
        const { email, password, username, identifier } = req.body
        if (!email || !password || !identifier) {
          res.status(400).send({
            status: false,
            message: 'All fields are required'
          })
          return
        }
        const category = identifier.toLowerCase()
        let userId = ""
        const user = await User.findOne({ email }).exec()
        if (user) {
          return res.status(423)
            .send({ status: false, message: 'This email already exists' })
        }
        bcrypt.hash(password, 10)
          .then(hashedPassword => {
            const user = new User({ email, hashedPassword, username, category })
            user.save()
              .then(docx => {
                userId = docx._id
                debug(chalk.red(docx))
                Category.findOneAndUpdate({category}, {$push: {users: docx._id}}, {useFindAndModify: false, new: true})
                .exec( newUser => {
                  debug(chalk.grey(newUser))
                })
              })
          })
          .then(() => {
            res.status(200).json({
              status: true,
              message: 'You have been successfully registered, Welcome to the Tutoring App',
              email: email
            })
          })
          .catch(err => debug(err))

      } catch (err) {
        debug(err.stack)
      }
    }());
  }
  function signIn(req, res) {
    (async function auth() {
      try {
        const { email, password } = req.body
        debug(chalk.blue(email, password))
        const user = await User.findOne({ email }).exec()
        if (!user) {
          return res
            .status(404)
            .send("User not found, please provide valid credentials")
        }
        bcrypt.compare(password, user.hashedPassword).then(valid => {
          if (!valid) {
            return res.status(403).send("Incorrect username or password, please review details and try again");
          }
          const token = user.generateAuthToken();
          debug(chalk.yellow(token))

          // const token = jwt.sign(
          //   { id: user._id, email: user.email, category: user.category, isAdmin: user.isAdmin },
          //   "mysecretkey",
          //   { expiresIn: 60 * 60 }
          // );
          debug(`Time: ${Date(Date.now()).toString()}`);
          res.header("x-auth-token", token).send({
            status: true,
            id: user._id,
            password: user.category,
            message: 'You are now logged in'
          });
        })
          .catch(err => debug(err));
      } catch (err) {
        debug(err.stack)
      }
    }());
  }
  function becomeAdmin(req, res) {
    if (!req.user){
      return res.status(401).send('You have to login first')
    }
    if (req.user.category === 'tutor') {
      (async function requestAdminPriviledges() {
        try {
          User.findOneAndUpdate({_id: req.user.id}, { $set: { isAdmin: true } }, { useFindAndModify: false, new: true }).exec()
            .then(docs => res.status(200).json({
              status: true,
              message: `Congrats ${docs.username}! You are now an admin. Login again to access admin benefits`
            }))
            .catch(err => debug(`Oops! ${err.stack}`))
        } catch (err) {
          debug(err.stack)
        }
      }());
    } else {
      res.status(401).send('Request denied. You have to be a Tutor and a Power User')
    }
  }
  return {
    signUp,
    signIn,
    becomeAdmin
  }
}

module.exports = userController
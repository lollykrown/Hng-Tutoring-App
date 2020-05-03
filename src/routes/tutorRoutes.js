const express = require('express');
const Tutor = require('../models/tutor');
const Subject = require('../models/subject');
const Category = require('../models/category');
const tutorRouter = express.Router();
const debug = require('debug')('app:tutorRoutes');
const chalk = require('chalk');
const auth = require('../utils/auth');
const admin = require('../utils/admin');

function router() {
  function middleware(req, res, next) {
    if (req.user) {
      debug(req.user);
      debug(`Time: ${Date(Date.now()).toString()}`);
      next();
    } else {
      //res.send("Login first!");
      res.redirect('/');
    };
  };
  tutorRouter.route('/')
    .post(auth, (req, res) => {
      (async function pos() {
        try {
          let { name, level, classes, subject } = req.body;
          function toCaps(num) {
            let arr = [];
            for (let n of num.split(' ')) {
              n[0].toUpperCase() + n.slice(1);
              arr
            }
            return arr.join('');
          }
          //name = toCaps(name);
          debug(name, subject);
          const tutor = new Tutor({ name, level, classes, subject });
          const exist = await Tutor.exists({ name });
          debug(exist);
          if (exist) {
            return res.status(423)
              .send({ status: false, message: `${name} already exists` })
          }
          const tu = await tutor.save();
          const newtutor = await Category.findOneAndUpdate({ category: 'student' }, { $push: { tutors: tu._id } }, { useFindAndModify: false, new: true });
          
          if (req.user.category === 'tutor') {
            const newSub = await User.findByIdAndUpdate({ _id: req.user.category }, { $push: { subjects: subject } }, { useFindAndModify: false, new: true });
          }
          debug(chalk.red(tu, newtutor));

          //let subj = [];
          //let addedSubject;
          for (let s of subject) {
            debug(s);
            const subj = new Subject(
              {
                subject: s,
                tutors: [tu._id],
                category: level
              }
            );
            const addedSubject = await Subject.findOne({ subject: s }).exec();
            debug(addedSubject);
            if (!addedSubject) {
              const sub = await subj.save();
              debug(chalk.blue(sub));
              let newSub = await Category.findOneAndUpdate({ category: 'student' }, { $push: { subjects: sub._id } }, { useFindAndModify: false, new: true }).exec();
              let newSub1 = await Category.findOneAndUpdate({ category: 'tutor' }, { $push: { subjects: sub._id } }, { useFindAndModify: false, new: true }).exec();
              debug(chalk.grey(newSub, newSub1));
            }
          }

          res.status(200).json({
            status: true,
            message: 'Tutor saved',
          })
        } catch (err) {
          console.log(err.stack);
        }
      }());
    })
    //retrieve all tutors (only admin)
    .get(admin, (req, res) => {
      (async function getAll() {
        try {
          Tutor.find({}).select('name').exec()
            .then(docs => res.json(docs))
            .catch(err => console.log(`Oops! ${err}`));
        } catch (err) {
          console.log(err.stack);
        }
      }());
    });
  tutorRouter.route('/subject')
    //see all subject (only tutors)
    .get(auth, (req, res) => {
      if (!req.user.category === 'tutor') {
        return res.status(423)
          .send({ status: false, message: `you are not a tutor` });
      }
      (async function getAll() {
        try {
          const exists = await Tutor.exists({ name: req.user.username });
          if (!exists) {
            return res.status(423)
              .send({ status: false, message: `you have not registered to take any course` });
          }
          Tutor.find({ name: req.user.username }).select('subject').exec()
            .then(docs => res.json(docs))
            .catch(err => console.log(`Oops! ${err}`));
        } catch (err) {
          console.log(err.stack);
        }
      }());

    });
  tutorRouter.route('/:id')
    //get a tutor by id (only admin)
    .get(admin, (req, res) => {
      (async function getTutorById() {
        try {
          Tutor.find({ _id: req.params.id }).select('name').exec()
            .then(docs => res.json(docs))
            .catch(err => console.log(`Oops! ${err}`));
        } catch (err) {
          console.log(err.stack);
        }
      }());
    })
    // deactivate a tutor by id (only admin)
    .delete(admin, (req, res) => {
      (async function deleteTutorById() {
        try {
          Tutor.findByIdAndDelete({ _id: req.params.id }).exec()
            .then(docs => res.json({
              status: true,
              message: `${docs.name} deleted`,
            }))
            .catch(err => console.log(`Oops! ${err}`));
        } catch (err) {
          console.log(err.stack);
        }
      }());
    });
  // search for tutors by first name, sorted alphabetically in ascending order.
  tutorRouter.route('/search')
    .get(auth, (req, res) => {
      if (req.user.category == 'student' || req.user.isAdmin === true) {
        (async function searchTutorByFirstName() {
          try {
            debug(req.user)
            const str = req.query.q;
            const q = str[0].toUpperCase() + str.slice(1);;
            debug(q);
            Tutor.find({ name: { $regex: '^' + q, $options: 'i' } }, null, { sort: { name: 1 } }).select("-_id -lessons -level").exec()
              .then(docs => res.json(docs))
              .catch(err => console.log(`Oops! ${err}`));
          } catch (err) {
            console.log(err.stack);
          }
        }());
      } else {
        res.status(401).send('Access denied. You are not a Student or Admin.');
      }
    });
  return tutorRouter;
}

module.exports = router;
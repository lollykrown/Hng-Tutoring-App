const Tutor = require('../models/tutor');
const Subject = require('../models/subject');
const Category = require('../models/category');
const debug = require('debug')('app:tutorController');
const chalk = require('chalk');

function tutorController() {

  function addTutor(req, res) {
    (async function add() {
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
  };

  function getAllTutors(req, res) {
    (async function getAll() {
      try {
        Tutor.find({}).select('name').exec()
          .then(docs => res.json(docs))
          .catch(err => console.log(`Oops! ${err}`));
      } catch (err) {
        console.log(err.stack);
      }
    }());
  };

  function getAll(req, res) {
    if (!req.user.category === 'tutor') {
      return res.status(423)
        .send({ status: false, message: `you are not a tutor` });
    }
    (async function retrieve() {
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

  };

  function getTutorById(req, res) {
    (async function getTutor() {
      try {
        Tutor.find({ _id: req.params.id }).select('name').exec()
          .then(docs => res.json(docs))
          .catch(err => console.log(`Oops! ${err}`));
      } catch (err) {
        console.log(err.stack);
      }
    }());
  };

  function deleteTutorById(req, res) {
    (async function del() {
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
  };

  function searchTutorByFirstName(req, res) {
    if (req.user.category == 'student' || req.user.isAdmin === true) {
      (async function searchTutor() {
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
  }

  return {
    addTutor,
    getAllTutors,
    getAll,
    getTutorById,
    deleteTutorById,
    searchTutorByFirstName
  };
}

module.exports = tutorController;
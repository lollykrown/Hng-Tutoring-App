const Subject = require('../models/subject');
const Category = require('../models/category');
const User = require('../models/users');
const debug = require('debug')('app:subjectController');
const chalk = require('chalk');

function subjectController() {
  function getAll(req, res) {
    (async function retrieve() {
      try {
        Subject.find({}).exec()
          .then(docs => res.json(docs))
          .catch(err => console.log(`Oops! ${err.stack}`));
      } catch (err) {
        console.log(err.stack);
      }
    }());
  }

  function getAllCategories(req, res) {
    (async function getAll() {
      try {
        Subject.find({}, { _id: 0, category: 1, subject: 1 }).exec()
          .then(docs => res.status(200).json(docs))
          .catch(err => console.log(`Oops! ${err.stack}`));
      } catch (err) {
        console.log(err.stack);
      }
    }());
  }

  function search(req, res) {
    (async function searchSubjects() {
      const str = req.query.q;
      try {
        Subject.find({ subject: { $regex: '^' + str, $options: 'i' } }, null, { sort: { subject: 1 } }).select("-tutors").exec()
          .then(docs => res.status(200).json(docs))
          .catch(err => console.log(`Oops! ${err.stack}`));
      } catch (err) {
        console.log(err.stack);
      }
    }());
  }

  function postSubjectsByCategory(req, res) {
    if (req.user.isAdmin === true) {
      (async function postSubjects() {
        try {
          const { subject } = req.body;
          if (!subject) {
            res.status(400).send({
              status: false,
              message: 'All fields are required'
            });
            return;
          }
          const category = req.params.category;
          debug(chalk.blue(category))
          const sub = new Subject({ subject, category });

          const exists = await Subject.exists({ subject });
          debug(chalk.yellow(exists));
          if (exists) {
            return res.status(423)
              .send({ status: false, message: `${subject} already exist` });
          }
          const su = await sub.save();
          debug(su);
          const newSubject = await Category.findOneAndUpdate({ category: 'student' }, { $push: { subjects: su._id } }, { useFindAndModify: false, new: true });
          const newSubject2 = await Category.findOneAndUpdate({ category: 'tutor' }, { $push: { subjects: su._id } }, { useFindAndModify: false, new: true });

          debug(newSubject, newSubject2);
          res.status(200).json({ status: true, message: 'Subject saved' });
        } catch (err) {
          console.log(err.stack);
        }
      }());
    } else {
      res.status(401).send('Access denied. You are not an Admin.');
    }
  }

  function getAllSubjectsByCategory(req, res) {
    (async function getAllSubjects() {
      try {
        Subject.find({ category: req.params.category }).select("-tutors").exec()
          .then(docs => res.status(200).json(docs))
          .catch(err => console.log(`Oops! ${err.stack}`));
      } catch (err) {
        console.log(err.stack);
      }
    }());
  }

  function updateCategory(req, res) {
    (async function updateCat() {
      const { category } = req.body;
      try {
        Subject.updateMany({ category: req.params.category }, { $set: { category } }).exec()
          .then(docs => res.status(200).json(docs))
          .catch(err => console.log(`Oops! ${err.stack}`));
      } catch (err) {
        console.log(err.stack);
      }
    }());
  }

  function deleteCategory(req, res) {
    (async function del() {
      try {
        Subject.deleteMany({ category: req.params.category }).exec()
          .then(docs => res.status(200).json({
            status: true,
            message: `category ${req.params.category} deleted`,
          }))
          .catch(err => console.log(`Oops! ${err.stack}`));
      } catch (err) {
        console.log(err.stack);
      }
    }());
  }

  function getAllTutorsByCategory(req, res) {
    if (req.user.category === 'student') {
      (async function getAllTutors() {
        try {
          Subject.find({ category: req.params.category, subject: req.body.subject }).populate('tutors', '-_id name subject').select('-_id').exec()
            .then(docs => res.status(200).json(docs))
            .catch(err => console.log(`Oops! ${err.stack}`));
        } catch (err) {
          console.log(err.stack);
        }
      }());
    } else {
      res.status(401).send('Access denied. You are not a Student.');
    }
  }

  function registerSubjectByCategory(req, res) {
    if (req.user.category === 'tutor') {
      (async function registerSubject() {
        try {
          const { subject } = req.body;
          if (!subject) {
            res.status(400).send({
              status: false,
              message: 'Subject field is required'
            });
            return;
          }
          const category = req.params.category;

          debug(chalk.blue(category))
          const sub = new Subject({ subject, category });

          const exists = await Subject.exists({ subject });
          debug(chalk.yellow(exists));
          if (exists) {
            const newSub = await User.findByIdAndUpdate({ _id: req.user.id }, { $push: { subjects: subject } }, { useFindAndModify: false, new: true });
            return res.status(200)
              .send({ status: true, message: `${subject} saved successfully` });
          }
          const su = await sub.save();
          debug(su);
          const newSubject = await Category.findOneAndUpdate({ category: 'student' }, { $push: { subjects: su._id } }, { useFindAndModify: false, new: true });
          const newSubject2 = await Category.findOneAndUpdate({ category: 'tutor' }, { $push: { subjects: su._id } }, { useFindAndModify: false, new: true });
          const newSub = await User.findByIdAndUpdate({ _id: req.user.id }, { $push: { subjects: subject } }, { useFindAndModify: false, new: true });

          debug(newSubject, newSubject2, newSub);
          res.status(200).json({ status: true, message: `${subject} saved successfully` });
        } catch (err) {
          console.log(err.stack);
        }
      }());
    } else {
      res.status(401).send('Access denied. You are not a Tutor.');
    }
  }

  function AllRegisteredSubjects(req, res) {
    if (req.user.category === 'tutor') {
      (async function AllRegisteredSub() {
        try {
          User.findById({ _id: req.user.id }).select('subjects').exec()
            .then(docs =>
              res.json(docs))
            .catch(err => console.log(`Oops! ${err.stack}`));
        } catch (err) {
          console.log(err.stack);
        }
      }());
    } else {
      res.status(401).send('Access denied. You are not a Tutor.');
    }
  }

  function updateRegisteredSubject(req, res) {
    if (req.user.category === 'tutor') {
      (async function updateReg() {
        const { old_subject, new_subject } = req.body;
        const category = req.params.category;

        const replaceArrItem = (original, replacement, arr) => {
          const index = arr.indexOf(original);
          if (~index) {
            arr[index] = replacement;
          }
          return arr;
        };

        try {
          const us = await User.findById({ _id: req.user.id }).exec();
            debug(us.subjects);
            const newArr = replaceArrItem(old_subject, new_subject, us.subjects)
            debug(newArr)
            //user.subjects = newArr;
            //const updated = user.save();
            const updated = await User.updateOne({ _id: req.user.id }, {$set: {subjects: newArr}}, { new: true })
            res.status(200).json(updated);
        } catch (err) {
          console.log(err.stack);
        }
      }());
    } else {
      res.status(401).send('Access denied. You are not a Tutor.');
    }
  }

  function deleteSubjectByCategory(req, res) {
    (async function deleteSubject() {
      const { subject } = req.body;
      debug(subject);

      const deleteArrItem = (item, arr) => {
        const index = arr.indexOf(item);
        if (~index) {
          arr.splice(index,1);
        }
        return arr;
      };

      try {
        const us = await User.findById({ _id: req.user.id }).exec();
        debug(us.subjects);
        const del = deleteArrItem(subject, us.subjects);
        debug(chalk.yellow(del));

        const updated = await User.updateOne({ _id: req.user.id }, {$set: {subjects: del}}, { new: true })
         res.status(200).json({
            status: true,
            message: `${subject} has been succesfully deleted`,
          });

      } catch (err) {
        console.log(err.stack);
      }
    }());
  }

  function getSubjectByCategoryById(req, res) {
    (async function getSubject() {
      try {
        Subject.find({ category: req.params.category, _id: req.params.id }).exec()
          .then(docs => res.status(200).json(docs))
          .catch(err => console.log(`Oops! ${err.stack}`));
      } catch (err) {
        console.log(err.stack);
      }
    }());
  }

  function updateSubjectByCategoryById(req, res) {
    (async function updateSubject() {
      const { subject } = req.body;
      debug(subject);
      try {
        Subject.findByIdAndUpdate({ _id: req.params.id }, { $set: { subject } }, { new: true }).exec()
          .then(docs => res.status(200).json(docs))
          .catch(err => console.log(`Oops! ${err.stack}`));
      } catch (err) {
        console.log(err.stack);
      }
    }());
  }

  function deleteSubjectByCategoryById(req, res) {
    (async function deleteSubjectByCategoryById() {
      try {
        Subject.findByIdAndDelete({ _id: req.params.id }).exec()
          .then(docs => res.status(200).json({
            status: true,
            message: `${docs.subject} deleted`,
          }))
          .catch(err => console.log(`Oops! ${err.stack}`));
      } catch (err) {
        console.log(err.stack);
      }
    }());
  }

  return {
    getAll,
    getAllCategories,
    search,
    postSubjectsByCategory,
    getAllSubjectsByCategory,
    updateCategory,
    deleteCategory,
    getAllTutorsByCategory,
    registerSubjectByCategory,
    AllRegisteredSubjects,
    updateRegisteredSubject,
    deleteSubjectByCategory,
    getSubjectByCategoryById,
    updateSubjectByCategoryById,
    deleteSubjectByCategoryById
  };
}

module.exports = subjectController;

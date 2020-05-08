const express = require('express');
const subjectRouter = express.Router();
const auth = require('../utils/auth');
const admin = require('../utils/admin')
const subjectController = require('../controllers/subjectController');
const cacheMiddleware = require('../utils/cacheMiddleware');

function router() {
  const { getAll, getAllCategories, search, postSubjectsByCategory, getAllSubjectsByCategory, updateCategory, 
    deleteCategory, getAllTutorsByCategory, registerSubjectByCategory, AllRegisteredSubjects, updateRegisteredSubject,
    deleteSubjectByCategory, getSubjectByCategoryById, updateSubjectByCategoryById, deleteSubjectByCategoryById} = subjectController();

  subjectRouter.route('/')
    // retrieve all subjects
    .get(auth, cacheMiddleware, getAll);
  // retrieve all categories
  subjectRouter.route('/categories')
    .get(auth, cacheMiddleware, getAllCategories);
  // search for subjects by name, sorted alphabetically in ascending order
  subjectRouter.route('/search')
    .get(auth, cacheMiddleware, search);
  subjectRouter.route('/:category')
    // create subjects under any of 3 categories (only admin)
    .post(auth, postSubjectsByCategory)
    // retrieve all subjects, by category
    .get(auth, cacheMiddleware, getAllSubjectsByCategory)
    //update a category (only admin)
    .patch(admin, updateCategory)
    // delete a category with all subjects under it (only admin)
    .delete(admin, deleteCategory);
  subjectRouter.route('/:category/student')
  // see all tutors taking a subject in a category (only students)
  .get(auth, cacheMiddleware, getAllTutorsByCategory);
  subjectRouter.route('/:category/tutor')
    // register to take a subject in a category (only tutor)
    .post(auth, registerSubjectByCategory)
    //see all subjects you registered to take (only tutor)
    .get(auth, cacheMiddleware, AllRegisteredSubjects)
    // update a registered subject (only tutor)
    .patch(auth, updateRegisteredSubject)
    //delete a registered subject (only tutor)
    .delete(auth, deleteSubjectByCategory);
  subjectRouter.route('/:category/:id')
    // retrieve a subject in a category (by Id)
    .get(auth, cacheMiddleware, getSubjectByCategoryById)
    // update a subject in a category by id (only admin)
    .patch(admin, updateSubjectByCategoryById)
    // delete a subject in a category by id (only admin)
    .delete(admin, deleteSubjectByCategoryById);
  return subjectRouter;
}

module.exports = router;
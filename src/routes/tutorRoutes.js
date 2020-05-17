const express = require('express')
const tutorRouter = express.Router()
const auth = require('../utils/auth')
const admin = require('../utils/admin')
const tutorController = require('../controllers/tutorController')
const cacheMiddleware = require('../utils/cacheMiddleware')
const { check } = require('express-validator')

function router() {
  const { addTutor, getAllTutors, getAll, getTutorById, deleteTutorById, searchTutorByFirstName } = tutorController()

  tutorRouter.route('/')
    .post(auth, [
      check('name', 'Name is too short').isLength({ min: 9 }),
      check('level', 'Invalid level').notEmpty(),
      check('classes', 'Empty message').notEmpty(),
      check('subject', 'Empty message').notEmpty()
    ], addTutor)
    //retrieve all tutors (only admin)
    .get(admin, cacheMiddleware, getAllTutors)
  tutorRouter.route('/subject')
    //see all subject (only tutors)
    .get(auth, cacheMiddleware, getAll)
  tutorRouter.route('/:id')
    //get a tutor by id (only admin)
    .get(admin, cacheMiddleware, getTutorById)
    // deactivate a tutor by id (only admin)
    .delete(admin, deleteTutorById)
  // search for tutors by first name, sorted alphabetically in ascending order.
  tutorRouter.route('/search')
    .get(auth, cacheMiddleware, searchTutorByFirstName)
  return tutorRouter
}

module.exports = router
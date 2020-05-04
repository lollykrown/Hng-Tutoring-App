const express = require('express');
const lessonRouter = express.Router();
const admin = require('../utils/admin');
const auth = require('../utils/auth');
const lessonController = require('../controllers/lessonController');

function router() {
  const { bookLesson, getAll, bookLessonStudent, getLessonById, updateLessonById, deleteLessonById } = lessonController();

  lessonRouter.route('/')
    //book lesson (only admin)
    .post(admin, bookLesson)
    // retrieve all lessons (only admin)
    .get(admin, getAll);
  lessonRouter.route('/student')
    //book lesson as a student (only student)
    .post(auth, bookLessonStudent)
  // get a lesson by id (only admin)
  lessonRouter.route('/:id')
    .get(admin, getLessonById)
    // update a lesson by id (only admin)
    .patch(admin, updateLessonById)
    // delete a lesson by id (only admin)
    .delete(admin, deleteLessonById);
  return lessonRouter;
}

module.exports = router;
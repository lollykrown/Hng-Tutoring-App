const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lessonSchema = new Schema({
	subject: {
    type: String,
    required: true
  },
	time: {
    type: String,
  },
  tutor: {
    type: String,
    //required: true
  },
  level: {
    type: String,
    enum: ['primary', 'jss', 'sss']
  },
  date: {
    type: Date
  }
}, {timestamps: true});

module.exports = mongoose.model( 'Lesson', lessonSchema );
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const categorySchema = new Schema({
	category: {
    type: String,
    lowercase: true,
    enum: ['student', 'tutor', 'shu']
  },
  users: [{
    type: Schema.Types.ObjectId,
    ref: 'Users'
  }],
  subjects: [{
    type: Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  tutors: [{
    type: Schema.Types.ObjectId,
    ref: 'Tutor'
  }],
  lessons: [{
    type: Schema.Types.ObjectId,
    ref: 'Lesson'
  }]
})

module.exports = mongoose.model( 'Category', categorySchema )
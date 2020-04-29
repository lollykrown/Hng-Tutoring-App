const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
	subject: {
    type: String,
    required: true
  },
	tutors: {
    type: Array,
    default: []
  },
  level: {
    type: String,
    enum: ['primary', 'jss', 'sss']
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }
});

module.exports = mongoose.model( 'Subject', subjectSchema )
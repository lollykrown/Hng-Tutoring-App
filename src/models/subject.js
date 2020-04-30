const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subjectSchema = new mongoose.Schema({
	subject: {
    type: String,
    required: true
  },
	// tutors: {
  //   type: Array,
  //   default: []
  // },
    tutors: [{
    type: Schema.Types.ObjectId,
    ref: 'Tutor'
  }],
  level: {
    type: String,
    enum: ['primary', 'jss', 'sss']
  },
  // category: {
  //   type: Schema.Types.ObjectId,
  //   ref: 'Category'
  // }
});

module.exports = mongoose.model( 'Subject', subjectSchema )
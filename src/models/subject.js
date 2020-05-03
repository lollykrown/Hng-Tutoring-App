const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subjectSchema = new Schema({
	subject: {
    type: String,
  },
    tutors: [{
    type: Schema.Types.ObjectId,
    ref: 'Tutor'
  }],
  category: {
    type: String,
    enum: ['primary', 'jss', 'sss']
  },
});

module.exports = mongoose.model( 'Subject', subjectSchema )
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tutorSchema = new Schema({
	name: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['primary', 'jss', 'sss']
  },
  classes: {
    type: Array,
  },
	subject: {
    type: Array
  },
  lessons: [{
    type: Schema.Types.ObjectId,
    ref: 'Tutor'
  }],
});

module.exports = mongoose.model( 'Tutor', tutorSchema )
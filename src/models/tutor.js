const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tutorSchema = new mongoose.Schema({
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
    //enum: ['primary','jss1', 'jss2', 'jss3', 'sss1', 'sss2', 'sss3']
  },
  // subjects: [{
  //   type: Schema.Types.ObjectId,
  //   ref: 'Subject'
  // }],
	subject: {
    type: String
  }
});

module.exports = mongoose.model( 'Tutor', tutorSchema )
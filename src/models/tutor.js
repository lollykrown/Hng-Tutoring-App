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
  },
	subject: {
    type: Array
  }
});

module.exports = mongoose.model( 'Tutor', tutorSchema )
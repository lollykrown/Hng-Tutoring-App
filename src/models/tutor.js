const mongoose = require('mongoose');

const tutorSchema = new mongoose.Schema({
	name: {
    type: String,
    required: true
  },
	subjects: [{
    type: Schema.Types.ObjectId,
    ref: 'Subject'
  }],
});

module.exports = mongoose.model( 'Tutor', tutorSchema )
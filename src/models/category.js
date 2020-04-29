const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
	category: {
    type: String,
    enum: ['Student', 'Tutor']
  },
  subjects: [{
    type: Schema.Types.ObjectId,
    ref: 'Subject'
  }]
});

module.exports = mongoose.model( 'Category', categorySchema )
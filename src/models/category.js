const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
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
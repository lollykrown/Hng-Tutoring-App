const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Schema = mongoose.Schema;

const usersSchema = new Schema({
	email: {
    type: String,
    required: true
  },
	hashedPassword: {
    type: String,
    required: true
  },
  name: {
    type: String,
  },
  category: {
    type: String,
    required: true,
    default: 'student',
    enum: ['student', 'tutor']
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  subjects: {
    type: Array
  },
  lessons: [{
    type: Schema.Types.ObjectId,
    ref: 'Tutor'
  }],
}, {timestamps: true});

usersSchema.methods.generateAuthToken = function() { 
  const token = jwt.sign({ category: user.category, email: user.email, isAdmin: this.isAdmin }, 'mysecretkey', { expiresIn: "1hr" });
  return token;
}

module.exports = mongoose.model( 'Users', usersSchema )
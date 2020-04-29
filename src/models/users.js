const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
	email: {
    type: String,
    required: true
  },
	hashedPassword: {
    type: String,
    required: true
  },
  username: {
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
  }
}, {timestamps: true});

module.exports = mongoose.model( 'Users', usersSchema )
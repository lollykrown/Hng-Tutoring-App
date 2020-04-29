const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
	email: {
    type: String,
    required: true
  },
	password: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Student', 'Tutor']
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
}, {timestamps: true});

module.exports = mongoose.model( 'Users', usersSchema )
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Schema = mongoose.Schema;

const usersSchema = new Schema({
	email: {
    type: String,
    unique: true,
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

usersSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('There was a duplicate key error'));
  } else {
    next();
  }
});

usersSchema.methods.generateAuthToken = function() { 
  const token = jwt.sign({ id: this._id, category: this.category, email: this.email, isAdmin: this.isAdmin }, 'mysecretkey', { expiresIn: "1hr" });
  return token;
}

module.exports = mongoose.model( 'Users', usersSchema )
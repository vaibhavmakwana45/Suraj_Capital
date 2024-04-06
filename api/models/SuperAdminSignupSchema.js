const mongoose = require('mongoose');

const SuperAdminSignupSchema = new mongoose.Schema({
  user_id: {
    type: String,
    unique: true
  },
  firstname: {
    type: String
  },
  lastname: {
    type: String
  },
  email: {
    type: String,
    lowercase: true
  },
  phonenumber: {
    type: Number
  },
  password: {
    type: String
  },
  createAt: {
    type: String
  },
  updateAt: {
    type: String
  }
});

module.exports = mongoose.model('SuperAdminSignup', SuperAdminSignupSchema);

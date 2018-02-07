const mongoose = require('mongoose')

const User = mongoose.model('User', {
  username: String,
  name: String,
  adult: Boolean,
  passwordHash: String
})

module.exports = User
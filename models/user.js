const mongoose = require('mongoose')
const Blog = require('../models/blog')

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  adult: Boolean,
  passwordHash: String,
  blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }]
})

userSchema.statics.format = (user) => {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    adult: user.adult,
    blogs: user.blogs.map(Blog.format)
  }
}

const User = mongoose.model('User', userSchema)

module.exports = User
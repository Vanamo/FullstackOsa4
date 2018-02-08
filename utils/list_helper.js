const dummy = () => {
  return 1
}

const totalLikes = (blogs) => {
  const likes = blogs.map(blog => blog.likes)
  const reducer = (sum, item) => {
    return sum + item
  }

  return likes.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  const reducer = (a, b) => {
    return Math.max(a, b)
  }
  const likes = blogs.map(blog => blog.likes)
  const mostLikes = likes.reduce(reducer, 0)
  return blogs.find(blog => blog.likes === mostLikes)
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}
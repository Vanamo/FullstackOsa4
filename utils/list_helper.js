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

const mostBlogs = (blogs) => {

  const authors = blogs.map(blog => blog.author)
  authors.sort()
  let blogsOfAuthors = []
  let current = null
  let count = 0

  for (let i = 0; i < authors.length; i++) {
    if (authors[i] !== current) {
      if (count > 0) {
        blogsOfAuthors.push({ author: current, blogs: count })
      }
      current = authors[i]
      count = 1
    } else {
      count++
    }
  }
  if (count > 0) {
    blogsOfAuthors.push({ author: current, blogs: count })
  }

  blogsOfAuthors.sort((a, b) => b.blogs - a.blogs)

  return blogsOfAuthors[0]
}

const mostLikes = (blogs) => {

  blogs.sort((a, b) => {
    if (a.author < b.author) return -1
    if (a.author > b.author) return 1
    return 0
  })

  const authors = blogs.map(blog => blog.author)
  const likes = blogs.map(blog => blog.likes)
  let likesOfAuthors = []
  let current = null
  let count = 0

  for (let i = 0; i < authors.length; i++) {
    if (authors[i] !== current) {
      if (count > 0) {
        likesOfAuthors.push({ author: current, likes: count })
      }
      current = authors[i]
      count = likes[i]
    } else {
      count += likes[i]
    }
  }
  if (count > 0) {
    likesOfAuthors.push({ author: current, likes: count })
  }

  likesOfAuthors.sort((a, b) => b.likes - a.likes)

  return likesOfAuthors[0]
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
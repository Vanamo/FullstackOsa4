const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')

const initialBlogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    __v: 0
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 1,
    __v: 0
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    __v: 0
  }
]

describe('when there are initially some blogs saved', async () => {
  beforeAll(async () => {
    await Blog.remove({})

    const blogObjects = initialBlogs.map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
  })

  test('all blogs are returned as json by GET /api/blogs', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api
      .get('/api/blogs')

    expect(response.body.length).toBe(initialBlogs.length)
  })

  test('a specific blog is within the returned blogs', async () => {
    const response = await api
      .get('/api/blogs')

    const authors = response.body.map(r => r.author)

    expect(authors).toContain('Michael Chan')
  })

  describe('addition of a new blog', async () => {

    test('POST /api/blogs succeeds with valid data', async () => {
      const blogsAtStart = await api
        .get('/api/blogs')

      const newBlog = {
        title: 'Testi',
        author: 'Testihenkilö',
        url: 'http://blogi.test',
        likes: 2
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAfterOperation = await api
        .get('/api/blogs')

      expect(blogsAfterOperation.body.length).toBe(blogsAtStart.body.length + 1)

      const titles = blogsAfterOperation.body.map(r => r.title)
      expect(titles).toContain('Testi')
    })

    test('POST /api/blogs with undefined likes will be set to zero', async () => {

      const blogsAtStart = await api
        .get('/api/blogs')

      const likesAtStart = blogsAtStart.body.map(blog => blog.likes)

      expect(likesAtStart).not.toContain(0)

      const newBlog = {
        title: 'No Likes Test',
        author: 'Testihenkilö',
        url: 'http://blogi.test',
        likes: undefined
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAfterOperation = await api
        .get('/api/blogs')

      const likes = blogsAfterOperation.body.map(r => r.likes)
      expect(likes).toContain(0)
    })

    test('POST /api/blogs with undefined title responds with statuscode 400', async () => {

      const newBlog = {
        title: undefined,
        author: 'Testihenkilö',
        url: 'http://blogi.test',
        likes: 1
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
    })

    test('POST /api/blogs with undefined url responds with statuscode 400', async () => {

      const newBlog = {
        title: 'Testi',
        author: 'Testihenkilö',
        url: undefined,
        likes: 1
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
    })
  })

  afterAll(() => {
    server.close()
  })

})
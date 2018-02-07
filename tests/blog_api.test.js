const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const { initialBlogs, blogsInDB, initialUsers, usersInDB } = require('./test_helper')



describe('when there are initially some blogs saved', async () => {
  beforeAll(async () => {
    await Blog.remove({})

    const blogObjects = initialBlogs.map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
  })

  test('all blogs are returned as json by GET /api/blogs', async () => {
    const blogsInDatabase = await blogsInDB()

    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.length).toBe(blogsInDatabase.length)

    const returnedTitles = response.body.map(b => b.title)
    blogsInDatabase.forEach(b => {
      expect(returnedTitles).toContain(b.title)
    })
  })

  test('a specific blog is within the returned blogs', async () => {
    const blogsInDatabase = await blogsInDB()
    const aBlog = blogsInDatabase[0]

    console.log('ablog id', aBlog.id)
    const response = await api
      .get(`/api/blogs/${aBlog.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.title).toBe(aBlog.title)
  })

  describe('addition of a new blog', async () => {

    test('POST /api/blogs succeeds with valid data', async () => {
      const blogsAtStart = await blogsInDB()

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

      const blogsAfterOperation = await blogsInDB()

      expect(blogsAfterOperation.length).toBe(blogsAtStart.length + 1)

      const titles = blogsAfterOperation.map(r => r.title)
      expect(titles).toContain('Testi')
    })

    test('POST /api/blogs with undefined likes will be set to zero', async () => {

      const blogsAtStart = await blogsInDB()

      const likesAtStart = blogsAtStart.map(blog => blog.likes)

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

      const blogsAfterOperation = await blogsInDB()

      const likes = blogsAfterOperation.map(r => r.likes)
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
    describe('deletion of a blog', async () => {
      let addedBlog

      beforeAll(async () => {
        addedBlog = new Blog({
          title: 'Poistotesti',
          author: 'Testihenkilö',
          url: 'http://blog.test',
          likes: 1
        })
        await addedBlog.save()
      })

      test('DELETE /api/blogs/:id succeeds with proper statuscode', async () => {
        const blogsAtStart = await blogsInDB()

        await api
          .delete(`/api/blogs/${addedBlog._id}`)
          .expect(204)

        const blogsAfterOperation = await blogsInDB()

        const titles = blogsAfterOperation.map(b => b.title)

        expect(titles).not.toContain(addedBlog.title)
        expect(blogsAfterOperation.length).toBe(blogsAtStart.length - 1)
      })
    })
  })
  describe('when there are initially some users saved', async () => {
    beforeAll(async () => {
      await User.remove({})

      const blogObjects = initialUsers.map(user => new User(user))
      const promiseArray = blogObjects.map(user => user.save())
      await Promise.all(promiseArray)
    })

    test('all users are returned as json by GET /api/blogs', async () => {
      const usersInDatabase = await usersInDB()

      const response = await api
        .get('/api/users')
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(response.body.length).toBe(usersInDatabase.length)

      const returnedNames = response.body.map(u => u.name)
      usersInDatabase.forEach(u => {
        expect(returnedNames).toContain(u.name)
      })
    })

    describe('addition of a new user', async () => {

      test('POST /api/users succeeds with a fresh username', async () => {
        const usersAtStart = await usersInDB()

        const newUser = {
          username: 'uusiHenkilö',
          name: 'Aivan Uusi',
          adult: true,
          password: 'erittainsalainen'
        }

        await api
          .post('/api/users')
          .send(newUser)
          .expect(201)
          .expect('Content-Type', /application\/json/)

        const usersAfterOperation = await usersInDB()

        expect(usersAfterOperation.length).toBe(usersAtStart.length + 1)

        const names = usersAfterOperation.map(u => u.name)
        expect(names).toContain(newUser.name)
      })

      test('POST /api/users with username less than 3 chars returns 400', async () => {
        const newUser = {
          username: 'ei',
          name: 'Liian Lyhyt',
          adult: true,
          password: 'hyvinsalainen'
        }

        await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
      })

      test('POST /api/users fails with proper statuscode and message if username asready exists', async () => {
        const usersBeforeOperation = await usersInDB()

        const newUser = {
          username: 'testaaja',
          name: 'Toinen Testaaja',
          adult: true,
          password: 'vaikea'
        }

        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)

        expect(result.body).toEqual({ error: 'username must be unique' })

        const usersAfterOperation = await usersInDB()
        expect(usersAfterOperation.length).toBe(usersBeforeOperation.length)
      })

      test('POST /api/users with undefined adult field will be set to true', async () => {

        const newUser = {
          username: 'aikuinen',
          name: 'Aki Aikuinen',
          adult: undefined,
          password: 'salattu'
        }

        await api
          .post('/api/users')
          .send(newUser)
          .expect(201)
          .expect('Content-Type', /application\/json/)

        const usersAfterOperation = await usersInDB()

        const addedUser = usersAfterOperation.find(u => u.username === newUser.username)
        expect(addedUser.adult).toBe(true)
      })
    })
  })

  afterAll(() => {
    server.close()
  })

})
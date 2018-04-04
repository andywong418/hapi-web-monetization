const Hapi = require('hapi')
const path = require('path')
const fs = require('fs-extra')

const server = Hapi.server({
  port: 8080,
  host: 'localhost'
})

const start = async () => {
  await server.register(require('inert'))
  await server.register(require('..'))
  
  server.route([
    {
      method: 'GET',
      path: '/',
      handler: function (request, reply) {
        return reply.file('./example/index.html')
      }
    },
    {
      method: 'GET',
      path: '/getMonetizationId',
      handler: function (request, reply) {
        return request.monetizer.generateAndStoreId(request, reply);
      }
    },
    {
      method: 'GET',
      path: '/pay/{id}',
      handler: function(request, reply) {
        return request.monetizer.receive(request, reply);
      }
    },
    {
      method: 'GET',
      path: '/content/',
      config: {

        handler: async function (request, reply) {
          request.monetizer.spend(100)
          await request.monetizer.awaitBalance(100)
          const file = await fs.readFile(path.resolve(__dirname, 'content.jpg'))
          return file
        }
      }
    },
    {
      method: 'GET',
      path: '/client.js',
      handler: async function (request, reply) {
        const clientFile = await fs.readFile(path.resolve(__dirname, '../client.js'))
        return reply.response(clientFile)
      }
    }
  ])

  await server.start()

  console.log('Server running at:', server.info.uri)
}

start()


<p align="center"><img alt="ϴ" src="http://i.imgur.com/GYry72P.png"></p>
<p align="center">
  <a href="https://circleci.com/gh/RobertWHurst/Theta"><img src="https://circleci.com/gh/RobertWHurst/Theta.svg?style=svg"></a>
</p>

ϴ (Theta) is a realtime server framework inspired by Koa and Express.

It allows users to build robust and well structured APIs over sockets rather
than HTTP, with the goal of enabling a new class of real time applications.
Theta support a range of transports including both TCP and WebSocket.

## Installation

Install via NPM or Yarn

For the server: 

```sh
yarn add @thetaapp/server
yarn add @thetaapp/server-transport-web-socket
```
or 
```sh
npm install @thetaapp/server --save
npm install @thetaapp/server-transport-web-socket --save
```

For the client: 

```sh
yarn add @thetaapp/client
yarn add @thetaapp/client-transport-web-socket
```
or 
```sh
npm install @thetaapp/client --save
npm install @thetaapp/client-transport-web-socket --save
```

## Getting Started

Creating a server is easy and similar to express or koa.

```js
// SERVER SIDE
const { theta } = require('@thetaapp/server')
const { webSocketTransport } = require('@thetaapp/server-transport-web-socket')

const server = theta()
server.transport(webSocketTransport({ port: 3000 }))

server.handle('/greet/:name', (ctx) => {
  ctx.send({ greeting: `Hello ${ctx.params.name}` })
})

server.listen()
```

To interact with our new server lets create a theta client
```js
// CLIENT SIDE
import { theta } from 'https://cdn.jsdelivr.net/npm/@thetaapp/client'
import { webSocketTransport } from 'https://cdn.jsdelivr.net/npm/@thetaapp/client-transport-web-socket'

const client = theta()
client.transport(webSocketTransport({ url: 'ws://localhost:3000' }))

client.connect()

client.send('/greet/Robert')

client.handle((data) => {
  console.log(data)
})
```

We should see the following in the console

```
{ "status": "ok", "greeting": "Hello Robert" }
```

# Going Beyond the Request Response Cycle

Web sockets enable us to have a proper back and forth with our client and server,
beyond what the HTTP request response cycle offers us. With theta it's possible
to have several messages passed and received in the same handler. In the
following example we will tweak our greet handler to fetch the name value
after the first message.

```js
// SERVER SIDE
const { theta } = require('@thetaapp/server')
const { webSocketTransport } = require('@thetaapp/server-transport-web-socket')

const server = theta()
server.transport(webSocketTransport({ port: 3000 }))

server.handle('/greet', async (ctx) => {

  ctx = await ctx.request({ message: 'What is your name?' })

  ctx.send({ message: `Hello ${ctx.data.name}` })
})

app.listen()
```

In this example we handle a client asking for a greeting. We then as the client
what is their name, after which we wait for the client to respond using the
name path. We then use our new context data to send the client our new greeting.

This could be a problem if the client never responds, but Theta handles this
with a timeout. If the timeout elapses the handle method on the context will
reject with a timeout error. We could catch this error, or allow it to propagate
to theta's router. If this happens an error handler will be invoked.


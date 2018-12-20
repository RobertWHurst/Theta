
![ϴ](http://i.imgur.com/GYry72P.png)

ϴ (Theta) is a webSocket server framework inspired by Koa and Express.

It allows users to build robust and well structured APIs over web socket rather
than HTTP, with the goal of enabling a new class of real time applications.

## Installation

Install via NPM or Yarn

```sh
yarn add theta-app
```
or 
```sh
npm install theta-app --save
```

## Getting Started

Creating a server is easy and similar to express

```js
// SERVER SIDE
const theta = require('theta-app')

const app = theta()

app.handle('/greet/:name', (ctx) => {
  ctx.send({ greeting: `Hello ${ctx.params.name}` })
})

app.listen(3000)
```

To interact with our new server create a websocket in the browser
```js
// CLIENT SIDE
const socket = new WebSocket('ws://localhost:3000')

socket.addEventListener('open', () => {
  const message = {
    path: '/greet/Robert'
  }

  socket.send(JSON.stringify(message))
})

socket.addEventListener('message', (e) => {
  console.log(e.data)
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
const theta = require('theta-app')

const app = theta()

app.handle('/greet', (ctx) => {

  ctx.send({ message: 'What is your name?' })

  ctx = await ctx.handle('/name')

  ctx.send({ message: `Hello ${ctx.data.name}` })
})

app.listen(3000)
```

In this example we handle a client asking for a greeting. We then as the client
what is their name, after which we wait for the client to respond using the
name path. We then use our new context data to send the client our new greeting.

This could be a problem if the client never responds, but Theta handles this
with a timeout. If the timeout elapses the handle method on the context will
reject with a timeout error. We could catch this error, or allow it to propagate
to theta's router. If this happens an error handler will be invoked.

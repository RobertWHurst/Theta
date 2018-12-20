
# ϴ

Theta is a webSocket server framework inspired by Koa and Express.

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

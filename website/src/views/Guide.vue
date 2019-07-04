<template lang="pug">
article.guide

  section
    h1#introduction Introduction
    p.
      Theta is a real-time framework for Node and the browser. It's inspired by
      frameworks such as #[a(href='https://expressjs.com/' target='_blank') express]
      and #[a(href='https://koajs.com/' target='_blank') koa]. It brings the
      concept of middleware and routing to realtime applications.
    p.
      Theta is designed to support persistent connection transports such as TCP
      and WebSocket. It also allows the use of any data format and supports JSON
      out of the box.
    p.
      Theta is programmed using TypeScript, and thus has full TypeScript support.
      That said, Theta will work to full capacity in a pure JavaScript
      environment too.

  section
    h1#getting-started Getting Started
    p.
      Getting started with Theta is easy. To get started add Theta to your
      server project using npm.
    example(v-slot:sh="").
      npm i @thetaapp/server
    p.
      You will also need a transport. For this example we recommend the web
      socket transport. If you plan on allowing non browser application to
      connect to your server, you should add the TCP transport as well.
    example(v-slot:sh="").
      npm i @thetaapp/server-transport-web-socket
    p.
      Now the fun part. Let's setup our server.
    example
      template(v-slot:ts="").
        import { theta } from '@thetaapp/server'
        import { webSocketTransport } from '@thetaapp/server-transport-web-socket'

        const server = theta()
        server.transport(webSocketTransport({ port: 8000 }))

        server.listen()
      template(v-slot:js="").
        const { theta } = require('@thetaapp/server')
        const { webSocketTransport } = require('@thetaapp/server-transport-web-socket')

        const server = theta()
        server.transport(webSocketTransport({ port: 8000 }))

        server.listen()
    p.
      Now that we have a server with web socket support, let's add our first
      handler.
    
    example
      template(v-slot:ts="").
        import { theta } from '@thetaapp/server'
        import { webSocketTransport } from '@thetaapp/server-transport-web-socket'

        const server = theta()
        server.transport(webSocketTransport({ port: 8000 }))

        server.handle((ctx) => { ctx.send('hello world') })

        server.listen()
      template(v-slot:js="").
        const { theta } = require('@thetaapp/server')
        const { webSocketTransport } = require('@thetaapp/server-transport-web-socket')

        const server = theta()
        server.transport(webSocketTransport({ port: 8000 }))

        server.handle((ctx) => { ctx.send('hello world') })

        server.listen()

    p.
      The server above can now accept web socket connections and messages.
      When a message is recieved the server will respond with a message
      containing a string data property containing 'hello world'.
    
    p.
      This is a good start, but what about the client side? Let's put together
      a basic client.
    
    example
      template(v-slot:ts="").
        import { theta } from '@thetaapp/client'
        import { webSocketTransport } from '@thetaapp/client-transport-web-socket'

        const client = theta()
        client.transport(webSocketTransport({ url: 'ws://localhost:8000' }))
        client.connect()

        client.request('', (ctx) => { console.log(ctx.data) })
      template(v-slot:js="").
        const { theta } = require('@thetaapp/client')
        const { webSocketTransport } = require('@thetaapp/client-transport-web-socket')

        const client = theta()
        client.transport(webSocketTransport({ url: 'ws://localhost:8000' }))
        client.connect()

        client.request('', (ctx) => { console.log(ctx.data) })

    p.
      As you can see above, Theta's client is very similar to the theta server.
      Here we are creating a client, connecting, then sending a request. Our
      server will then respond with the message 'hello world', so in our
      console we should see, hello world.

  section
    h1#routing Introduction to Routing

    p.
      So far we've gone over how to create a server and client, but we haven't
      investigated routing.

    p.
      WIP
    
  section
    h1#project-structure Project Structure

    p.
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
      Aliquam laoreet magna vel sem fringilla, sit amet eleifend 
      elit fringilla. Nam sagittis ante tellus, vel ornare metus 
      cursus id. Pellentesque convallis interdum cursus. Aenean 
      id sem commodo, tempor nisi at, congue ante. Morbi id 
      arcu non sem lobortis finibus. Vestibulum in orci non 
      eros imperdiet pulvinar non non diam. Suspendisse quis 
      eros eget orci malesuada bibendum id sed felis. 

  section
    h1#routing Routing

    p.
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
      Aliquam laoreet magna vel sem fringilla, sit amet eleifend 
      elit fringilla. Nam sagittis ante tellus, vel ornare metus 
      cursus id. Pellentesque convallis interdum cursus. Aenean 
      id sem commodo, tempor nisi at, congue ante. Morbi id 
      arcu non sem lobortis finibus. Vestibulum in orci non 
      eros imperdiet pulvinar non non diam. Suspendisse quis 
      eros eget orci malesuada bibendum id sed felis. 

  section
    h1#middleware Middleware

    p.
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
      Aliquam laoreet magna vel sem fringilla, sit amet eleifend 
      elit fringilla. Nam sagittis ante tellus, vel ornare metus 
      cursus id. Pellentesque convallis interdum cursus. Aenean 
      id sem commodo, tempor nisi at, congue ante. Morbi id 
      arcu non sem lobortis finibus. Vestibulum in orci non 
      eros imperdiet pulvinar non non diam. Suspendisse quis 
      eros eget orci malesuada bibendum id sed felis. 

  section
    h1#transports Transports

    p.
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
      Aliquam laoreet magna vel sem fringilla, sit amet eleifend 
      elit fringilla. Nam sagittis ante tellus, vel ornare metus 
      cursus id. Pellentesque convallis interdum cursus. Aenean 
      id sem commodo, tempor nisi at, congue ante. Morbi id 
      arcu non sem lobortis finibus. Vestibulum in orci non 
      eros imperdiet pulvinar non non diam. Suspendisse quis 
      eros eget orci malesuada bibendum id sed felis. 

  section
    h1#encoding Encoding

    p.
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
      Aliquam laoreet magna vel sem fringilla, sit amet eleifend 
      elit fringilla. Nam sagittis ante tellus, vel ornare metus 
      cursus id. Pellentesque convallis interdum cursus. Aenean 
      id sem commodo, tempor nisi at, congue ante. Morbi id 
      arcu non sem lobortis finibus. Vestibulum in orci non 
      eros imperdiet pulvinar non non diam. Suspendisse quis 
      eros eget orci malesuada bibendum id sed felis. 

</template>

<script lang="ts">
import Vue from 'vue'
import Example from '../components/Example.vue'

export default Vue.extend({
  components: {
    Example
  }
})
</script>


<style lang="stylus" scoped>
.guide
  h1
    font-size 3.6rem
  p
    font-size 2rem
</style>

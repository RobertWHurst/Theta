<template lang="pug">
.api-view

  h1#server Server{}

  example new Server(config: Config)

  p.
    Server the heart of Theta. It recieves incomming connections from Theta
    #[a(href="#client") Client] objects. It contains the
    #[a(href="#encoder") Encoder], transports, a router, and a socket manager.

  h2#server-encoder .encoder()

  example server.encoder(encoder: Encoder)

  p.
    Sets the encoder to use with the Server. The encoder is responsible for
    the data format used for transport. It's responsible for encoding and
    decoding, as well as classification and formatting. For more information
    see the #[a(href="#encoder") Encoder] documentation.

  h2#server-transport .transport()

  example server.transport(transport: Transport)

  h2#server-transport .removeTransport()

  example server.removeTransport(transport: Transport)

  h2#server-listen .listen()

  example server.listen() -> Promise[void]

  h2#server-close .close()

  example server.close() -> Promise[void]

  h2#server-handle .handle()

  example server.handle(handler: Handler)

  h2#server-handleError .handleError()

  example server.handleError(handler: Handler)

  p.
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
    Aliquam laoreet magna vel sem fringilla, sit amet eleifend 
    elit fringilla. Nam sagittis ante tellus, vel ornare metus 
    cursus id. Pellentesque convallis interdum cursus. Aenean 
    id sem commodo, tempor nisi at, congue ante. Morbi id 
    arcu non sem lobortis finibus. Vestibulum in orci non 
    eros imperdiet pulvinar non non diam. Suspendisse quis 
    eros eget orci malesuada bibendum id sed felis.

  h1#client Client{}

  

  h1#context Context{}

</template>

<style lang="stylus" scoped>
.api-view
  display flex
  flex 1
  flex-direction column
</style>

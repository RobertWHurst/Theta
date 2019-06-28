<template lang="pug">
.sidebar-component
  nav
    ul
      li
        router-link(:to="{ name: 'guide' }") Guide
        ul
          li
            router-link(:to="{ name: 'guide', hash: '#getting-started' }") Getting Started
          li
            router-link(:to="{ name: 'guide', hash: '#project-structure' }") Project Structure
          li
            router-link(:to="{ name: 'guide', hash: '#routing' }") Routing
          li
            router-link(:to="{ name: 'guide', hash: '#middleware' }") Middleware
          li
            router-link(:to="{ name: 'guide', hash: '#transports' }") Transports
          li
            router-link(:to="{ name: 'guide', hash: '#encoding' }") Encoding
      li
        router-link(:to="{ name: 'api' }") API
        ul
          li
            router-link(:to="{ name: 'api', hash: '#server' }") Server
            ul
              li
                router-link(:to="{ name: 'api', hash: '#server-encoder' }") encoder
              li
                router-link(:to="{ name: 'api', hash: '#server-transport' }") transport
              li
                router-link(:to="{ name: 'api', hash: '#server-listen' }") listen
              li
                router-link(:to="{ name: 'api', hash: '#server-close' }") close
              li
                router-link(:to="{ name: 'api', hash: '#server-handle' }") handle
              li
                router-link(:to="{ name: 'api', hash: '#server-handleError' }") handleError
          li
            span Client
            ul
              li
                router-link(:to="{ name: 'api', hash: '#client-encoder' }") encoder
              li
                router-link(:to="{ name: 'api', hash: '#client-transport' }") transport
              li
                router-link(:to="{ name: 'api', hash: '#client-connect' }") connect
              li
                router-link(:to="{ name: '', hash: '#client-disconnect' }") disconnect
              li
                router-link(:to="{ name: '', hash: '#client-request' }") request
              li
                router-link(:to="{ name: '', hash: '#client-handle' }") handle
              li
                router-link(:to="{ name: '', hash: '#client-handleError' }") handleError
          li
            router-link(:to="{ name: 'api', hash: '#context' }") Context
            ul
              li
                router-link(:to="{ name: 'api', hash: '#context-message' }") message
              li
                router-link(:to="{ name: 'api', hash: '#context-socket' }") socket
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  data: () => ({
    accordion: [],
  })
})
</script>

<style lang="stylus" scoped>
.sidebar-component
  display flex
  padding 1rem 2rem

  ul
    padding-left 1rem
    padding-bottom 2rem
</style>

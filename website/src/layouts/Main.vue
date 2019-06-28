<template lang="pug">
.main-layout
  transition(mode="out-in")
    router-view.view
  .sidebar-container
    transition(appear=true mode="out-in")
      sidebar
</template>

<script lang="ts">
import Vue from 'vue'
import Sidebar from '../components/Sidebar.vue'

export default Vue.extend({
  components: {
    Sidebar
  }
})
</script>

<style lang="stylus" scoped>
.main-layout
  display flex
  flex 1

  .view
    padding 4rem 20rem 4rem 8rem

    &.v-enter-active
      transition-property top opacity
      transition-duration 300ms
      transition-timing-function cubic-bezier(0.420, 0.000, 0.580, 1.000)
      position relative
      top 0
      opacity 1

    &.v-enter
      top -2rem
      opacity 0

    &.v-leave-to
      top 2rem
      opacity 0

  .sidebar-container
    position fixed
    display flex
    flex-direction column
    overflow hidden
    right 0
    top 0
    bottom 0
    justify-content center

    .sidebar-component
      position relative
      transition-property right opacity
      transition-delay 0.8s
      transition-duration 1s
      transition-timing-function cubic-bezier(0.190, 1.000, 0.220, 1.000)
      opacity 1
      right 0

      &.v-enter
        opacity 0
        right -10rem
</style>

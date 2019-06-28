<template lang="pug">
.landing-view
  img(src="../images/theta-logo.png")
  transition(appear=true)
    em The real-time framework
</template>

<style lang="stylus" scoped>
.landing-view
  display flex
  flex 1
  flex-direction column
  justify-content center
  align-items center

  em
    position relative
    font-size 1.8rem
    line-height 8rem
    transition-property top opacity
    transition-duration 1s
    transition-delay 0.4s
    transition-timing-function cubic-bezier(0.190, 1.000, 0.220, 1.000)
    opacity 1
    top 0

    &.v-enter
      opacity 0
      top -3rem
</style>

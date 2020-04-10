<template lang="pug">
.landing-view
  .wrap
    .logo Θ
    transition(appear=true)
      em The real-time framework
  .wrap
    transition(appear=true)
      .text Theta
</template>

<style lang="stylus" scoped>
.landing-view
  flex 1 1 0
  min-height 0

  .wrap
    position absolute
    top 0
    bottom 0
    right 0
    left 0
    display flex
    flex-direction column
    justify-content center
    align-items center
    line-height 1
    pointer-events none

    em
      pointer-events auto

    .logo
      font-size 50rem

    .text
      position relative
      font-size 3rem
      font-weight 100
      top -4.2rem
      color #fff
      pointer-events auto
      text-transform uppercase
      transition-property opacity
      transition-duration 2s
      transition-delay .8s
      transition-timing-function cubic-bezier(0.190, 1.000, 0.220, 1.000)
      opacity 1

      &.v-enter
        opacity 0

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

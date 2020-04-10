<template lang="pug">
.example
  pre(ref="pre", :class="languageClass")
    code(v-html="code")
  .tabs(v-if="tabs.length > 1")
    .tab(v-for="tab in tabs" @click="slotId = tab.id") {{tab.name}}
</template>

<script lang="ts">
import Vue from 'vue'
import Prism from 'prismjs'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-typescript'

type Lang = { name: string, prism?: { language: string, grammar: any } }
type Langs = { [s: string]: Lang }
type Tabs = ({ id: string } & Lang)[]

const langs: Langs = {
  ts: { name: 'TypeScript', prism: { language: 'typescript', grammar: Prism.languages.javascript } },
  js: { name: 'JavaScript', prism: { language: 'javascript', grammar: Prism.languages.typescript } },
  sh: { name: 'Shell', prism: { language: 'bash', grammar: Prism.languages.bash } }
}


export default Vue.extend({
  data: () => ({
    slotId: '',
    langs
  }),
  computed: {
    tabs(): Tabs {
      const tabs: Tabs = []
      for (const langId in this.langs) {
        this.$slots[langId] && tabs.push({ id: langId, ...this.langs[langId] })
      }
      return tabs
    },
    lang(): Lang {
      return this.langs[this.slotId] || {}
    },
    languageClass(): string {
      return this.lang.prism
        ? `language-${this.lang.prism.language}`
        : ''
    },
    code(): string {
      const slotContent =
        this.$slots[this.slotId] &&
        this.$slots[this.slotId]![0] &&
        this.$slots[this.slotId]![0].text
      if (!slotContent) {
        return ''
      }
      if (!this.lang.prism) {
        return slotContent
      }
      return Prism.highlight(slotContent, this.lang.prism.grammar, this.lang.prism.language)
    }
  },
  mounted() {
    this.slotId = this.tabs[0].id
  }
})
</script>

<style lang="stylus" scoped>
.tabs
  display flex
  justify-content right

  .tab
    padding 0 2rem 1rem
</style>

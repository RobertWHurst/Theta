import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './index.vue'
import Router from './router'

import 'vue-code-highlight/themes/prism-twilight.css'
import './index.styl'

Vue.use(VueRouter)

App.router = new VueRouter(Router)
const app = new Vue(App)

app.$mount('#app')

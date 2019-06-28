import scrollIntoView from 'scroll-into-view-if-needed'

import MainLayout from './layouts/Main.vue'
import MainView from './views/Main.vue'
import GuideView from './views/Guide.vue'
import ApiView from './views/Api.vue'

export default {
  mode: 'history',
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          name: 'main',
          path: '/',
          component: MainView
        },
        {
          name: 'guide',
          path: '/guide',
          component: GuideView
        },
        {
          name: 'api',
          path: '/api',
          component: ApiView
        },
        {
          path: '/*',
          redirect: { name: 'main' }
        }
      ]
    }
  ],
  async scrollBehavior({ hash }: { hash: string }) {
    if (!hash) {
      return
    }
    await new Promise(r => {
      setTimeout(r, 200)
    })
    const node = document.querySelector(hash)
    if (!node) {
      return
    }

    scrollIntoView(node, {
      behavior: 'smooth',
      scrollMode: 'if-needed'
    })

    for (let i = 0; i < 3; i += 1) {
      node.classList.add('flash')
      await waitForTransition(node)
      node.classList.remove('flash')
      await waitForTransition(node)
    }
  }
}

async function waitForTransition(node: Element) {
  return new Promise(resolve => {
    const handleTransitionEnd = () => {
      node.removeEventListener('transitionend', handleTransitionEnd)
      resolve()
    }
    node.addEventListener('transitionend', handleTransitionEnd)
  })
}

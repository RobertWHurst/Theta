import '@babel/polyfill'
import { theta } from '@thetaapp/client'
import { webSocketTransport } from '@thetaapp/client-transport-web-socket'

const app = theta()

app.transport(webSocketTransport({ url: 'ws://localhost:8182' }))

void app.connect()

window.app = app

window.sayHello = () => {
  void app.request('/hello', {
    message: 'Client: Hi there!'
  }, async (ctx) => {
    console.log(1, ctx.data.data)

    ctx = await ctx.request({
      message: 'Client: How are you?'
    })

    console.log(2, ctx.data.data)

    ctx.end()
  })
}

const s = Date.now()
const l = 100
let ii = l
const checkDone = () => {
  ii -= 1
  const d = Date.now() - s
  if (ii === 0) { console.log(d / l) }
}

for (let i = 0; i < l; i += 1) {
  void app.request('/ping', checkDone)
}

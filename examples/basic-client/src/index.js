import '@babel/polyfill'
import { theta } from '@thetaapp/client'
import { webSocketTransport } from '@thetaapp/client-transport-web-socket'

const app = theta();

app.transport(webSocketTransport({ url: 'ws://localhost:8182' }));

app.connect();

window.sayHello = () => {
  app.request('/hello', {
    message: 'Client: Hi there!'
  }, async (ctx) => {

    console.log(1, ctx.data.data);
    
    ctx = await ctx.request({
      message: 'Client: How are you?'
    })

    console.log(2, ctx.data.data);

    ctx.end()
  });
}

const pingHandler = () => {
  setTimeout(rec, 0)
}
const rec = () => {
  app.request('/ping', pingHandler)
}
rec()

import '@babel/polyfill'
import { theta } from '@thetaapp/client'
import { webSocketTransport } from '@thetaapp/client-transport-web-socket'

const app = theta();

app.transport(webSocketTransport({ url: 'ws://localhost:8182' }));

app.connect();

window.app = app;

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

let start = Date.now()
let i = 0;

window.rps = () => {
  console.log(Math.round(i / ((Date.now() - start) / 1000)))
  if (i > 10000) {
    start = Date.now()
    i = 0
  }
}

const rec = () => {
  i += 1;
  app.request('/ping', () => rec())
}
rec()

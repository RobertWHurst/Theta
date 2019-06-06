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

const s = Date.now()
const l = 100;
let ii = l;
const checkDone = () => {
  ii -= 1
  if (ii === 0) { console.log((l / ((Date.now() - s) / 1000))) }
}

for (let i = 0; i < l; i += 1) {
  app.request('/ping', checkDone)
}

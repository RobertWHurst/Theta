import '@babel/polyfill'
import { theta } from '@thetaapp/client'
import { webSocketTransport } from '@thetaapp/client-transport-web-socket'

const app = theta();

app.transport(webSocketTransport({ url: 'ws://localhost:8182' }));

app.connect();

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

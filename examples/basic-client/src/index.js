import '@babel/polyfill'
import { theta } from '@thetaapp/client'
import { webSocketTransport } from '@thetaapp/client-transport-web-socket'

const app = theta();

app.transport(webSocketTransport({ url: 'ws://localhost:8182' }));

app.connect();

app.request('/hello', {
  message: 'Hi there!'
}, async (ctx) => {
  console.log(ctx.message);
});

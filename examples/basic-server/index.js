const { theta } = require('@thetaapp/server');
const { webSocketTransport } = require('@thetaapp/server-transport-web-socket');

const app = theta();

app.transport(webSocketTransport({ port: 8182 }));

app.handle('/hello', async (ctx) => {
  console.log(-1, ctx.data.data);
  ctx = await ctx.request({ message: 'Server: oh hello!' })

  console.log(-2, ctx.data.data);
  ctx = await ctx.reply({ message: 'Server: Doing good thanks' })
});

app.handle('/ping', (ctx) => {
  ctx.reply({ pong: true })
})

console.log('listening on port 8182')
app.listen();

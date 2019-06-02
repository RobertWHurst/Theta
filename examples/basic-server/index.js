const { theta } = require('@thetaapp/server');
const { webSocketTransport } = require('@thetaapp/server-transport-web-socket');

const app = theta();

app.transport(webSocketTransport({ port: 8182 }));

app.handle('/hello', (ctx) => {
  console.log(ctx.data);
  ctx.reply({ message: 'oh hello!' })
});

console.log('listening on port 8182')
app.listen();

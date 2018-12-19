import fs from 'fs'
import http from 'http'
import theta from '../'

const server = http.createServer()

server.on('request', (req, res) => {
  if (req.url === '/') {
    const readStream = fs.createReadStream('index.html')
    readStream.pipe(res)
    return
  }
})

const app = theta({ server })

app.handle('foo', async (ctx) => {
  console.log('before res')
  await ctx.next()
  console.log('after res')
})

app.handle('foo', async (ctx) => {
  console.log('sending hi from foo')
  await ctx.send('hi')
  console.log('waiting for bar')
  ctx = await ctx.handle('bar')
  console.log('got bar back')
  console.log('sending baz')
  await ctx.send('baz')
})

app.handle('bar', () => {
  throw new Error('shouldn\'t be here')
})

app.listen(9000)

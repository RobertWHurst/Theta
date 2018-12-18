import theta from '../'

const app = theta()

app.handle('foo', (ctx) => ctx.next())
app.handle('foo', () => { console.log('foo') })

app.listen(9000)

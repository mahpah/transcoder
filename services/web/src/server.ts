import * as Koa from 'koa'
import * as cors from 'kcors'
import * as bodyParser from 'koa-body'
import * as views from 'koa-views'
import { join } from 'path'
import router from './routes'

const app = new Koa()

app.use(cors())
app.use(bodyParser({
  multipart: true
}))
app.use(views(join(__dirname, 'views')))

app.use(router.routes())
app.use(router.allowedMethods())

export default app

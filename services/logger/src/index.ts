import { createLogger } from './logger'
import Config from '@mahpah/configuration'

const toUpper = (str?: string) => str ? str.toUpperCase() : null

const rabbitConnectionString = Config.rabbitConnectionString || 'amqp://localhost'

createLogger(rabbitConnectionString, {
  '#': (msg, key) => console.log(`${new Date()} [${toUpper(key) || '*'}] ${msg}`)
})
.then((queue: string) => {
  console.log(`Connected to ${rabbitConnectionString}`)
  console.log(`QUEUE: ${queue}\n`)
})
.catch(console.error)

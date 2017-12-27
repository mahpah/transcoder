import { createLogger } from './logger'
import Config from '@mahpah/configuration'
import * as moment from 'moment'

const toUpper = (str?: string) => str ? str.toUpperCase() : null

const rabbitConnectionString = Config.rabbitConnectionString || 'amqp://localhost'

const timestamp = () => moment().format('DD/MM/YYYY HH:mm:ss')

createLogger(rabbitConnectionString, {
  '#': (msg, key) => console.log(`${timestamp()} [${toUpper(key) || '*'}] ${msg}`)
})
.then((queue: string) => {
  console.log(`Successfully connected to ${rabbitConnectionString}`)
  console.log(`QUEUE: ${queue}\n`)
})
.catch(console.error)

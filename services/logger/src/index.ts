import { createLogger } from './logger'
import Config from './lib/configuration'

const toUpper = (str?: string) => str ? str.toUpperCase() : null

createLogger(Config.rabbitConnectionString, {
  '#': (msg, key) => console.log(`${new Date()} [${toUpper(key) || '*'}] ${msg}`)
}).catch(console.error)

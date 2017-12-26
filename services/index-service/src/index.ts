import Config from '@mahpah/configuration'
import { createLogger } from './logger'

const startApp = async () => {
  const logger = await createLogger(Config.rabbitConnectionString, Config.appName)
  logger.info('connected')
  console.log('connected')

  process.on('SIGINT', () => {
    console.log('exit')
    logger.info('exited')
  })
}

startApp().then(() => {
  console.log('Indexer connected')
}).catch(console.error)

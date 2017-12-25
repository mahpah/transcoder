import { createLogger } from './logger'
import Config from '@mahpah/configuration'

const startApp = async () => {
  const logger = await createLogger(Config.rabbitConnectionString, 'dasher')
  logger.info('connected')

  process.on('beforeExit', () => {
    logger.info('exited')
  })
}

startApp().catch(console.error)

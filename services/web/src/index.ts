import app from './server'
import { connect, Channel } from 'amqplib'
import Config from '@mahpah/configuration'
import { createLogger, Logger } from './lib/logger'
import { unlinkSync } from 'fs'
import { join } from 'path';

const EXCHANGE = 'video'
const QUEUE = 'media'

const listenQueue = async (channel: Channel, logger: Logger) => {
  await channel.assertExchange(EXCHANGE, 'topic', { durable: true })
  await channel.assertQueue(QUEUE, { durable: true, exclusive: false, autoDelete: false, arguments: null })
  await channel.bindQueue(QUEUE, EXCHANGE, 'video.processed')

  channel.consume(QUEUE, (msg) => {
    if (!msg) {
      return
    }
    const routingKey = msg.fields.routingKey

    switch (routingKey) {
      case 'video.processed':
        try {
          const content = msg.content.toString()
          const data = JSON.parse(content)
          unlinkSync(join(Config.storagePath, data.originName))
        } catch (e) {
          logger.error(JSON.stringify(e))
        }
        break;

      default:
        break;
    }
  }, { noAck: false})
}

const prepare = async () => {
  const connection = await connect(Config.rabbitConnectionString)
  const logger = await createLogger(connection, 'web')
  logger.info('started')
  app.context.logger = logger

  const channel = await connection.createChannel()
  app.context.videoChannel = channel

  await listenQueue(channel, logger)

  app.listen(3333, () => {
    console.log('server started')
  })

  process.on('SIGINT', () => {
    logger.info('exited')
    setTimeout(() => {
      connection.close()
      process.exit()
    }, 500);
  })
}

prepare().catch(console.error)

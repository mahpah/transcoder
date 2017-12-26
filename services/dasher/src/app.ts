import { createLogger, Logger } from './logger'
import Config from '@mahpah/configuration'
import { connect, Channel, Message, Connection } from 'amqplib'
import { execute } from './dashify'
import { delay } from './utils';

const QUEUE = 'media'
const EXCHANGE = 'video'

const onVideoUploaded = (channel: Channel, logger: Logger) => async (msg: Message) => {
  const filePath = msg.content.toString()
  logger.info(`process file ${filePath}`)
  let created: any
  try {
    created = await execute(filePath)
    channel.publish(EXCHANGE, 'video.processed', new Buffer(JSON.stringify(created)))
    logger.info(`file ${filePath} processed successfully`)
  } catch (e) {
    logger.error(JSON.stringify(e))
  }
}

const listenQueue = async (connection: Connection, logger: Logger) => {
  const channel = await connection.createChannel()
  channel.assertQueue(QUEUE, { durable: true, exclusive: false, autoDelete: false, arguments: null })
  channel.assertExchange(EXCHANGE, 'topic', { durable: true })
  channel.prefetch(1)
  channel.bindQueue(QUEUE, EXCHANGE, 'video.uploaded')

  channel.consume(QUEUE, async (msg) => {
    if (!msg) {
      return
    }

    const routingKey = msg.fields.routingKey
    switch (routingKey) {
      case 'video.uploaded':
        await onVideoUploaded(channel, logger)(msg)
        break;

      default:
        break;
    }

    channel.ack(msg)
  }, { noAck: false })
}

export const startWorker = async () => {
  const connection = await connect(Config.rabbitConnectionString)
  const logger = await createLogger(connection, `dasher-${process.pid}`)
  await listenQueue(connection, logger)
  logger.info(`dash worker ${process.pid} is connected`)

  process.on('SIGINT', () => {
    logger.info(`dash worker ${process.pid} is exited`)
    delay(500)
      .then(connection.close.bind(connection))
      .then(() => {
        process.exit()
      })
  })
}

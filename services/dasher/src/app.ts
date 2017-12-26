import { createLogger, Logger } from './logger'
import Config from '@mahpah/configuration'
import { connect, Channel, Message, Connection } from 'amqplib'
import { execute } from './dashify'
import { delay } from './utils';
import { join } from 'path'

const QUEUE = 'media'
const EXCHANGE = 'video'

const onVideoUploaded = (channel: Channel, logger: Logger) => async (msg: Message) => {
  const fileName = msg.content.toString()
  console.log(process.pid, fileName)
  logger.info(`process file ${fileName}`)
  const filePath = join(Config.storagePath, fileName)
  try {
    const created: any = await execute(filePath)
    created.originName = fileName
    channel.publish(EXCHANGE, 'video.processed', new Buffer(JSON.stringify(created)))
    logger.info(`file ${fileName} processed successfully, \n ${JSON.stringify(created, null, 2)}`)
  } catch (e) {
    channel.publish(EXCHANGE, 'video.processed', new Buffer(JSON.stringify({
      originName: fileName
    })))
    logger.error(JSON.stringify(e))
  }
}

const listenQueue = async (connection: Connection, logger: Logger) => {
  const channel = await connection.createChannel()
  channel.assertQueue(QUEUE, { durable: true, exclusive: false, autoDelete: false, arguments: null })
  channel.assertExchange(EXCHANGE, 'topic', { durable: true })
  channel.prefetch(1)
  channel.bindQueue(QUEUE, EXCHANGE, 'video.uploaded')
  channel.bindQueue(QUEUE, EXCHANGE, 'video.processed')

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

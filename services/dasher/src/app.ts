import { createLogger, Logger } from './utils/logger'
import Config from '@mahpah/configuration'
import { connect, Channel, Message } from 'amqplib'
import { execute } from './dashify'
import { delay } from './utils';
import { join } from 'path'
import { createIndexer, Indexer } from './utils/indexer';

const VIDEO_PROCESSING = 'video_processing'
const EXCHANGE = 'video'

const onVideoUploaded = async (channel: Channel, logger: Logger, indexer: Indexer, msg: Message) => {
  const fileName = msg.content.toString()
  console.log(process.pid, fileName)
  logger.info(`[start] ${fileName}`)
  const filePath = join(Config.storagePath, fileName)
  try {
    const created: any = await execute(filePath)
    created.originName = fileName
    channel.publish(EXCHANGE, 'video.processed', new Buffer(JSON.stringify(created)))
    indexer.index('update', created)
    logger.info(`[OK] ${fileName} \nOUTPUT: ${created.path}`)
  } catch (e) {
    channel.publish(EXCHANGE, 'video.processed', new Buffer(JSON.stringify({
      originName: fileName
    })))
    logger.error(JSON.stringify(e))
  }
}

const listenQueue = async (channel: Channel, logger: Logger, indexer: Indexer) => {
  channel.assertQueue(VIDEO_PROCESSING, { durable: true, exclusive: false, autoDelete: false, arguments: null })
  channel.prefetch(1)

  channel.consume(VIDEO_PROCESSING, async (msg) => {
    if (!msg) {
      return
    }
    await onVideoUploaded(channel, logger, indexer, msg)
    channel.ack(msg)
  }, { noAck: false })
}

export const startWorker = async () => {
  const connection = await connect(Config.rabbitConnectionString)
  const channel = await connection.createChannel()
  const logger = await createLogger(channel, `dasher-${process.pid}`)
  const indexer = await createIndexer(channel)
  await listenQueue(channel, logger, indexer)
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

import { createLogger } from './logger'
import Config from '@mahpah/configuration'
import { connect } from 'amqplib'
import { execute } from './dashify'

const startQueue = async () => {
  const QUEUE = 'video-processing'
  const connection = await connect(Config.rabbitConnectionString)
  const channel = await connection.createChannel()
  channel.assertQueue(QUEUE, { durable: true, exclusive: false, autoDelete: false, arguments: null })
  channel.prefetch(1)

  channel.consume(QUEUE, async (msg) => {
    if (!msg) {
      return
    }

    const filePath = msg.content.toString()
    const created = await execute(filePath)
    msg.content = new Buffer(JSON.stringify(created))
    channel.ack(msg)
  }, { noAck: false })
}

const startApp = async () => {
  const logger = await createLogger(Config.rabbitConnectionString, 'dasher')
  await startQueue()
  logger.info('connected')

  process.on('beforeExit', () => {
    logger.info('exited')
  })
}

startApp().catch(console.error)

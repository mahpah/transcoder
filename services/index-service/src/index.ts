import Config from '@mahpah/configuration'
import { createLogger } from './logger'
import { connect } from 'amqplib';

const INDEXER_EXCHANGE = 'indexer'
const QUEUE = 'indecies'

const startApp = async () => {
  const connection = await connect(Config.rabbitConnectionString)
  const channel = await connection.createChannel()

  await channel.assertExchange(INDEXER_EXCHANGE, 'direct', { durable: true })
  await channel.assertQueue(QUEUE, { durable: true, exclusive: true, autoDelete: false })
  channel.bindQueue(QUEUE, INDEXER_EXCHANGE, 'create')
  channel.bindQueue(QUEUE, INDEXER_EXCHANGE, 'update')
  channel.bindQueue(QUEUE, INDEXER_EXCHANGE, 'delete')

  channel.consume(QUEUE, (msg) => {
    if (!msg) {
      return
    }

    const action = msg.fields.routingKey
    console.log(`[${action}] ${msg.content.toString()}`)
    channel.ack(msg)
  }, { noAck: false })

  const logger = await createLogger(channel, Config.appName)
  logger.info('connected')
  console.log('connected')

  process.on('SIGINT', () => {
    console.log('exit')
    logger.info('exited')
    process.exit()
  })
}

startApp().then(() => {
  console.log('Indexer connected')
}).catch(console.error)

import * as amqp from 'amqplib'

export type LogHandler = (msg: string, routingKey?: string) => void

export type LogConfig = {
  [serverity: string]: LogHandler
}

export const createLogger = async (connectionString: string, configs: LogConfig) => {
  const EXCHANGE_NAME = 'logs'

  const connection = await amqp.connect(connectionString)
  const channel = await connection.createChannel()
  await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: false })
  const logQueue = await channel.assertQueue('', { durable: false, exclusive: true })

  Object.keys(configs).forEach(async (severity) => {
    const handler = configs[severity]

    if (typeof handler !== 'function') {
      return
    }

    await channel.bindQueue(logQueue.queue, EXCHANGE_NAME, severity)
    await channel.consume(logQueue.queue, (msg) => {
      if (!msg) {
        return
      }

      handler(msg.content.toString(), msg.fields.routingKey)
    }, { noAck: true })
  })
}

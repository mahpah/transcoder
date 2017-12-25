import { connect } from 'amqplib'

export const createLogger = async (connectionString: string, topic: string) => {
  const EXCHANGE = 'logs'

  const connection = await connect(connectionString)
  const channel = await connection.createChannel()
  channel.assertExchange(EXCHANGE, 'topic', { durable: false })

  const log = (level: string) => (message: string) =>
    channel.publish(EXCHANGE, `${topic}.${level}`, new Buffer(message))

  return {
    info: log('info'),
    warning: log('warning'),
    error: log('error'),
  }
}

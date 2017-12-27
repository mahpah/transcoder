import { Connection, Channel } from 'amqplib'

export const createLogger = async (channel: Channel, topic: Connection) => {
  const EXCHANGE = 'logs'
  channel.assertExchange(EXCHANGE, 'topic', { durable: false })

  const log = (level: string) => (message: string) =>
    channel.publish(EXCHANGE, `${topic}.${level}`, new Buffer(message))

  return {
    info: log('info'),
    warning: log('warning'),
    error: log('error'),
  }
}

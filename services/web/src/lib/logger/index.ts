import { Channel } from 'amqplib'

export type Logger = {
  info: (t: string) => void
  warning: (t: string) => void
  error: (t: string) => void
}

export const createLogger = async (channel: Channel, topic: string) : Promise<Logger> => {
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

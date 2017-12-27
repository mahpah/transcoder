import { Channel } from 'amqplib'

export type Indexer = {
  index: (action: string, data: any) => void
}

export const createIndexer = async (channel: Channel) : Promise<Indexer> => {
  const EXCHANGE = 'indexer'

  channel.assertExchange(EXCHANGE, 'direct', { durable: true })

  const index = (action: string, data: any) =>
    channel.publish(EXCHANGE, `${action}`, new Buffer(JSON.stringify(data)))

  return {
    index
  }
}

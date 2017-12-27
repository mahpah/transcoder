import app from './server'
import { connect } from 'amqplib'
import Config from '@mahpah/configuration'
import { createLogger } from './lib/logger'
import { createIndexer } from './lib/indexer';
// import { unlinkSync } from 'fs'
// import { join } from 'path';

const VIDEO_PROCESSING_QUEUE = 'video_processing'

const prepare = async () => {
  const connection = await connect(Config.rabbitConnectionString)
  const channel = await connection.createChannel()
  await channel.assertQueue(VIDEO_PROCESSING_QUEUE, { durable: true, exclusive: false, autoDelete: false, arguments: null })
  const logger = await createLogger(channel, 'web')
  const indexer = await createIndexer(channel)
  logger.info('started')

  app.context.logger = logger
  app.context.videoChannel = channel
  app.context.indexer = indexer

  app.listen(3333, () => {
    console.log('server started')
  })

  process.on('SIGINT', () => {
    logger.info('exited')
    setTimeout(() => {
      connection.close()
      process.exit()
    }, 500);
  })
}

prepare().catch(console.error)

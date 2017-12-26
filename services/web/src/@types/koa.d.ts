import { BaseContext } from 'koa'
import { Channel } from 'amqplib'

/**
 * add some custom field to Koa context
 */
declare module 'koa' {
  interface BaseContext {
    logger: any,
    videoChannel: Channel
  }
}

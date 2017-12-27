import * as Router from 'koa-router'
import { File } from 'formidable'
import { createReadStream, createWriteStream } from 'fs'
import * as path from 'path'
import Config from '@mahpah/configuration'
import { v4 } from 'uuid'
import { sync as mkdirp } from 'mkdirp'
import { flatten } from 'ramda'

const VIDEO_PROCESSING_QUEUE = 'video_processing'
const router = new Router()

export const saveFile = (file: File): Promise<any> => {
  mkdirp(Config.storagePath)
  const storedFileName = `${file.name}-${v4()}`
  const dest = path.join(Config.storagePath, storedFileName)

  return new Promise((resolve, reject) => {
    const reader = createReadStream(file.path)
    const writer = createWriteStream(dest)
    reader.pipe(writer)
    reader.on('end', () => resolve({
      storedFileName,
      path: dest
    }))
    reader.on('error', reject)
  })
}

router.get('/', async ctx => {
  await ctx.render('index.pug', { appName: 'test' })
})

router.post('/', async ctx => {
  const files = ctx.request.body.files
  const fileList = flatten(Object.keys(files).map(k => files[k]))

  const savedFiles = await Promise.all(fileList.map(saveFile))
  savedFiles.forEach(f => {
    ctx.indexer.index('create', f)
    ctx.videoChannel.sendToQueue(VIDEO_PROCESSING_QUEUE, new Buffer(f.storedFileName))
  })

  await ctx.render('index.pug', {
    appName: 'test',
    uploadedFiles: fileList
  })
})

export default router

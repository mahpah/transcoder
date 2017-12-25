import * as ffmpeg from 'fluent-ffmpeg'
import Config from '@mahpah/configuration'
import * as path from 'path'
import { existsSync } from 'fs'
import * as Debug from 'debug'

const debug = Debug('dashify:encoder')

const OVERWRITE = true

export const readMetadata = (input: string) : Promise<ffmpeg.FfprobeData> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(input, (err, data) => {
      if (err) {
        return reject(err)
      }

      resolve(data)
    })
  })
}

export const videoMetadata = (data: ffmpeg.FfprobeData) => {
  return data.streams.filter(t => t.codec_type === 'video')[0]
}

export const encodeAudio = (filePath: string, fileName: string, outDir: string) => {
  const outFileName = `${fileName}_audio.mp4`

  return new Promise((resolve, reject) => {
    const outputPath = path.resolve(outDir, outFileName)
    if (!OVERWRITE && existsSync(outputPath)) {
      debug(`${outputPath} already existed. Yay`)
      resolve({
        name: outFileName,
        path: outputPath
      })

      return
    }

    ffmpeg()
      .input(filePath)
      .noVideo()
      .outputOptions([
        '-g 96',
        '-sc_threshold 0'
      ])
      .audioCodec('aac')
      .output(outputPath)
      .on('start', (command: string) => {
        debug(`execute: ${command}`)
      })
      .on('end', () => resolve({
        name: outFileName,
        path: outputPath
      }))
      .on('error', reject)
      .run()
  })
}

export const encodeVideo = (filePath: string, fileName: string, width: number, outDir: string) => {
  const outFileName = `${fileName}_video_${width}.mp4`

  return new Promise((resolve, reject) => {
    const outputPath = path.resolve(outDir, outFileName)
    if (!OVERWRITE && existsSync(outputPath)) {
      debug(`${outputPath} already existed. Yay`)
      resolve({
        name: fileName,
        path: outputPath
      })
      return
    }

    ffmpeg()
      .input(filePath)
      .videoCodec('libx264')
      .size(`${width}x?`)
      .noAudio()
      .output(outputPath)
      .on('start', (command: string) => {
        debug(`execute: ${command}`)
      })
      .on('end', () => resolve({
        name: outFileName,
        path: outputPath,
      }))
      .on('error', reject)
      .run()
  })
}

/**
 *
 * @param filePath full path to file
 * @param fileName
 * @param outDir output directory
 */
export const encode = (filePath: string, fileName: string, outDir: string) => {
  const video$ = Config.encodeSizes.map((conf: any) =>
    encodeVideo(filePath, fileName, conf.width, outDir)
      .catch(_ => undefined)
  )

  const audio$ = encodeAudio(filePath, fileName, outDir).catch(() => undefined)

  return Promise.all([
    ...video$,
    audio$,
  ])
}

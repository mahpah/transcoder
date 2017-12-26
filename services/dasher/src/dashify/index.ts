import { encode } from './encoder'
import { mp4box } from './mp4box'
import Config from '@mahpah/configuration'
import { v4 } from 'uuid'
import { btoa } from '../utils'
import { unlinkSync } from 'fs'

const tmpDir = Config.tmpDir
const outDir = Config.outDir

export const execute = async (fileLocation: string) => {
  const fileName = btoa(v4())
  const encodedFiles = await encode(fileLocation, fileName, tmpDir, Config.encodeSizes)

  if (!encodedFiles || !encodedFiles.length) {
    return Promise.reject(`Cannot encode file ${fileLocation}`)
  }

  const encodedFilePaths = encodedFiles.map(t => t.path)
  const ret = await mp4box(encodedFilePaths, `${outDir}/${fileName}`, 'init')
  encodedFilePaths.forEach(t => unlinkSync(t))
  return ret
}

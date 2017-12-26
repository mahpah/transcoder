import { readMetadata, encodeAudio, encodeVideo } from './ffmpeg'
import { sync as mkdirp } from 'mkdirp'

const getAvailableSizes = async (filePath: string, encodeSizes: number[]) => {
  try {
    const data = await readMetadata(filePath)
    const videoWidth = data.streams.filter(t => t.codec_type === 'video').map(t => t.width)[0] as number
    const avaiableSizes = encodeSizes.filter(t => t < videoWidth)
    return [...avaiableSizes, videoWidth]
  } catch {
    return []
  }
}

export type Asset = {
  fileName: string
  path: string
}

export const encode = async (filePath: string, outName: string, outDir: string, encodeSizes: number[]) => {
  const sizes = await getAvailableSizes(filePath, encodeSizes)
  if (!sizes || !sizes.length) {
    return []
  }

  mkdirp(outDir)
  const video$ = sizes.map((width: any) =>
    encodeVideo(filePath, outName, width, outDir)
      .catch(e => {
        console.log(e)
        return undefined
      })
  )

  const audio$ = encodeAudio(filePath, outName, outDir).catch(() => undefined)

  return await Promise.all([
    ...video$,
    audio$,
  ]).then(res => res.filter(t => !!t)) as Asset[]
}

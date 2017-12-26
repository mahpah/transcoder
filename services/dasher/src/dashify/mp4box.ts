import { exec } from 'child_process'
import * as path from 'path'
import { sync as mkdirp } from 'mkdirp'

export interface IInputVideo {
  path: string
  bitRate: number
}

const mp4boxCommand = (outName: string, outPath: string, filePaths: string[], bitRate?: number) => {
  const segmentName = bitRate ? `%s_${bitRate}_` : '%s_'
  filePaths = filePaths.map(p => `"${p}"`)
  return `MP4Box -dash 4000 -frag 4000 -rap -out "${outPath}/${outName}" -segment-name ${segmentName} ${filePaths.join(' ')}`
}

/**
 * MP4Box -dash 4000 -frag 4000 -rap -out ./abc/a.mpd -segment-name%s_a_ <file1> <file2> <file3>
 */
export const mp4box = (inputFiles: string[], outDir: string, outName: string) => {
  outName = outName + '.mpd'
  mkdirp(outDir)
  return new Promise((resolve, reject) => {
    const command = mp4boxCommand(outName, outDir, inputFiles)
    exec(command, (err, _, stderr) => {
      if (err) {
        reject(stderr)
        return
      }

      resolve({
        name: outName,
        path: path.resolve(outDir, outName),
      })
    })
  })
}

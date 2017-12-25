import test from 'ava'
import { readMetadata, encodeVideo, videoMetadata } from '../src/dashify/ffmpeg'
import { encode } from '../src/dashify/encoder'
import { mp4box } from '../src/dashify/mp4box'

const INPUT_FILE = './test-data/video.mp4'

const getVideoWidth = async (input: string) => {
  const data = await readMetadata(input)
  const videoData = videoMetadata(data)
  return videoData.width
}

test('can read video metadata', async t => {
  const data = await readMetadata(INPUT_FILE)
  console.log(data)
  t.truthy(data)
})

test('can export video', async t => {
  const res = await encodeVideo(INPUT_FILE, 'out', 200, './test-data/out') as any
  console.log(res)
  t.truthy(res)
  t.is(await getVideoWidth(res.path), 200)
})

test('can encode to many sizes', async t => {
  const res = await encode(INPUT_FILE, 'encoded', './test-data/out', [ 100, 200, 500, 1000 ])
  console.log(res)
  t.truthy(res)
})

test.only('can create dash', async t => {
  const res = await encode(INPUT_FILE, 'encoded', './test-data/out', [ 100, 200, 500, 1000 ])
  const encoded = res.map((t: any) => t.path)

  const dashed = await mp4box(encoded, './test-data/out/mpd', 'video')
  console.log(dashed)
  t.truthy(dashed)
})

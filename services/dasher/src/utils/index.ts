export const btoa = (str: string | Buffer) => {
  let buffer

  if (str instanceof Buffer) {
    buffer = str
  } else {
    buffer = new Buffer(str.toString(), 'binary')
  }

  return buffer.toString('base64')
}

export const atob = (str: string) =>
  new Buffer(str, 'base64').toString('binary')

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

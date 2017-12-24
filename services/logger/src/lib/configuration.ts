import { resolve } from 'path'
import { readFileSync } from 'fs'

export type Configuration = {
  [key: string]: any,
}

const loadJsonFile = (filename: string): Configuration => {
  const path = resolve(process.cwd(), filename)

  try {
    const text = readFileSync(path).toString()
    return JSON.parse(text)
  } catch (e) {
    return {}
  }
}

const environment = process.env.NODE_ENV || 'development'

const defaultConfig = loadJsonFile('config/default.json')
const envConfig = loadJsonFile(`config/${environment}.json`)

export default Object.assign(defaultConfig, envConfig, process.env)

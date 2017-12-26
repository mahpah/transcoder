import { startWorker } from "./app"
import * as cluster from 'cluster'
import Config from '@mahpah/configuration'

const masterNode = () => {
  const NUMBER_OF_WORKERS = Config.workerCount || 2
  for (let index = 0; index < NUMBER_OF_WORKERS; index++) {
    cluster.fork()
  }
}

const workerNode = () => {
  console.log('Start worker ', process.pid)
  startWorker().catch(console.error)
}

if (cluster.isMaster) {
  masterNode()
} else {
  workerNode()
}


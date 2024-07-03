import nodeCron from 'node-cron'
import moment from 'moment'
import QueueService from '@services/queue.mjs'

const init = () => {
  /** REFRESH AND SORTED QUEUE (EVERY 4min31sec) */
  nodeCron.schedule('31 */4 * * * *', async () => {
    try {
      const getAllQueue = await QueueService.getQueueAll()
      console.log('Queue updated')
    } catch (error) {
      console.error(error)
    }
  });

  /** EXECUTE QUEUE (EVERY 12sec) */
  nodeCron.schedule('*/12 * * * * *', async () => {
    try {
      const inFront = await QueueService.frontQueue()
      if(inFront) { await QueueService.processingQueue(inFront) }
    } catch (error) {
      console.error(error)      
    }
  });
}

const scheduler = () => {
  init()
}

export default scheduler()
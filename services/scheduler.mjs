import nodeCron from 'node-cron'
import moment from 'moment'
import QueueService from '@services/queue.mjs'
import pc from "picocolors";

const init = () => {

  /** EXECUTE QUEUE (EVERY 30s) */
  nodeCron.schedule('* * * * *', async () => {
    try {
      await QueueService.initQueue();
    } catch (error) {
      console.log(pc.bgRed(pc.white(`SCHEDULE-QUEUE: ${error}`)));
    }
  });
}

const scheduler = () => {
  init()
}

export default scheduler()
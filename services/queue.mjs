import db from '@services/orm/index.mjs'
import moment from 'moment';
import HRServices from '@services/apps/hr.mjs';

class QueueService {
  constructor() {
    this.DBAJobsQueue = db.DatabaseA.models.JobsQueue;
    this.DBAJobsFailed = db.DatabaseA.models.JobsFailed;
    this.queueList = []
    this.priorityOrder = { high: 1, medium: 2, low: 3 };
  }

  async getQueueAll() {
  
    const  sortByPriorityAndCreatedAt = (a,b) => {
      if (a.reserved_at !== null && b.reserved_at === null) {
        return -1;
      } else if (a.reserved_at === null && b.reserved_at !== null) {
        return 1;
      }
  
      const priorityComparison = this.priorityOrder[a.priority] - this.priorityOrder[b.priority];
      if (priorityComparison !== 0) {
        return priorityComparison;
      }
  
      return moment(a.created_at).diff(moment(b.created_at));
    };
  
    try {
      const getQueue = await this.DBAJobsQueue.findAll()
      // const queueToJson = getQueue.toJSON()
      const sortedQueue = getQueue?.sort(sortByPriorityAndCreatedAt)
      this.queueList = sortedQueue
      return sortedQueue
    } catch (error) {
      throw error
    }
  };
  
  async frontQueue() {
    if(this.queueList.length <= 0) { return null }
    return this.queueList[0]
  };

  async createQueue(data) {
    // format {priority: '', payload: {type: '', otherdata: ''}}
    try {
      const newQueue = await this.DBAJobsQueue.create({
        priority: data.priority,
        payload: JSON.stringify(data.payload),
        attemps: 0,
        reserved_at: null,
        created_at: moment(),
      });
      const getQueue = await this.getQueueAll();
      return newQueue
    } catch (error) {
      throw error
    }
  };

  async reservedByType(queue) {
    try {
      const reserved = await queue.update({
        reserved_at: moment()
      })
      return reserved
    } catch (error) {
      throw error
    }
  };

  async executedByType(queue) {
    try {
      const parsedPayload = JSON.parse(queue.payload)
      
      let result;
      if(parsedPayload.type === 'sync-attn') {
        result = await HRServices.synchronizeAttFromSource(parsedPayload.startDate, parsedPayload.endDate)
        if(result){ this.createQueue({ priority: 'medium', payload: {type: 'export-text-attn', startDate: parsedPayload.startDate, endDate: parsedPayload.endDate} }) }
      }
      else if(parsedPayload.type === 'export-text-attn') {
        result = await HRServices.exportToTextFile(parsedPayload.startDate, parsedPayload.endDate)
      }
      else {
        result = new Error('Error executedByType')
      }

      return result
    } catch (error) {
      throw error
    }
  };

  async processingQueue(queue) {
    try {
      if(!queue.lock) {
        const locking = await queue.update({ lock: 1 });

        if(queue.attemps < 3) {
          const attempting = await queue.update({ attemps: queue.attemps +1 });
          const executedByType = await this.executedByType(queue)
          if(executedByType) {
            const unlocking = await queue.update({ lock: 0 });
            const deletedQueue = await this.deleteQueue({uuid: queue.uuid});
            return true
          } else {
            const deletedQueue = await this.deleteQueue({uuid: queue.uuid});
            const logging = await this.createFailedQueue(queue, executedByType);
            return true
          }
        } else {
          const unlocking = await queue.update({ lock: 0 });
          const deletedQueue = await this.deleteQueue({uuid: queue.uuid});
          const logging = await this.createFailedQueue(queue, 'Maximum number attemps.');
          return true
        }
      }
    } catch (error) {
      const unlocking = await queue.update({ lock: 0 });
      const logging = await this.createFailedQueue(queue, error.message || error)
      console.error(error)     
    }
  };

  async deleteQueue(payload) {
    try {
      const deleteQueue = await this.DBAJobsQueue.destroy({ where: {uuid: payload.uuid} });
      const getQueue = await this.getQueueAll();
      return true
    } catch (error) {
      throw error
    }
  };

  async createFailedQueue(queue, error) {
    try {
      const failed = await this.DBAJobsFailed.create({
        uuid: queue.uuid,
        priority: queue.priority,
        payload: queue.payload,
        exception: error,
      })
    } catch (error) {
      
    }
  };
}

export default new QueueService()
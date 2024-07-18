import db from '@services/orm/index.mjs'
import moment from 'moment';

const JobQueue = db.DatabaseA.models.JobsQueue;
const JobFailed = db.DatabaseA.models.JobsFailed;

class JobServices {
  constructor() {}

  async createJobQueue(data) {
    let createJobQueueTrx;
    try {
      createJobQueueTrx = await db.DatabaseA.transaction();
      const newQueue = await JobQueue.create({
        priority: data.priority,
        payload: JSON.stringify(data.payload),
        attemps: 0,
        reserved_at: null,
        created_at: moment(),
      },{ transaction: createJobQueueTrx });
      await createJobQueueTrx.commit();

      return newQueue
    } catch (error) {
      if(createJobQueueTrx) { await createJobQueueTrx.rollback(); }
      throw error
    }
  };

  async deleteJobQueue(payload) {
    let deleteJobTrx;
    try {
      deleteJobTrx = await db.DatabaseA.transaction();
      const deleteQueue = await JobQueue.destroy({ where: {uuid: payload.uuid}, transaction: deleteJobTrx });
      await deleteJobTrx.commit();
      return true
    } catch (error) {
      if(deleteJobTrx) { await deleteJobTrx.rollback(); }
      throw error
    }
  };

  async createFailedJobQueue(payload) {
    let createJobFailedTrx;
    try {
      createJobFailedTrx = await db.DatabaseA.transaction();
      const creating = await JobFailed.create({
        uuid: payload.queue.uuid,
        priority: payload.queue.priority,
        payload: payload.queue.payload,
        exception: payload.error,
      },{transaction: createJobFailedTrx});
      await createJobFailedTrx.commit();
      return creating;
    } catch (error) {
      if(createJobFailedTrx) { await createJobFailedTrx.rollback(); }
      throw error
    }
  };
}

export default new JobServices();
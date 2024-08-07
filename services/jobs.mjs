import db from '@services/orm/index.mjs'
import moment from 'moment';

const JobQueue = db.DatabaseA.models.JobsQueue;
const JobFailed = db.DatabaseA.models.JobsFailed;
const priorityOrder = { high: 1, medium: 2, low: 3 };

class JobServices {
  constructor() {
    this.jobs = [];
  };

  async getJobs() {
    try {
      const jobs = await JobQueue.findAll();
      return jobs;
    } catch (error) {
      throw error;
    }
  };

  async createJob(priority, data) {
    let createJobTrx;
    try {
      createJobTrx = await db.DatabaseA.transaction();
      const creating = await JobQueue.create({
        priority: priority,
        data: JSON.stringify(data),
        attempt: 0,
        reserved_at: null,
        created_at: moment(),
      },{ transaction: createJobTrx});
      await createJobTrx.commit();
      return creating;
    } catch (error) {
      if(createJobTrx) { await  createJobTrx.rollback(); }
      throw error;
    }
  };

  async updateJob(uuid, priority, data, attempt, reservedAt, createdAt, statusLock){
    let updateJobTrx;
    try {
      updateJobTrx = await db.DatabaseA.transaction();
      const updating = await JobQueue.update({
        priority: priority,
        data: data,
        attempt: attempt,
        reserved_at: reservedAt,
        created_at: createdAt,
        lock: statusLock,
      }, { transaction: updateJobTrx, where: { uuid: uuid } });
      await updateJobTrx.commit();
      return updating;
    } catch (error) {
      throw error;
    }
  };

  async deleteJob(uuid) {
    let deleteJobTrx;
    try {
      deleteJobTrx = await db.DatabaseA.transaction();
      await JobQueue.destroy({
        transaction: deleteJobTrx,
        where: { uuid: uuid },
      });
      await deleteJobTrx.commit();
      return true;
    } catch (error) {
      if(deleteJobTrx) { await deleteJobTrx.rollback(); }
      throw error;
    }
  };

  async createFailJob(job, error) {
    let createFailJobTrx;
    try {
      createFailJobTrx = await db.DatabaseA.transaction();
      const creating = await JobFailed.create({
        uuid: job.uuid,
        priority: job.priority,
        data: job.data,
        exception: error,
      })
      await createFailJobTrx.commit();
    } catch (error) {
      if(createFailJobTrx) { await createFailJobTrx.rollback(); }
      throw error;
    }
  };

  async getSortedJobs() {
    const sortByPriorityAndCreatedAt = (a, b) => {
      if (a.reserved_at !== null && b.reserved_at === null) { return -1; }
      else if (a.reserved_at === null && b.reserved_at !== null) { return 1; }

      const priorityComparison = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityComparison !== 0) { return priorityComparison; }

      return moment(a.created_at).diff(moment(b.created_at));
    };

    try {
      const queue = await this.getJobs();
      if(queue.length > 0) {
        const sorted = queue.sort(sortByPriorityAndCreatedAt);
        return sorted;
      }
      return queue;
    } catch (error) {
      throw error
    }
  };

  async getInFrontJob() {
    try {
      const queue = await this.getSortedJobs();
      if(queue.length > 0) { return queue[0] }
      return null;
    } catch (error) {
      throw error;
    }
  };
}

export default new JobServices();
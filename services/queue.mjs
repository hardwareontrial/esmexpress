import pc from "picocolors"
import JobServices from '@services/jobs.mjs';
import HRServices from '@services/apps/hr.mjs';
import OKMServices from '@services/apps/okm.mjs';

class  QueueService {
  constructor() {
    this.queue = null;
  }

  setQueue (value) {
    this.queue = value;
  };

  async initQueue() {
    try {
      const job = await JobServices.getInFrontJob();
      if(!job) {
        console.log(pc.bgCyan(pc.white(`QUEUE: No Queue`)));
        return
      }
      this.setQueue(job);

      if(job.lock !== 1) {
        this.queue.lock = 1;
        await this.updateQueue();
      }

      const attemptProcessing = await this.processing();
      if(attemptProcessing) {
        this.queue.lock = 0;
        await this.updateQueue();
        await this.deleteQueue(this.queue.uuid);
        console.log(pc.bgGreen(pc.white(`QUEUE: ${this.queue.uuid} done`)));
        this.setQueue(null);
      }
    } catch (error) {
      console.log(pc.bgRed(pc.white(`QUEUE: ${error}`)));
      throw error;
    }
  };

  async creatingQueue(priority, data) {
    try {
      const creating = await JobServices.createJob(priority, data);
      return creating;
    } catch (error) {
      throw error;
    }
  };

  async updateQueue(){
    try {
      const updating = await JobServices.updateJob(
        this.queue.uuid,
        this.queue.priority,
        this.queue.data,
        this.queue.attempt,
        this.queue.reserved_at,
        this.queue.created_at,
        this.queue.lock
      );
      return updating;
    } catch (error) {
      throw error;
    }
  };

  async createFailQueue(error) {
    try {
      this.queue.data = this.queue.data;
      const creating = await JobServices.createFailJob(this.queue, error);
      return creating;
    } catch (error) {
      throw error;
    }
  };

  async deleteQueue(uuid) {
    try {
      const deleting = await JobServices.deleteJob(uuid);
      return deleting;
    } catch (error) {
      throw error;
    }
  };

  async processing() {
    try {
      if(this.queue.attempt < 3) {
        this.queue.attempt = this.queue.attempt +1;
        await this.updateQueue();
        const attempting = await this.executedByType(this.queue.data);
        return attempting;
      } else {
        await this.createFailQueue('Max attempts reach');
        await this.deleteQueue(this.queue.uuid);
        this.setQueue(null);
      }
    } catch (error) {
      return false;
    }
  };

  async executedByType(data) {
    const parsedData = JSON.parse(data);

    if(parsedData.type === 'sync-attn') {
      try {
        const syncAttn = await HRServices.synchronizeAttFromSource(parsedData.startDate, parsedData.endDate);
        await this.creatingQueue('medium', {type: 'export-text-attn', startDate: parsedData.startDate, endDate: parsedData.endDate});
        return syncAttn;
      } catch (error) {
        await this.createFailQueue(error.message || error)
        return false;
      }
    }

    else if(parsedData.type === 'export-text-attn') {
      try {
        const exportTextAttn = await HRServices.exportToTextFile(parsedData.startDate, parsedData.endDate);
        return exportTextAttn;
      } catch (error) {
        await this.createFailQueue(error.message || error)
        return false;
      }
    }

    else if(parsedData.type === 'process-excel-okm-question') {
      try {
        const processExcelOkmQuestion = await OKMServices.readQuestionFromExcel(parsedData.collection_id, parsedData.filename)
        return processExcelOkmQuestion;
      } catch (error) {
        await this.createFailQueue(error.message || error)
        return false;
      }
    }

    else {
      await this.createFailQueue('No options available')
      return false;
    }
  };
}

export default new QueueService()
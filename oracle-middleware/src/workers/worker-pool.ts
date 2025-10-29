import { Worker } from 'worker_threads';
import { join } from 'path';

export class WorkerPool {
  private workers: Worker[] = [];
  private queue: any[] = [];
  private idleWorkers: Worker[] = [];

  constructor(private size = 4) {
    for (let i = 0; i < size; i++) {
      this.createWorker();
    }
  }

  private createWorker() {
    const worker = new Worker(join(__dirname, './mint.worker.js'));
    worker.on('message', (msg) => {
      const { resolve } = (worker as any).currentTask;
      resolve(msg);
      (worker as any).currentTask = null;
      this.idleWorkers.push(worker);
      this.runNext();
    });
    worker.on('error', console.error);
    this.idleWorkers.push(worker);
  }

  runTask(data): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ data, resolve, reject });
      this.runNext();
    });
  }

  private runNext() {
    if (this.queue.length === 0 || this.idleWorkers.length === 0) return;

    const worker = this.idleWorkers.pop();
    if (!worker) return;

    const task = this.queue.shift();
    if (!task) return;

    (worker as any).currentTask = task;
    worker.postMessage(task.data);
  }
}

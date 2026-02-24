import { Worker } from 'worker_threads';
import { join } from 'path';

export class WorkerPool {
  private serviceWorkers: Worker[] = [];
  private userWorkers: Worker[] = [];
  private serviceQueue: any[] = [];
  private userQueue: any[] = [];

  constructor(private size = 10) {
    for (let i = 0; i < size; i++) {
      this.createServiceWorker();
      this.createUserWorker();
    }
  }

  private createServiceWorker() {
    const serviceWorker = new Worker(join(__dirname, './service.worker.js'));
    serviceWorker.on('message', (msg) => {
      const { resolve } = (serviceWorker as any).currentTask;
      resolve(msg);
      (serviceWorker as any).currentTask = null;
      this.serviceWorkers.push(serviceWorker);
      this.runServiceNext();
    });
    serviceWorker.on('error', console.error);
    this.serviceWorkers.push(serviceWorker);
  }

  private createUserWorker() {
    const userWorker = new Worker(join(__dirname, './user.worker.js'));
    userWorker.on('message', (msg) => {
      const { resolve } = (userWorker as any).currentTask;
      resolve(msg);
      (userWorker as any).currentTask = null;
      this.userWorkers.push(userWorker);
      this.runUserNext();
    });
    userWorker.on('error', console.error);
    this.userWorkers.push(userWorker);
  }

  runServiceTask(data): Promise<any> {
    return new Promise((resolve, reject) => {
      this.serviceQueue.push({ data, resolve, reject });
      this.runServiceNext();
    });
  }

  runUserTask(data): Promise<any> {
    return new Promise((resolve, reject) => {
      this.userQueue.push({ data, resolve, reject });
      this.runUserNext();
    });
  }

  private runServiceNext() {
    if (this.serviceQueue.length === 0 || this.serviceWorkers.length === 0) return;

    const worker = this.serviceWorkers.pop();
    if (!worker) return;

    const task = this.serviceQueue.shift();
    if (!task) return;

    (worker as any).currentTask = task;
    worker.postMessage(task.data);
  }

  private runUserNext() {
    if (this.userQueue.length === 0 || this.userWorkers.length === 0) return;

    const worker = this.userWorkers.pop();
    if (!worker) return;

    const task = this.userQueue.shift();
    if (!task) return;

    (worker as any).currentTask = task;
    worker.postMessage(task.data);
  }
}

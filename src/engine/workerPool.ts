import { FilterSettings, ImageItem, QueueStats } from '../types/studio';
import { processAndScaleImage } from './upscaleEngine';

export interface PoolCallbacks {
  onItemStart: (id: string) => void;
  onItemSuccess: (id: string, processedUrl: string, blob: Blob, timeMs: number) => void;
  onItemError: (id: string, error: string) => void;
  onQueueComplete: () => void;
  onStatsChange: (stats: QueueStats) => void;
}

export class BatchWorkerPool {
  private workers: Worker[] = [];
  private workerStatus: boolean[] = []; // true if busy
  private concurrency: number;
  private queue: { item: ImageItem; settings: FilterSettings }[] = [];
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private callbacks: PoolCallbacks;

  private stats: QueueStats = {
    total: 0,
    completed: 0,
    processing: 0,
    queued: 0,
    failed: 0,
    startTime: null,
    elapsedMs: 0,
    estimatedRemainingMs: 0,
    throughputFps: 0,
    activeWorkers: 0,
  };

  private timerInterval: any = null;

  constructor(callbacks: PoolCallbacks, maxConcurrency?: number) {
    this.callbacks = callbacks;
    const cpuCores = typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 4) : 4;
    this.concurrency = maxConcurrency || Math.min(4, Math.max(2, cpuCores - 1));
    // Lazy: Workers will only be spawned when batch dispatch starts
  }

  private ensureWorkers() {
    if (this.workers.length > 0) return;
    for (let i = 0; i < this.concurrency; i++) {
      try {
        const worker = new Worker(
          new URL('./imageWorker.ts', import.meta.url),
          { type: 'module' }
        );
        worker.onmessage = this.handleWorkerMessage.bind(this, i);
        worker.onerror = this.handleWorkerError.bind(this, i);
        this.workers.push(worker);
        this.workerStatus.push(false);
      } catch (err) {
        console.warn('Web Worker initialization failed, will fallback to main thread:', err);
      }
    }
  }

  public enqueue(items: ImageItem[], settings: FilterSettings, forceAll: boolean = false) {
    this.queue = [];
    for (const item of items) {
      if (forceAll || item.status !== 'completed') {
        this.queue.push({ item, settings });
      }
    }
    this.stats.total = items.length;
    this.stats.queued = this.queue.length;
    this.stats.completed = forceAll ? 0 : items.filter(it => it.status === 'completed').length;
    this.stats.processing = 0;
    this.updateStats();
  }

  public start() {
    if (this.isRunning && !this.isPaused) return;
    this.isRunning = true;
    this.isPaused = false;
    if (!this.stats.startTime) {
      this.stats.startTime = Date.now();
    }
    this.startTimer();
    this.dispatch();
  }

  public pause() {
    this.isPaused = true;
    this.stopTimer();
    this.updateStats();
  }

  public resume() {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.startTimer();
    this.dispatch();
  }

  public cancel() {
    this.queue = [];
    this.isRunning = false;
    this.isPaused = false;
    this.stopTimer();

    // Terminate existing workers to free memory immediately
    this.workers.forEach(w => w.terminate());
    this.workers = [];
    this.workerStatus = [];

    this.stats.processing = 0;
    this.stats.queued = 0;
    this.updateStats();
  }

  private startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.stats.startTime && this.isRunning && !this.isPaused) {
        this.stats.elapsedMs = Date.now() - this.stats.startTime;
        
        // Calculate throughput and ETA
        if (this.stats.completed > 0) {
          const fps = this.stats.completed / (this.stats.elapsedMs / 1000);
          this.stats.throughputFps = Math.round(fps * 10) / 10;
          const remainingItems = this.stats.queued + this.stats.processing;
          this.stats.estimatedRemainingMs = fps > 0 ? Math.round((remainingItems / fps) * 1000) : 0;
        }
        this.updateStats();
      }
    }, 500);
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private async dispatch() {
    if (!this.isRunning || this.isPaused) return;

    this.ensureWorkers();

    // Check if entire queue is finished
    if (this.queue.length === 0 && this.stats.processing === 0) {
      this.isRunning = false;
      this.stopTimer();
      this.callbacks.onQueueComplete();
      return;
    }

    // Assign tasks to idle workers
    for (let i = 0; i < this.workers.length; i++) {
      if (!this.workerStatus[i] && this.queue.length > 0) {
        const job = this.queue.shift()!;
        this.workerStatus[i] = true;
        this.stats.processing++;
        this.stats.queued = this.queue.length;
        this.updateStats();

        this.callbacks.onItemStart(job.item.id);
        this.executeJob(i, job.item, job.settings);
      }
    }
  }

  private async executeJob(workerIndex: number, item: ImageItem, settings: FilterSettings) {
    try {
      // Load source as ImageBitmap for zero-copy transfer to worker
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = item.originalUrl;
      await img.decode();

      // Attempt Web Worker OffscreenCanvas execution
      const worker = this.workers[workerIndex];
      if (worker && 'createImageBitmap' in window) {
        const bitmap = await createImageBitmap(img);
        worker.postMessage(
          {
            id: item.id,
            imageBitmap: bitmap,
            settings,
          },
          [bitmap]
        );
      } else {
        // Fallback: process on main thread async
        const { dataUrl, blob } = await processAndScaleImage(img, settings);
        this.onJobDone(workerIndex, item.id, dataUrl, blob, 50);
      }
    } catch (err: any) {
      this.onJobFailed(workerIndex, item.id, err.message || 'Image decode error');
    }
  }

  private handleWorkerMessage(workerIndex: number, e: MessageEvent) {
    const data = e.data;
    if (data.type === 'SUCCESS') {
      const processedUrl = URL.createObjectURL(data.blob);
      this.onJobDone(workerIndex, data.id, processedUrl, data.blob, data.timeMs);
    } else if (data.type === 'ERROR') {
      this.onJobFailed(workerIndex, data.id, data.error);
    }
  }

  private handleWorkerError(workerIndex: number, err: ErrorEvent) {
    console.error(`Worker #${workerIndex} fatal error:`, err);
    this.workerStatus[workerIndex] = false;
    this.stats.processing = Math.max(0, this.stats.processing - 1);
    this.stats.failed++;
    this.updateStats();
    this.dispatch();
  }

  private onJobDone(workerIndex: number, id: string, processedUrl: string, blob: Blob, timeMs: number) {
    this.workerStatus[workerIndex] = false;
    this.stats.processing = Math.max(0, this.stats.processing - 1);
    this.stats.completed++;
    this.updateStats();

    this.callbacks.onItemSuccess(id, processedUrl, blob, timeMs);
    this.dispatch();
  }

  private onJobFailed(workerIndex: number, id: string, error: string) {
    this.workerStatus[workerIndex] = false;
    this.stats.processing = Math.max(0, this.stats.processing - 1);
    this.stats.failed++;
    this.updateStats();

    this.callbacks.onItemError(id, error);
    this.dispatch();
  }

  private updateStats() {
    this.stats.activeWorkers = this.workerStatus.filter(Boolean).length;
    this.callbacks.onStatsChange({ ...this.stats });
  }

  public getConcurrency() {
    return this.concurrency;
  }
}

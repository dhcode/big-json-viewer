export class WorkerClient {
  private requestIndex = 0;
  private requestCallbacks = {};

  constructor(private worker) {
    this.initWorker();
  }

  private initWorker() {
    this.worker.onmessage = msg => {
      if (msg.data && msg.data.resultId && this.requestCallbacks[msg.data.resultId]) {
        const callb = this.requestCallbacks[msg.data.resultId];
        delete this.requestCallbacks[msg.data.resultId];
        callb(msg.data);
      }
    };
    this.worker.onerror = e => console.error(e);
  }

  public call(handler, ...args): Promise<any> {
    return this.callWorker(handler, undefined, ...args);
  }

  public callWorker(handler, transfers = undefined, ...args): Promise<any> {
    return new Promise((resolve, reject) => {
      const resultId = ++this.requestIndex;
      this.requestCallbacks[resultId] = (data) => {
        if (data.error !== undefined) {
          reject(data.error);
          return;
        }
        resolve(data.result);
      };
      this.worker.postMessage({
        handler: handler,
        args: args,
        resultId: resultId
      }, transfers);
    });
  }

};

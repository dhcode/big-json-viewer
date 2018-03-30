export interface WorkerClientApi {
  call(handler: string, ...args): Promise<any>;

  callWorker(handler: string, transfers: any[], ...args): Promise<any>;
}

export class WorkerClient implements WorkerClientApi {
  private requestIndex = 0;
  private requestCallbacks = {};
  private initialized;

  constructor(private worker) {
  }

  public initWorker(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.worker.onmessage = msg => {
        if (msg._init === true) {
          this.initialized = true;
          resolve(true);
          return;
        }
        if (
          msg.data &&
          msg.data.resultId &&
          this.requestCallbacks[msg.data.resultId]
        ) {
          const callb = this.requestCallbacks[msg.data.resultId];
          delete this.requestCallbacks[msg.data.resultId];
          callb(msg.data);
        }
      };
      this.worker.onerror = e => {
        if (!this.initialized) {
          reject(e);
        } else {
          console.error('Worker error', e);
        }
      };
      this.worker.postMessage({_init: true});
    });
  }

  public call(handler, ...args): Promise<any> {
    return this.callWorker(handler, undefined, ...args);
  }

  public callWorker(handler, transfers = undefined, ...args): Promise<any> {
    return new Promise((resolve, reject) => {
      const resultId = ++this.requestIndex;
      this.requestCallbacks[resultId] = data => {
        if (data.error !== undefined) {
          reject(data.error);
          return;
        }
        resolve(data.result);
      };
      this.worker.postMessage(
        {
          handler: handler,
          args: args,
          resultId: resultId
        },
        transfers
      );
    });
  }
}

export class WorkerClientMock implements WorkerClientApi {
  constructor(private provider) {
  }

  public call(handler, ...args): Promise<any> {
    return this.callWorker(handler, undefined, ...args);
  }

  public callWorker(handler, transfers = undefined, ...args): Promise<any> {
    return new Promise(resolve => {
      resolve(this.provider[handler].apply(this.provider, args));
    });
  }
}

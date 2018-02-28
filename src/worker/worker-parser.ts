import {AsyncJsonNodeInfo, NodeType} from '../json-node-info';

export class WorkerParserJsonInfo implements AsyncJsonNodeInfo {
  type: NodeType;
  path: string[];
  length: number;

  private parserKey: string;

  constructor(parserKey: string, nodeInfo) {
    this.parserKey = parserKey;
    this.type = nodeInfo.type;
    this.path = nodeInfo.path;
    this.length = nodeInfo.length;
  }

  getObjectKeys(start?: number, limit?: number): Promise<string[]> {
    return callWorker('callParser', this.parserKey, this.path, 'getObjectKeys', start, limit);
  }

  getByIndex(index: number): Promise<AsyncJsonNodeInfo> {
    return callWorker('callParser', this.parserKey, this.path, 'getByIndex', index)
      .then(info => new WorkerParserJsonInfo(this.parserKey, info));
  }

  getByKey(key: string): Promise<AsyncJsonNodeInfo> {
    return callWorker('callParser', this.parserKey, this.path, 'getByKey', key)
      .then(info => new WorkerParserJsonInfo(this.parserKey, info));
  }

  getByPath(path: string[]): Promise<AsyncJsonNodeInfo> {
    return callWorker('callParser', this.parserKey, this.path, 'getByPath', path)
      .then(info => new WorkerParserJsonInfo(this.parserKey, info));
  }

  getObjectNodes(start?: number, limit?: number): Promise<AsyncJsonNodeInfo[]> {
    return callWorker('callParser', this.parserKey, this.path, 'getObjectNodes', start, limit)
      .then(list => list.map(info => new WorkerParserJsonInfo(this.parserKey, info)));
  }

  getArrayNodes(start?: number, limit?: number): Promise<AsyncJsonNodeInfo[]> {
    return callWorker('callParser', this.parserKey, this.path, 'getArrayNodes', start, limit)
      .then(list => list.map(info => new WorkerParserJsonInfo(this.parserKey, info)));
  }

  getValue(): Promise<any> {
    return callWorker('callParser', this.parserKey, this.path, 'getValue');
  }

  close(): Promise<any> {
    return callWorker('closeParser', this.parserKey);
  }
}

export function parseWithWorker(json: string): Promise<WorkerParserJsonInfo> {
  return callWorker('openParser', json).then(info => {
    return new WorkerParserJsonInfo(info.parserKey, info.node);
  });
}

let worker;
let requestIndex = 0;
let requestCallbacks = {};

function callWorker(handler, ...args): Promise<any> {
  if (!worker) {
    worker = new Worker('../../dist/worker/json-parser.worker.js');
    worker.onmessage = msg => {
      if (msg.data && msg.data.resultId && requestCallbacks[msg.data.resultId]) {
        const callb = requestCallbacks[msg.data.resultId];
        delete requestCallbacks[msg.data.resultId];
        callb(msg.data);
      }
    };
    worker.onerror = e => console.error(e);
  }
  return new Promise((resolve, reject) => {
    const resultId = ++requestIndex;
    requestCallbacks[resultId] = (data) => {
      if (data.error !== undefined) {
        reject(data.error);
        return;
      }
      resolve(data.result);
    };
    worker.postMessage({
      handler: handler,
      args: args,
      resultId: resultId
    });

  });
}


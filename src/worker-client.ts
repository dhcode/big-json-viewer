import {AsyncJsonNodeInfo, AsyncJsonNodeInfoProxy, JsonNodeInfo, NodeType} from './parser/json-node-info';
import {BufferJsonParser} from './parser/buffer-json-parser';
import {searchJsonNodes, TreeSearchAreaOption, TreeSearchMatch} from './parser/json-node-search';

export type WorkerCall = (...args) => Promise<any>;

export interface WorkerJsonNodeInfo extends AsyncJsonNodeInfo {
  close();

  search(path: string[], pattern: RegExp, searchArea?: TreeSearchAreaOption): Promise<TreeSearchMatch[]>;
}

/**
 * Implements the JsonNodeInfo API to call the parser in a web worker.
 */
export class WorkerParserJsonInfo implements WorkerJsonNodeInfo {
  type: NodeType;
  path: string[];
  length: number;


  constructor(private workerCall: WorkerCall, nodeInfo: JsonNodeInfo) {
    this.type = nodeInfo.type;
    this.path = nodeInfo.path;
    this.length = nodeInfo.length;
  }

  getObjectKeys(start?: number, limit?: number): Promise<string[]> {
    return this.workerCall(this.path, 'getObjectKeys', start, limit);
  }

  getByIndex(index: number): Promise<AsyncJsonNodeInfo> {
    return this.workerCall(this.path, 'getByIndex', index)
      .then(info => new WorkerParserJsonInfo(this.workerCall, info));
  }

  getByKey(key: string): Promise<AsyncJsonNodeInfo> {
    return this.workerCall(this.path, 'getByKey', key)
      .then(info => new WorkerParserJsonInfo(this.workerCall, info));
  }

  getByPath(path: string[]): Promise<AsyncJsonNodeInfo> {
    return this.workerCall(this.path, 'getByPath', path)
      .then(info => new WorkerParserJsonInfo(this.workerCall, info));
  }

  getObjectNodes(start?: number, limit?: number): Promise<AsyncJsonNodeInfo[]> {
    return this.workerCall(this.path, 'getObjectNodes', start, limit)
      .then(list => list.map(info => new WorkerParserJsonInfo(this.workerCall, info)));
  }

  getArrayNodes(start?: number, limit?: number): Promise<AsyncJsonNodeInfo[]> {
    return this.workerCall(this.path, 'getArrayNodes', start, limit)
      .then(list => list.map(info => new WorkerParserJsonInfo(this.workerCall, info)));
  }

  getValue(): Promise<any> {
    return this.workerCall(this.path, 'getValue');
  }

  close(): Promise<any> {
    return this.workerCall(this.path, 'closeParser');
  }


  search(path: string[], pattern: RegExp, searchArea: TreeSearchAreaOption = 'all'): Promise<TreeSearchMatch[]> {
    return this.workerCall(this.path, 'search', pattern, searchArea);
  }
}

export class ClosableAsyncJsonNodeInfoProxy extends AsyncJsonNodeInfoProxy implements WorkerJsonNodeInfo {
  constructor(private _nodeInfo: JsonNodeInfo) {
    super(_nodeInfo);
  }

  search(path: string[], pattern: RegExp, searchArea: TreeSearchAreaOption = 'all'): Promise<TreeSearchMatch[]> {
    const targetNode = this._nodeInfo.getByPath(path);
    if (targetNode) {
      return Promise.resolve(searchJsonNodes(targetNode, pattern, searchArea));
    }
    return Promise.resolve([]);
  }

  close() {

  }
}

export class WorkerClient {
  private requestIndex = 0;
  private requestCallbacks = {};
  private worker = null;

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    this.worker = new Worker('./worker/json-parser.worker.ts');
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

}

export async function parseWithWorker(data: string | ArrayBuffer): Promise<WorkerJsonNodeInfo> {
  if (!window['Worker']) {
    return new ClosableAsyncJsonNodeInfoProxy(new BufferJsonParser(data).getRootNodeInfo());
  }
  const worker = new WorkerClient();
  let info;
  if (data instanceof ArrayBuffer) {
    info = await worker.callWorker('openParser', [data], data);
  } else {
    info = await worker.call('openParser', data);
  }

  const workerCall: WorkerCall = (...args) => {
    return worker.call('callParser', this.parserKey, ...args);
  };
  return new WorkerParserJsonInfo(workerCall, info.node);
}


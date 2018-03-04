import {JsonNodeInfo} from '../parser/json-node-info';
import {BufferJsonParser} from '../parser/buffer-json-parser';

declare interface DedicatedWorkerGlobalScope {
  onmessage: (this: DedicatedWorkerGlobalScope, ev: MessageEvent) => any;

  close(): void;

  postMessage(message: any, transfer?: any[]): void;
}

const scope = self as any as DedicatedWorkerGlobalScope;

scope.onmessage = function (msg) {
  console.log('received in worker ', msg.data);
  const data = msg.data;

  if (data.handler && jsonParserWorker[data.handler]) {
    try {
      const result = jsonParserWorker[data.handler].apply(jsonParserWorker, data.args);
      if (data.resultId) {
        scope.postMessage({
          resultId: data.resultId,
          result: result
        });
      }
    } catch (e) {
      if (data.resultId) {
        scope.postMessage({
          resultId: data.resultId,
          error: e.toString()
        });
      }
    }
  }


};

class JsonParserWorker {

  rootNodes: { [key: string]: JsonNodeInfo } = {};

  private index = 0;

  private generateKey() {
    return (this.index++).toString();
  }

  openParser(data: string) {
    const key = this.generateKey();
    this.rootNodes[key] = new BufferJsonParser(data).getRootNodeInfo();
    return {
      parserKey: key,
      node: this.rootNodes[key]
    };
  }

  callParser(key: string, path: string[], method: string, args?: any[]): any {
    if (this.rootNodes[key]) {
      if (method === 'closeParser') {
        delete this.rootNodes[key];
        return;
      }
      const rootNode = this.rootNodes[key];
      const targetNode = rootNode.getByPath(path);
      if (!targetNode) {
        throw new Error('Node "' + rootNode.path + '" has no path "' + path + '"');
      }
      return targetNode[method].apply(targetNode, args);
    }
    throw new Error('Unknown rootNode ' + key);
  }

}

const jsonParserWorker = new JsonParserWorker();

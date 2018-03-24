import {BufferJsonParser} from '../parser/buffer-json-parser';

declare interface DedicatedWorkerGlobalScope {
  onmessage: (this: DedicatedWorkerGlobalScope, ev: MessageEvent) => any;

  close(): void;

  postMessage(message: any, transfer?: any[]): void;
}

const scope = self as any as DedicatedWorkerGlobalScope;

export function initProvider(impl) {
  scope.onmessage = function (msg) {
    const data = msg.data;

    if (data.handler && impl[data.handler]) {
      try {
        const result = impl[data.handler].apply(impl, data.args);
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
}

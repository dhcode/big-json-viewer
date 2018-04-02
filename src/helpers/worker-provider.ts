export function initProvider(impl, scope = self as any) {
  scope.onmessage = function(msg) {
    const data = msg.data;
    if (data._init) {
      scope.postMessage({ _init: true });
      return;
    }

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

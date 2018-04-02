import { WorkerClient, WorkerClientMock } from './worker-client';
import { initProvider } from './worker-provider';

class MockMessageEvent {
  constructor(public data) {}
}

class MockErrorEvent {
  constructor(public message) {}
}

class MockWorker {
  onerror: (ev: MockErrorEvent) => any;
  onmessage: (ev: MockMessageEvent) => any;

  postMessage(message: any, transfer?: any[]): void {}

  terminate(): void {}
}

class MockScope {
  onerror: (ev: MockErrorEvent) => any;
  onmessage: (ev: MockMessageEvent) => any;

  constructor(private worker: MockWorker) {
    worker.postMessage = (message: any, transfer?: any[]) => {
      this.onmessage(new MockMessageEvent(message));
    };
  }

  postMessage(message: any, transfer?: any[]): void {
    this.worker.onmessage(new MockMessageEvent(message));
  }
}

describe('Worker Client', function() {
  it('should init client with worker', async function() {
    const mockWorker = new MockWorker();
    const mockScope = new MockScope(mockWorker);
    initProvider({}, mockScope);

    const client = new WorkerClient((mockWorker as any) as Worker);
    expect(client).toBeTruthy();
    await expect(client.initWorker()).resolves.toBeTruthy();

    spyOn(mockWorker, 'terminate');

    client.destroy();

    expect(mockWorker.terminate).toHaveBeenCalled();
  });

  it('should fail to init', async function() {
    const mockWorker = new MockWorker();
    mockWorker.postMessage = msg => {
      mockWorker.onerror(new MockErrorEvent('failed'));
    };
    const client = new WorkerClient((mockWorker as any) as Worker);
    expect(client).toBeTruthy();
    await expect(client.initWorker()).rejects.toEqual({ message: 'failed' });
  });

  it('should request hello', async function() {
    const mockWorker = new MockWorker();
    const mockScope = new MockScope(mockWorker);
    initProvider(
      {
        hello(name: string) {
          return 'Hello ' + name;
        }
      },
      mockScope
    );

    const client = new WorkerClient((mockWorker as any) as Worker);
    expect(client).toBeTruthy();
    await expect(client.initWorker()).resolves.toBeTruthy();
    await expect(client.call('hello', 'World')).resolves.toBe('Hello World');
  });

  it('should fail', async function() {
    const mockWorker = new MockWorker();
    const mockScope = new MockScope(mockWorker);
    initProvider(
      {
        fail() {
          throw new Error('failed');
        }
      },
      mockScope
    );

    const client = new WorkerClient((mockWorker as any) as Worker);
    expect(client).toBeTruthy();
    await expect(client.initWorker()).resolves.toBeTruthy();
    await expect(client.call('fail')).rejects.toBe(
      new Error('failed').toString()
    );
  });
});

describe('Worker Client Mock', function() {
  it('should call hello', async function() {
    const client = new WorkerClientMock({
      hello(name) {
        return 'Hello ' + name;
      }
    });

    expect(client).toBeTruthy();

    await expect(client.call('hello', 'World')).resolves.toBe('Hello World');

    client.destroy();
  });
});

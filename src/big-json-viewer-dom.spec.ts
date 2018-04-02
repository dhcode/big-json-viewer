import { BigJsonViewerDom, JsonNodeElement } from './big-json-viewer-dom';
import { JsonNodesStubElement } from './model/big-json-viewer.model';

const wait = time => new Promise(resolve => setTimeout(() => resolve(), time));

describe('Big JSON Viewer', function() {
  it('should instantiate', async function() {
    const viewer = await BigJsonViewerDom.fromData('{}');
    const root = viewer.getRootElement();
    expect(root).toBeTruthy();
    viewer.destroy();
  });

  it('should create DOM from simple object', async function() {
    const viewer = await BigJsonViewerDom.fromData('{"a":5, "b":true}');
    const root = viewer.getRootElement();
    expect(root).toBeTruthy();
    await root.openAll();
    expect(root.getOpenPaths()).toEqual([[]]);

    expect(root.childrenElement).toBeTruthy();
    expect(root.childrenElement.children.length).toEqual(2);
    viewer.destroy();
  });

  it('should create DOM from JavaScript simple object', async function() {
    const viewer = await BigJsonViewerDom.fromObject({ 'a': 5, 'b': true });
    const root = viewer.getRootElement();
    expect(root).toBeTruthy();
    await root.openAll();
    expect(root.getOpenPaths()).toEqual([[]]);

    expect(root.childrenElement).toBeTruthy();
    expect(root.childrenElement.children.length).toEqual(2);
    viewer.destroy();
  });

  it('should create DOM from more complex object', async function() {
    const data =
      '{"hello": "hello world, is a great world","test": [0,"old world",{"worldgame": true}]}';
    const viewer = await BigJsonViewerDom.fromData(data);
    const root: JsonNodeElement = viewer.getRootElement();
    expect(root).toBeTruthy();
    await root.openAll();
    expect(root.getOpenPaths()).toEqual([['test', '2']]);

    expect(root.childrenElement).toBeTruthy();
    expect(root.childrenElement.children.length).toEqual(2);

    await root.closeNode();

    expect(root.isNodeOpen()).toBeFalsy();

    viewer.destroy();
  });

  it('should open by toggle', async function() {
    const data =
      '{"hello": "hello world, is a great world","test": [0,"old world",{"worldgame": true}]}';
    const viewer = await BigJsonViewerDom.fromData(data);
    const root: JsonNodeElement = viewer.getRootElement();
    expect(root).toBeTruthy();

    expect(root.isNodeOpen()).toBeFalsy();
    expect(await root.toggleNode()).toBeTruthy();
    expect(root.isNodeOpen()).toBeTruthy();

    expect(root.childrenElement).toBeTruthy();
    expect(root.childrenElement.children.length).toEqual(2);

    expect(await root.toggleNode()).toBeTruthy();
    expect(root.isNodeOpen()).toBeFalsy();

    expect(root.childrenElement).toBeNull();

    viewer.destroy();
  });

  it('should open by click', async function() {
    const data =
      '{"hello": "hello world, is a great world","test": [0,"old world",{"worldgame": true}]}';
    const viewer = await BigJsonViewerDom.fromData(data);
    const root: JsonNodeElement = viewer.getRootElement();
    expect(root).toBeTruthy();

    expect(root.isNodeOpen()).toBeFalsy();
    root.querySelector('a').dispatchEvent(new MouseEvent('click'));
    await wait(1);
    expect(root.isNodeOpen()).toBeTruthy();

    expect(root.childrenElement).toBeTruthy();
    expect(root.childrenElement.children.length).toEqual(2);

    root.querySelector('a').dispatchEvent(new MouseEvent('click'));
    await wait(1);
    expect(root.isNodeOpen()).toBeFalsy();

    expect(root.childrenElement).toBeNull();

    viewer.destroy();
  });

  it('should open by search', async function() {
    const data =
      '{"hello": "hello world, is a great world","test": [0,"old world",{"worldgame": true}]}';
    const viewer = await BigJsonViewerDom.fromData(data);
    const root: JsonNodeElement = viewer.getRootElement();
    expect(root).toBeTruthy();

    const cursor = await viewer.openBySearch(/world/);
    expect(cursor).toBeTruthy();
    expect(cursor.matches.length).toEqual(4);
    expect(root.getOpenPaths()).toEqual([[]]);

    await cursor.next();
    expect(root.getOpenPaths()).toEqual([[]]);

    await cursor.next();
    expect(root.getOpenPaths()).toEqual([['test']]);

    expect(await viewer.openBySearch(null)).toBeNull();
    expect(root.isNodeOpen()).toBeFalsy();

    const cursor2 = await viewer.openBySearch(/old/);
    expect(cursor2).toBeTruthy();
    expect(cursor2.matches.length).toEqual(1);
    expect(root.getOpenPaths()).toEqual([['test']]);

    viewer.destroy();
  });

  it('should have working pagination', async function() {
    const data = new Array(120);
    data.fill(true);

    // default limit is 50

    const viewer = await BigJsonViewerDom.fromData(JSON.stringify(data));
    const root: JsonNodeElement = viewer.getRootElement();
    expect(root).toBeTruthy();

    expect(root.isNodeOpen()).toBeFalsy();
    expect(root.childrenElement).toBeUndefined();

    expect(await root.openNode()).toBeTruthy();
    expect(root.childrenElement).toBeTruthy();
    expect(root.childrenElement.children.length).toEqual(3);
    expect(root.getOpenPaths()).toEqual([[]]);

    let stub = root.childrenElement.children[0] as JsonNodesStubElement;
    expect(stub.isNodeOpen()).toBeFalsy();

    expect(await stub.openNode()).toBeTruthy();
    expect(stub.childrenElement).toBeTruthy();
    expect(stub.childrenElement.children.length).toEqual(50);
    expect(root.getOpenPaths()).toEqual([['0']]);

    expect(await stub.closeNode()).toBeTruthy();
    expect(stub.childrenElement).toBeNull();
    expect(root.getOpenPaths()).toEqual([[]]);

    stub = root.childrenElement.children[2] as JsonNodesStubElement;
    expect(stub.isNodeOpen()).toBeFalsy();
    stub.querySelector('a').dispatchEvent(new MouseEvent('click'));
    await wait(1);
    expect(stub.childrenElement).toBeTruthy();
    expect(stub.childrenElement.children.length).toEqual(20);
    expect(root.getOpenPaths()).toEqual([['100']]);

    await root.closeNode();
    expect(root.getOpenPaths()).toEqual([]);

    const openedNode = await root.openPath(['61']);
    expect(openedNode).toBeTruthy();
    expect(openedNode.jsonNode.type).toEqual('boolean');
    expect(openedNode.jsonNode.path).toEqual(['61']);
    expect(root.getOpenPaths()).toEqual([['50']]);

    stub = root.childrenElement.children[0] as JsonNodesStubElement;
    expect(stub.isNodeOpen()).toBeFalsy();

    stub = root.childrenElement.children[1] as JsonNodesStubElement;
    expect(stub.isNodeOpen()).toBeTruthy();

    viewer.destroy();
  });
});

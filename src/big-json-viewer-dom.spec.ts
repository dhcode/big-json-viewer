import { BigJsonViewerDom, JsonNodeElement } from './big-json-viewer-dom';

describe('Big JSON Viewer', function() {
  it('should instantiate', async function() {
    const instance = await BigJsonViewerDom.fromData('{}');
    const root = instance.getRootElement();
    expect(root).toBeTruthy();
  });

  it('should create DOM from simple object', async function() {
    const instance = await BigJsonViewerDom.fromData('{"a":5, "b":true}');
    const root = instance.getRootElement();
    expect(root).toBeTruthy();
    await root.openAll();
    expect(root.getOpenPaths()).toEqual([[]]);

    expect(root.childrenElement).toBeTruthy();
    expect(root.childrenElement.children.length).toEqual(2);
  });

  it('should create DOM from more complex object', async function() {
    const data =
      '{"hello": "hello world, is a great world","test": [0,"old world",{"worldgame": true}]}';
    const instance = await BigJsonViewerDom.fromData(data);
    const root: JsonNodeElement = instance.getRootElement();
    expect(root).toBeTruthy();
    await root.openAll();
    expect(root.getOpenPaths()).toEqual([['test', '2']]);

    expect(root.childrenElement).toBeTruthy();
    expect(root.childrenElement.children.length).toEqual(2);

    await root.closeNode();

    expect(root.isNodeOpen()).toBeFalsy();

    const cursor = await root.openBySearch(/world/);
    expect(cursor).toBeTruthy();
    expect(cursor.matches.length).toEqual(4);
    expect(root.getOpenPaths()).toEqual([[]]);

    await cursor.next();
    expect(root.getOpenPaths()).toEqual([[]]);

    await cursor.next();
    expect(root.getOpenPaths()).toEqual([['test']]);
  });
});

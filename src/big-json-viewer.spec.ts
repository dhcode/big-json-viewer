import {BigJsonViewer} from './big-json-viewer';

describe('Big JSON Viewer', function () {
  it('should instantiate', function () {
    const instance = BigJsonViewer.elementFromData('{}');
    expect(instance).toBeTruthy();
  });

  it('should create DOM from simple object', function () {
    const instance = BigJsonViewer.elementFromData('{"a":5, "b":true}');
    expect(instance).toBeTruthy();
    instance.openAll();
    expect(instance.getOpenPaths()).toEqual([[]]);

    expect(instance.childrenElement).toBeTruthy();
    expect(instance.childrenElement.children.length).toEqual(2);


  });

  it('should create DOM from more complex object', function () {
    const data = '{"hello": "hello world, is a great world","test": [0,"old world",{"worldgame": true}]}';
    const instance = BigJsonViewer.elementFromData(data);
    expect(instance).toBeTruthy();
    instance.openAll();
    expect(instance.getOpenPaths()).toEqual([
      ['test', '2']
    ]);

    expect(instance.childrenElement).toBeTruthy();
    expect(instance.childrenElement.children.length).toEqual(2);

    instance.closeNode();

    const cursor = instance.openBySearch(/world/);
    expect(cursor).toBeTruthy();
    expect(cursor.matches.length).toEqual(4);
    expect(instance.getOpenPaths()).toEqual([[]]);

    cursor.next();
    expect(instance.getOpenPaths()).toEqual([[]]);

    cursor.next();
    expect(instance.getOpenPaths()).toEqual([['test']]);

  });

});


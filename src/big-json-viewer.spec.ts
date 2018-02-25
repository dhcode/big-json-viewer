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

});


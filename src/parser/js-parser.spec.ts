import { JsJsonNodeInfo, JsParser } from './js-parser';

describe('JS JSON Parser', function() {
  it('should handle undefined input', function() {
    const instance = new JsParser(undefined);
    const info = instance.getRootNodeInfo();
    expect(info).toBeNull();
  });

  it('should handle symbol with error', function() {
    const symbol = Symbol('a');
    const instance = new JsParser(symbol);
    expect(() => {
      const info = instance.getRootNodeInfo();
    }).toThrow();
  });

  it('should handle function with error', function() {
    const func = function() {};
    const instance = new JsParser(func);
    expect(() => {
      const info = instance.getRootNodeInfo();
    }).toThrow();
  });

  it('should handle empty object', function() {
    const instance = new JsParser({});
    const info = instance.getRootNodeInfo();
    expect(info.type).toEqual('object');
    expect(info.length).toEqual(0);
    expect(info.path.length).toEqual(0);

    const keys = info.getObjectKeys();
    expect(keys).toBeTruthy();
    expect(keys.length).toEqual(0);

    const nodes = info.getObjectNodes();
    expect(nodes).toBeTruthy();
    expect(nodes.length).toEqual(0);
  });

  it('should handle empty string', function() {
    const instance = new JsParser('');
    const info = instance.getRootNodeInfo();
    expect(info.type).toEqual('string');
    expect(info.length).toEqual(0);
    expect(info.path.length).toEqual(0);
    expect(info.getValue()).toEqual('');
  });

  it('should handle number', function() {
    const instance = new JsParser(43246);
    const info = instance.getRootNodeInfo();
    expect(info.type).toEqual('number');
    expect(info.path.length).toEqual(0);
    expect(info.getValue()).toEqual(43246);
  });

  it('should handle negative number', function() {
    const instance = new JsParser(-343);
    const info = instance.getRootNodeInfo();
    expect(info.type).toEqual('number');
    expect(info.path.length).toEqual(0);
    expect(info.getValue()).toEqual(-343);
  });

  it('should handle negative number with e', function() {
    const instance = new JsParser(-34e3);
    const info = instance.getRootNodeInfo();
    expect(info.type).toEqual('number');
    expect(info.path.length).toEqual(0);
    expect(info.getValue()).toEqual(-34e3);
  });

  it('should handle string', function() {
    const instance = new JsParser('abc');
    const info = instance.getRootNodeInfo();
    expect(info.type).toEqual('string');
    expect(info.length).toEqual(3);
    expect(info.path.length).toEqual(0);
    expect(info.getValue()).toEqual('abc');
  });

  it('should handle string with special chars', function() {
    const instance = new JsParser('abc\nxy\\z');
    const info = instance.getRootNodeInfo();
    expect(info.type).toEqual('string');
    expect(info.length).toEqual(8);
    expect(info.path.length).toEqual(0);
    expect(info.getValue()).toEqual('abc\nxy\\z');
  });

  it('should handle null', function() {
    const instance = new JsParser(null);
    const info = instance.getRootNodeInfo();
    expect(info.type).toEqual('null');
    expect(info.path.length).toEqual(0);
    expect(info.getValue()).toEqual(null);
  });

  it('should handle true', function() {
    const instance = new JsParser(true);
    const info = instance.getRootNodeInfo();
    expect(info.type).toEqual('boolean');
    expect(info.path.length).toEqual(0);
    expect(info.getValue()).toEqual(true);
  });

  it('should handle false', function() {
    const instance = new JsParser(false);
    const info = instance.getRootNodeInfo();
    expect(info.type).toEqual('boolean');
    expect(info.path.length).toEqual(0);
    expect(info.getValue()).toEqual(false);
  });

  it('should handle object with one key', function() {
    const instance = new JsParser({ key1: 'value1' });
    const info = instance.getRootNodeInfo();
    expect(info.type).toEqual('object');
    expect(info.length).toEqual(1);
    expect(info.path.length).toEqual(0);

    const keys = info.getObjectKeys();
    expect(keys).toBeTruthy();
    expect(keys.length).toEqual(1);
    expect(keys[0]).toEqual('key1');

    const nodes = info.getObjectNodes();
    expect(nodes).toBeTruthy();
    expect(nodes.length).toEqual(1);
    expectStringNode(nodes[0], 'value1', ['key1']);
  });

  it('should handle object with multi keys', function() {
    const instance = new JsParser({ key1: 'value1', key2: [] });
    const info = instance.getRootNodeInfo();
    expect(info.type).toEqual('object');
    expect(info.length).toEqual(2);
    expect(info.path.length).toEqual(0);

    const keys = info.getObjectKeys();
    expect(keys).toBeTruthy();
    expect(keys.length).toEqual(2);
    expect(keys[0]).toEqual('key1');
    expect(keys[1]).toEqual('key2');

    const nodes = info.getObjectNodes();
    expect(nodes).toBeTruthy();
    expect(nodes.length).toEqual(2);

    let node = nodes[0];
    expectStringNode(nodes[0], 'value1', ['key1']);

    node = nodes[1];
    expect(node.type).toEqual('array');
    expect(node.length).toEqual(0);
    expect(node.path.length).toEqual(1);
    expect(node.path[0]).toEqual('key2');

    node = info.getByKey('key1');
    expectStringNode(node, 'value1', ['key1']);
  });

  it('should handle empty array', function() {
    const instance = new JsParser([]);
    const info = instance.getRootNodeInfo();
    expect(info.type).toEqual('array');
    expect(info.length).toEqual(0);
    expect(info.path.length).toEqual(0);

    const nodes = info.getArrayNodes();
    expect(nodes.length).toEqual(0);
  });

  it('should handle array with elements', function() {
    const instance = new JsParser([0, 'ac']);
    const info = instance.getRootNodeInfo();
    expect(info.type).toEqual('array');
    expect(info.length).toEqual(2);
    expect(info.path.length).toEqual(0);

    const nodes = info.getArrayNodes();
    expect(nodes.length).toEqual(2);

    expectNumberNode(nodes[0], 0, ['0']);
    expectStringNode(nodes[1], 'ac', ['1']);
  });

  it('should handle array with tokens', function() {
    const instance = new JsParser([true, false, null]);
    const info = instance.getRootNodeInfo();
    expect(info.type).toEqual('array');
    expect(info.length).toEqual(3);
    expect(info.path.length).toEqual(0);

    const nodes = info.getArrayNodes();
    expect(nodes.length).toEqual(3);

    expect(nodes[0].type).toEqual('boolean');
    expect(nodes[0].getValue()).toEqual(true);
    expect(nodes[0].path.length).toEqual(1);

    expect(nodes[1].type).toEqual('boolean');
    expect(nodes[1].getValue()).toEqual(false);
    expect(nodes[1].path.length).toEqual(1);

    expect(nodes[2].type).toEqual('null');
    expect(nodes[2].getValue()).toEqual(null);
    expect(nodes[2].path.length).toEqual(1);
  });

  it('should handle array pagination', function() {
    const instance = new JsParser(['a', 'b', 'c', 'd', 'e']);
    const info = instance.getRootNodeInfo();
    expect(info.type).toEqual('array');
    expect(info.length).toEqual(5);

    let nodes = info.getArrayNodes(1, 2);
    expect(nodes.length).toEqual(2);
    expectStringNode(nodes[0], 'b', ['1']);
    expectStringNode(nodes[1], 'c', ['2']);

    nodes = info.getArrayNodes(0, 1);
    expect(nodes.length).toEqual(1);
    expectStringNode(nodes[0], 'a', ['0']);

    nodes = info.getArrayNodes(3, 4);
    expect(nodes.length).toEqual(2);
    expectStringNode(nodes[0], 'd', ['3']);
    expectStringNode(nodes[1], 'e', ['4']);

    const node = info.getByIndex(1);
    expectStringNode(node, 'b', ['1']);
  });

  it('should handle object pagination', function() {
    const instance = new JsParser({ a: 'A', b: 'B', c: 'C', d: 'D' });
    const info = instance.getRootNodeInfo();
    expect(info.type).toEqual('object');
    expect(info.length).toEqual(4);

    let keys = info.getObjectKeys(1, 2);
    expect(keys.length).toEqual(2);
    expect(keys[0]).toEqual('b');
    expect(keys[1]).toEqual('c');

    keys = info.getObjectKeys(3, 5);
    expect(keys.length).toEqual(1);
    expect(keys[0]).toEqual('d');

    const nodes = info.getObjectNodes(2, 5);
    expect(nodes.length).toEqual(2);
    expectStringNode(nodes[0], 'C', ['c']);
    expectStringNode(nodes[1], 'D', ['d']);

    const node = info.getByIndex(1);
    expectStringNode(node, 'B', ['b']);
  });

  it('should handle nested objects', function() {
    const instance = new JsParser({ a: { b: { c: true, d: 'D' } } });
    const info = instance.getRootNodeInfo();
    expect(info.type).toEqual('object');
    expect(info.length).toEqual(1);

    let nodes = info.getObjectNodes();
    let node = nodes[0];
    expect(node.type).toEqual('object');
    expect(node.length).toEqual(1);
    expect(node.path.length).toEqual(1);
    expect(node.path[0]).toEqual('a');

    nodes = node.getObjectNodes();
    node = nodes[0];
    expect(node.type).toEqual('object');
    expect(node.length).toEqual(2);
    expect(node.path.length).toEqual(2);
    expect(node.path[0]).toEqual('a');
    expect(node.path[1]).toEqual('b');

    nodes = node.getObjectNodes();
    node = nodes[0];
    expect(node.type).toEqual('boolean');
    expect(node.path.length).toEqual(3);
    expect(node.path[0]).toEqual('a');
    expect(node.path[1]).toEqual('b');
    expect(node.path[2]).toEqual('c');
    expect(node.getValue()).toEqual(true);

    node = info.getByPath('a.b.d'.split('.'));
    expectStringNode(node, 'D', ['a', 'b', 'd']);

    expect(info.getByPath('a.b.e'.split('.'))).toBeUndefined();
    expect(info.getByPath([])).toEqual(info);
  });
});

function expectStringNode(node: JsJsonNodeInfo, value: string, path: string[]) {
  expect(node.type).toEqual('string');
  expect(node.length).toEqual(value.length);
  expect(node.path.length).toEqual(path.length);
  for (let i = 0; i < path.length; i++) {
    expect(node.path[i]).toEqual(path[i]);
  }
  expect(node.getValue()).toEqual(value);
}

function expectNumberNode(node: JsJsonNodeInfo, value: number, path: string[]) {
  expect(node.type).toEqual('number');
  expect(node.path.length).toEqual(path.length);
  for (let i = 0; i < path.length; i++) {
    expect(node.path[i]).toEqual(path[i]);
  }
  expect(node.getValue()).toEqual(value);
}

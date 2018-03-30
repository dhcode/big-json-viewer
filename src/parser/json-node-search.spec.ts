import { BufferJsonParser } from './buffer-json-parser';
import { searchJsonNodes } from './json-node-search';
import { TreeSearchMatch } from '../';

describe('JSON Node Search', function() {
  it('should find results', function() {
    const instance = new BufferJsonParser(
      '{"a": "A", "b": "B", "c": "C", "d": "D"}'
    );
    const rootNode = instance.getRootNodeInfo();
    const pattern = /b/;

    let results = searchJsonNodes(rootNode, pattern);
    expect(results.length).toEqual(1);
    expectKeyResult(results[0], ['b'], 0, 1);

    results = searchJsonNodes(rootNode, /D/);
    expect(results.length).toEqual(1);
    expectValueResult(results[0], ['d'], 0, 1);
  });

  it('should find multiple results', function() {
    const instance = new BufferJsonParser(
      '{"hello": "hello world, is a great world","test": [0,"old world",{"worldgame": true}]}'
    );
    const rootNode = instance.getRootNodeInfo();
    const pattern = /world/;

    let results = searchJsonNodes(rootNode, pattern);
    expect(results.length).toEqual(4);
    expectValueResult(results[0], ['hello'], 6, 5);
    expectValueResult(results[1], ['hello'], 24, 5);
    expectValueResult(results[2], ['test', '1'], 4, 5);
    expectKeyResult(results[3], ['test', '2', 'worldgame'], 0, 5);
  });
});

function expectKeyResult(
  result: TreeSearchMatch,
  path: string[],
  index: number,
  length: number
) {
  expect(result.path).toEqual(path);
  expect(result.key).toEqual(index);
  expect(result.value).toBeUndefined();
  expect(result.length).toEqual(length);
}
function expectValueResult(
  result: TreeSearchMatch,
  path: string[],
  index: number,
  length: number
) {
  expect(result.path).toEqual(path);
  expect(result.key).toBeUndefined();
  expect(result.value).toEqual(index);
  expect(result.length).toEqual(length);
}

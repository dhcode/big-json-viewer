import {JsonNodeInfo} from './json-node-info';

export type TreeSearchAreaOption = 'all' // search in keys and values
  | 'keys' // search only in keys
  | 'values'; // search only in values

export interface TreeSearchMatch {
  path: string[];
  key?: number; // if the match was in the key, at which index
  value?: number; // if the match was in the value, at which index
  length: number; // length of the match
}

export function searchJsonNodes(node: JsonNodeInfo, pattern: RegExp, searchArea: TreeSearchAreaOption): TreeSearchMatch[] {
  const results: TreeSearchMatch[] = [];
  if (node.path.length && (searchArea === 'all' || searchArea === 'keys')) {
    forEachMatchFromString(pattern, node.path[node.path.length - 1], (index, length) => {
      results.push({path: node.path, key: index, length: length});
    });
  }
  if (node.type === 'object') {
    node.getObjectNodes().forEach(subNode => {
      results.push(...searchJsonNodes(subNode, pattern, searchArea));
    });
  } else if (node.type === 'array') {
    node.getArrayNodes().forEach(subNode => {
      results.push(...searchJsonNodes(subNode, pattern, searchArea));
    });
  } else if (searchArea === 'all' || searchArea === 'values') {
    forEachMatchFromString(pattern, String(node.getValue()), (index, length) => {
      results.push({path: node.path, value: index, length: length});
    });
  }

  return results;
}

export function forEachMatchFromString(pattern: RegExp, subject: string, callback: (i: number, length: number) => void) {
  const iterPattern = new RegExp(pattern, 'g');
  let match = null;
  while ((match = iterPattern.exec(subject)) !== null) {
    callback(match.index, match[0].length);
  }
}

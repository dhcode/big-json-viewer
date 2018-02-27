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

export function searchJsonNodes(node: JsonNodeInfo, pattern: RegExp, searchArea: TreeSearchAreaOption = 'all'): TreeSearchMatch[] {
  pattern = ensureGlobal(pattern);
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
  pattern = ensureGlobal(pattern);
  pattern.lastIndex = 0;
  let match = null;
  while ((match = pattern.exec(subject)) !== null) {
    callback(match.index, match[0].length);
  }
  pattern.lastIndex = 0;
}

function ensureGlobal(pattern: RegExp): RegExp {
  if (!pattern.global) {
    const flags = 'g' + (pattern.ignoreCase ? 'i' : '') + (pattern.multiline ? 'm' : '');
    return new RegExp(pattern.source, flags);
  }
  return pattern;
}

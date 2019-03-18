import { JsonNodeInfo, NodeType } from './json-node-info';
import { assertStartLimit } from '../helpers/utils';

export class JsJsonNodeInfo implements JsonNodeInfo {
  public type: NodeType;
  public path: string[] = [];
  public length?: number; // in case of array, object, string
  private readonly ref: any;

  constructor(ref: any, path: string[]) {
    this.ref = ref;
    this.path = path;
    const jsType = typeof ref;
    if (jsType === 'undefined') {
      this.type = 'undefined';
    }
    if (jsType === 'symbol') {
      this.type = 'symbol';
    }
    if (jsType === 'function') {
      this.type = 'function';
    }
    if (jsType === 'object' && ref === null) {
      this.type = 'null';
    } else if (jsType === 'object' && Array.isArray(ref)) {
      this.type = 'array';
    } else {
      this.type = jsType;
    }

    if (this.type === 'object') {
      this.length = Object.keys(ref).length;
    }
    if (this.type === 'array' || this.type === 'string') {
      this.length = ref.length;
    }
  }

  /**
   * Returns the list of keys in case of an object for the defined range
   * @param {number} start
   * @param {number} limit
   */
  public getObjectKeys(start = 0, limit?: number): string[] {
    if (this.type !== 'object') {
      throw new Error(`Unsupported method on non-object ${this.type}`);
    }
    assertStartLimit(start, limit);
    const keys = Object.keys(this.ref);
    if (limit) {
      return keys.slice(start, start + limit);
    }
    return keys.slice(start);
  }

  /**
   * Return the NodeInfo at the defined position.
   * Use the index from getObjectKeys
   * @param index
   */
  public getByIndex(index: number): JsJsonNodeInfo {
    if (this.type === 'object') {
      const nodes = this.getObjectNodes(index, 1);
      if (nodes.length) {
        return nodes[0];
      }
    }
    if (this.type === 'array') {
      const nodes = this.getArrayNodes(index, 1);
      if (nodes.length) {
        return nodes[0];
      }
    }
    return undefined;
  }

  /**
   * Return the NodeInfo for the specified key
   * Use the index from getObjectKeys
   * @param key
   */
  public getByKey(key: string): JsJsonNodeInfo {
    if (this.type === 'object' && this.ref.hasOwnProperty(key)) {
      return new JsJsonNodeInfo(this.ref[key], [...this.path, key]);
    }
    if (this.type === 'array') {
      return this.getByIndex(parseInt(key));
    }
    return undefined;
  }

  /**
   * Find the information for a given path
   * @param {string[]} path
   */
  public getByPath(path: string[]): JsJsonNodeInfo {
    if (!path) {
      return undefined;
    }
    if (!path.length) {
      return this;
    }
    const p = path.slice();
    let key: string;
    let node: JsJsonNodeInfo = this;
    while ((key = p.shift()) !== undefined && node) {
      node = node.getByKey(key);
    }
    return node;
  }

  /**
   * Returns a list with the NodeInfo objects for the defined range
   * @param {number} start
   * @param {number} limit
   */
  public getObjectNodes(start = 0, limit?: number): JsJsonNodeInfo[] {
    if (this.type !== 'object') {
      throw new Error(`Unsupported method on non-object ${this.type}`);
    }
    assertStartLimit(start, limit);
    const nodes = {};
    return this.getObjectKeys(start, limit).map(
      key => new JsJsonNodeInfo(this.ref[key], [...this.path, key])
    );
  }

  /**
   * Returns a list of NodeInfo for the defined range
   * @param {number} start
   * @param {number} limit
   */
  public getArrayNodes(start = 0, limit?: number): JsJsonNodeInfo[] {
    if (this.type !== 'array') {
      throw new Error(`Unsupported method on non-array ${this.type}`);
    }
    assertStartLimit(start, limit);
    const elements = limit
      ? this.ref.slice(start, start + limit)
      : this.ref.slice(start);
    return elements.map(
      (ref, i) => new JsJsonNodeInfo(ref, [...this.path, String(start + i)])
    );
  }

  /**
   * Get the natively parsed value
   */
  public getValue(): any {
    return this.ref;
  }
}

export class JsParser {
  data: any;

  constructor(data: any) {
    this.data = data;
  }

  getRootNodeInfo(): JsJsonNodeInfo {
    if (this.data === undefined) {
      return null;
    }
    return new JsJsonNodeInfo(this.data, []);
  }
}

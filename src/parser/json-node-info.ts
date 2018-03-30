export type NodeType =
  | 'string'
  | 'number'
  | 'array'
  | 'object'
  | 'boolean'
  | 'null';

export interface JsonNodeInfoBase {
  readonly type: NodeType;
  readonly path: string[];
  readonly length?: number; // in case of array, object, string
}

export interface JsonNodeInfo extends JsonNodeInfoBase {
  /**
   * Returns the list of keys in case of an object for the defined range
   * @param {number} start
   * @param {number} limit
   */
  getObjectKeys(start?: number, limit?: number): string[];

  /**
   * Return the NodeInfo at the defined position.
   * Use the index from getObjectKeys
   * @param index
   */
  getByIndex(index: number): JsonNodeInfo;

  /**
   * Return the NodeInfo for the specified key
   * Use the index from getObjectKeys
   * @param key
   */
  getByKey(key: string): JsonNodeInfo;

  /**
   * Find the information for a given path
   * @param {string[]} path
   * @returns {BufferJsonNodeInfo}
   */
  getByPath(path: string[]): JsonNodeInfo;

  /**
   * Returns a map with the NodeInfo objects for the defined range
   * @param {number} start
   * @param {number} limit
   */
  getObjectNodes(start?: number, limit?: number): JsonNodeInfo[];

  /**
   * Returns a list of NodeInfo for the defined range
   * @param {number} start
   * @param {number} limit
   */
  getArrayNodes(start?: number, limit?: number): JsonNodeInfo[];

  /**
   * Get the natively parsed value
   */
  getValue(): any;
}

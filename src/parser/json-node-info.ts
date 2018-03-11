export type NodeType = 'string' | 'number' | 'array' | 'object' | 'boolean' | 'null';

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

  /**
   * Gets the base info about the node
   */
  getInfo(): JsonNodeInfoBase;
}

export const JsonNodeInfoArrayMethods = ['getObjectNodes', 'getArrayNodes'];
export const JsonNodeInfoMethods = ['getByIndex', 'getByKey', 'getByPath'];

export interface AsyncJsonNodeInfo extends JsonNodeInfoBase {
  /**
   * Returns the list of keys in case of an object for the defined range
   * @param {number} start
   * @param {number} limit
   */
  getObjectKeys(start?: number, limit?: number): Promise<string[]>;

  /**
   * Return the NodeInfo at the defined position.
   * Use the index from getObjectKeys
   * @param index
   */
  getByIndex(index: number): Promise<AsyncJsonNodeInfo>;

  /**
   * Return the NodeInfo for the specified key
   * Use the index from getObjectKeys
   * @param key
   */
  getByKey(key: string): Promise<AsyncJsonNodeInfo>;

  /**
   * Find the information for a given path
   * @param {string[]} path
   * @returns {BufferJsonNodeInfo}
   */
  getByPath(path: string[]): Promise<AsyncJsonNodeInfo>;

  /**
   * Returns a map with the NodeInfo objects for the defined range
   * @param {number} start
   * @param {number} limit
   */
  getObjectNodes(start?: number, limit?: number): Promise<AsyncJsonNodeInfo[]>;

  /**
   * Returns a list of NodeInfo for the defined range
   * @param {number} start
   * @param {number} limit
   */
  getArrayNodes(start?: number, limit?: number): Promise<AsyncJsonNodeInfo[]>;

  /**
   * Get the natively parsed value
   */
  getValue(): Promise<any>;
}

export class AsyncJsonNodeInfoProxy implements AsyncJsonNodeInfo {
  type: NodeType;
  path: string[];
  length?: number;

  constructor(private nodeInfo: JsonNodeInfo) {
    this.type = this.nodeInfo.type;
    this.path = this.nodeInfo.path;
    this.length = this.nodeInfo.length;
  }

  getObjectKeys(start?: number, limit?: number): Promise<string[]> {
    return this.promiseCall('getObjectKeys', start, limit);
  }

  getByIndex(index: number): Promise<AsyncJsonNodeInfo> {
    return this.promiseCall('getByIndex', index);
  }

  getByKey(key: string): Promise<AsyncJsonNodeInfo> {
    return this.promiseCall('getByKey', key);
  }

  getByPath(path: string[]): Promise<AsyncJsonNodeInfo> {
    return this.promiseCall('getByPath', path);
  }

  getObjectNodes(start?: number, limit?: number): Promise<AsyncJsonNodeInfo[]> {
    return this.promiseCall('getObjectNodes', start, limit);
  }

  getArrayNodes(start?: number, limit?: number): Promise<AsyncJsonNodeInfo[]> {
    return this.promiseCall('getArrayNodes', start, limit);
  }

  getValue(): Promise<any> {
    return this.promiseCall('getValue');
  }

  private promiseCall(method, ...args): Promise<any> {
    return new Promise(resolve => {
      resolve(this.nodeInfo[method].apply(this.nodeInfo, args));
    });
  }
}

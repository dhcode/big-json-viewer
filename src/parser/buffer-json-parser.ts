import { JsonNodeInfo, NodeType } from './json-node-info';

const BRACE_START = '{'.charCodeAt(0);
const BRACE_END = '}'.charCodeAt(0);
const BRACKET_START = '['.charCodeAt(0);
const BRACKET_END = ']'.charCodeAt(0);
const COLON = ':'.charCodeAt(0);
const COMMA = ','.charCodeAt(0);
const DOUBLE_QUOTE = '"'.charCodeAt(0);
const SINGLE_QUOTE = '\''.charCodeAt(0);
const SPACE = ' '.charCodeAt(0);
const TAB = '\t'.charCodeAt(0);
const NEWLINE = '\n'.charCodeAt(0);
const BACKSPACE = '\b'.charCodeAt(0);
const CARRIAGE_RETURN = '\r'.charCodeAt(0);
const FORM_FEED = '\f'.charCodeAt(0);
const BACK_SLASH = '\\'.charCodeAt(0);
const FORWARD_SLASH = '/'.charCodeAt(0);
const MINUS = '-'.charCodeAt(0);
const PLUS = '+'.charCodeAt(0);
const DOT = '.'.charCodeAt(0);
const CHAR_E_LOW = 'e'.charCodeAt(0);
const CHAR_E_HIGH = 'E'.charCodeAt(0);
const DIGIT_0 = '0'.charCodeAt(0);
const DIGIT_9 = '9'.charCodeAt(0);

const IGNORED = [SPACE, TAB, NEWLINE, CARRIAGE_RETURN];

const NULL = 'null'.split('').map(d => d.charCodeAt(0));
const TRUE = 'true'.split('').map(d => d.charCodeAt(0));
const FALSE = 'false'.split('').map(d => d.charCodeAt(0));

export interface ParseContext {
  path: string[];
  start?: number;
  limit?: number;
  objectKey?: string;
  objectKeys?: string[]; // truthy if keys should be resolved
  objectNodes?: BufferJsonNodeInfo[]; // truthy if nodes should be resolved
  arrayNodes?: BufferJsonNodeInfo[]; // truthy if nodes should be resolved
  value?: string | number | boolean; // truthy if value should be resolved
  nodeInfo?: BufferJsonNodeInfo; // truthy if node info should be filled
}

export class BufferJsonNodeInfo implements JsonNodeInfo {
  public type: NodeType;
  public path: string[] = [];
  public length?: number; // in case of array, object, string
  public chars: number;
  private parser: BufferJsonParser;
  private index;

  constructor(parser: BufferJsonParser, index: number, path: string[]) {
    this.parser = parser;
    this.index = index;
    this.path = path;
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
    const ctx: ParseContext = {
      path: this.path,
      objectKeys: [],
      start: start,
      limit: limit
    };
    this.parser.parseObject(this.index, ctx);
    return ctx.objectKeys;
  }

  /**
   * Return the NodeInfo at the defined position.
   * Use the index from getObjectKeys
   * @param index
   */
  public getByIndex(index: number): BufferJsonNodeInfo {
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
  public getByKey(key: string): BufferJsonNodeInfo {
    if (this.type === 'object') {
      const ctx: ParseContext = {
        path: this.path,
        objectKey: key
      };
      this.parser.parseObject(this.index, ctx);
      return ctx.objectNodes ? ctx.objectNodes[0] : undefined;
    }
    if (this.type === 'array') {
      return this.getByIndex(parseInt(key));
    }
    return undefined;
  }

  /**
   * Find the information for a given path
   * @param {string[]} path
   * @returns {BufferJsonNodeInfo}
   */
  public getByPath(path: string[]): BufferJsonNodeInfo {
    if (!path) {
      return undefined;
    }
    if (!path.length) {
      return this;
    }
    const p = path.slice();
    let key: string;
    let node: BufferJsonNodeInfo = this;
    while ((key = p.shift()) !== undefined && node) {
      node = node.getByKey(key);
    }
    return node;
  }

  /**
   * Returns a map with the NodeInfo objects for the defined range
   * @param {number} start
   * @param {number} limit
   */
  public getObjectNodes(start = 0, limit?: number): BufferJsonNodeInfo[] {
    if (this.type !== 'object') {
      throw new Error(`Unsupported method on non-object ${this.type}`);
    }
    assertStartLimit(start, limit);
    const ctx: ParseContext = {
      path: this.path,
      objectNodes: [],
      start: start,
      limit: limit
    };
    this.parser.parseObject(this.index, ctx);
    return ctx.objectNodes;
  }

  /**
   * Returns a list of NodeInfo for the defined range
   * @param {number} start
   * @param {number} limit
   */
  public getArrayNodes(start = 0, limit?: number): BufferJsonNodeInfo[] {
    if (this.type !== 'array') {
      throw new Error(`Unsupported method on non-array ${this.type}`);
    }
    assertStartLimit(start, limit);
    const ctx: ParseContext = {
      path: this.path,
      arrayNodes: [],
      start: start,
      limit: limit
    };
    this.parser.parseArray(this.index, ctx);
    return ctx.arrayNodes;
  }

  /**
   * Get the natively parsed value
   */
  public getValue(): any {
    return this.parser.parseNative(this.index, this.index + this.chars);
  }
}

declare const TextEncoder;

/**
 * Parses meta data about a JSON structure in an ArrayBuffer.
 */
export class BufferJsonParser {
  data: Uint16Array;

  constructor(data: ArrayBuffer | string) {
    if (data instanceof ArrayBuffer) {
      this.data = new Uint16Array(data);
    } else if (typeof data === 'string' && typeof TextEncoder !== 'undefined') {
      this.data = new TextEncoder().encode(data);
    } else if (typeof data === 'string') {
      this.data = new Uint16Array(new ArrayBuffer(data.length * 2));
      for (let i = 0; i < data.length; i++) {
        this.data[i] = data.charCodeAt(i);
      }
    }
  }

  getRootNodeInfo(): BufferJsonNodeInfo {
    let start = this.skipIgnored(0);

    const ctx: ParseContext = {
      path: [],
      nodeInfo: new BufferJsonNodeInfo(this, start, [])
    };

    const end = this.parseValue(start, ctx, false);
    if (start === end) {
      return null;
    }
    return ctx.nodeInfo;
  }

  parseValue(start: number, ctx?: ParseContext, throwUnknown = true): number {
    const char = this.data[start];
    if (isString(char)) {
      return this.parseString(start, ctx);
    }
    if (isNumber(char)) {
      return this.parseNumber(start, ctx);
    }
    if (char === BRACE_START) {
      return this.parseObject(start, ctx);
    }
    if (char === BRACKET_START) {
      return this.parseArray(start, ctx);
    }
    if (char === TRUE[0]) {
      return this.parseToken(start, TRUE, ctx);
    }
    if (char === FALSE[0]) {
      return this.parseToken(start, FALSE, ctx);
    }
    if (char === NULL[0]) {
      return this.parseToken(start, NULL, ctx);
    }

    if (throwUnknown) {
      throw new Error(
        `parse value unknown token ${bufToString(char)} at ${start}`
      );
    }

    function isString(char) {
      return char === DOUBLE_QUOTE || char === SINGLE_QUOTE;
    }

    function isNumber(char) {
      return char === MINUS || (char >= DIGIT_0 && char <= DIGIT_9);
    }
  }

  parseObject(start: number, ctx?: ParseContext): number {
    let index = start + 1; // skip the start brace

    let length = 0;
    const keys = [];
    const nodes = [];

    while (index <= this.data.length) {
      if (index === this.data.length) {
        throw new Error(`parse object incomplete at end`);
      }
      index = this.skipIgnored(index);
      if (this.data[index] === BRACE_END) {
        index++;
        break;
      }
      const keyCtx = getKeyContext(length);
      index = this.parseString(index, keyCtx);

      if (keyCtx && ctx && ctx.objectKeys) {
        keys.push(keyCtx.value);
      }

      index = this.skipIgnored(index);
      if (this.data[index] !== COLON) {
        throw new Error(
          `parse object unexpected token ${bufToString(
            this.data[index]
          )} at ${index}. Expected :`
        );
      } else {
        index++;
      }

      index = this.skipIgnored(index);

      let valueCtx: ParseContext = null;
      if (
        keyCtx &&
        ctx &&
        (ctx.objectNodes || keyCtx.value === ctx.objectKey)
      ) {
        valueCtx = {
          path: ctx.path,
          nodeInfo: new BufferJsonNodeInfo(this, index, [
            ...ctx.path,
            keyCtx.value as string
          ])
        };
      }

      index = this.parseValue(index, valueCtx);
      index = this.skipIgnored(index);

      if (valueCtx && ctx.objectNodes) {
        nodes.push(valueCtx.nodeInfo);
      } else if (valueCtx && ctx.objectKey !== undefined) {
        ctx.objectNodes = [valueCtx.nodeInfo];
        return;
      }

      length++;

      if (this.data[index] === COMMA) {
        index++;
      } else if (this.data[index] !== BRACE_END) {
        throw new Error(
          `parse object unexpected token ${bufToString(
            this.data[index]
          )} at ${index}. Expected , or }`
        );
      }
    }

    if (ctx && ctx.nodeInfo) {
      ctx.nodeInfo.type = 'object';
      ctx.nodeInfo.length = length;
      ctx.nodeInfo.chars = index - start;
    }
    if (ctx && ctx.objectKeys) {
      ctx.objectKeys = keys;
    }
    if (ctx && ctx.objectNodes) {
      ctx.objectNodes = nodes;
    }

    function getKeyContext(keyIndex): ParseContext {
      if (
        !ctx ||
        (ctx.start && keyIndex < ctx.start) ||
        (ctx.limit && keyIndex >= ctx.start + ctx.limit)
      ) {
        return null;
      }
      if (
        ctx &&
        (ctx.objectKeys || ctx.objectNodes || ctx.objectKey !== undefined)
      ) {
        return {
          path: ctx.path,
          value: null
        };
      }
      return null;
    }

    return index;
  }

  parseArray(start: number, ctx?: ParseContext): number {
    let index = start + 1; // skip the start bracket
    let length = 0;
    while (index <= this.data.length) {
      if (index === this.data.length) {
        throw new Error(`parse array incomplete at end`);
      }
      index = this.skipIgnored(index);
      if (this.data[index] === BRACKET_END) {
        index++;
        break;
      }

      let valueCtx: ParseContext = null;
      if (isInRange(length) && ctx.arrayNodes) {
        valueCtx = {
          path: ctx.path,
          nodeInfo: new BufferJsonNodeInfo(this, index, [
            ...ctx.path,
            length.toString()
          ])
        };
      }

      index = this.parseValue(index, valueCtx);

      if (valueCtx) {
        ctx.arrayNodes.push(valueCtx.nodeInfo);
      }

      index = this.skipIgnored(index);

      length++;

      if (this.data[index] === COMMA) {
        index++;
      } else if (this.data[index] !== BRACKET_END) {
        throw new Error(
          `parse array unexpected token ${bufToString(
            this.data[index]
          )} at ${index}. Expected , or ]`
        );
      }
    }

    if (ctx && ctx.nodeInfo) {
      ctx.nodeInfo.type = 'array';
      ctx.nodeInfo.length = length;
      ctx.nodeInfo.chars = index - start;
    }

    function isInRange(keyIndex): boolean {
      return !(
        !ctx ||
        (ctx.start && keyIndex < ctx.start) ||
        (ctx.limit && keyIndex >= ctx.start + ctx.limit)
      );
    }

    return index;
  }

  parseString(start: number, ctx?: ParseContext): number {
    let index = start;
    const expect =
      this.data[index] === DOUBLE_QUOTE ? DOUBLE_QUOTE : SINGLE_QUOTE;
    let esc = false,
      length = 0;
    for (index++; index <= this.data.length; index++) {
      if (index === this.data.length) {
        throw new Error(`parse string incomplete at end`);
      }
      if (!esc && this.data[index] === expect) {
        index++;
        break;
      }
      if (this.data[index] === BACK_SLASH) {
        esc = !esc;
      } else {
        esc = false;
      }
      if (!esc) {
        length++;
      }
    }
    if (ctx && ctx.nodeInfo) {
      ctx.nodeInfo.type = 'string';
      ctx.nodeInfo.length = length;
      ctx.nodeInfo.chars = index - start;
    }
    if (ctx && ctx.value !== undefined) {
      ctx.value = JSON.parse(bufToString(this.data.subarray(start, index)));
    }
    return index;
  }

  parseNumber(start: number, ctx?: ParseContext): number {
    let i = start;
    if (this.data[i] === MINUS) {
      i++;
    }
    i = this.parseDigits(i);
    if (this.data[i] === DOT) {
      i++;
      i = this.parseDigits(i);
    }
    if (this.data[i] === CHAR_E_HIGH || this.data[i] === CHAR_E_LOW) {
      i++;
      if (this.data[i] === PLUS || this.data[i] === MINUS) {
        i++;
      }
      i = this.parseDigits(i);
    }
    if (ctx && ctx.nodeInfo) {
      ctx.nodeInfo.type = 'number';
      ctx.nodeInfo.chars = i - start;
    }
    if (ctx && ctx.value !== undefined) {
      ctx.value = JSON.parse(bufToString(this.data.subarray(start, i)));
    }
    return i;
  }

  private parseDigits(start: number): number {
    while (this.data[start] >= DIGIT_0 && this.data[start] <= DIGIT_9) {
      start++;
    }
    return start;
  }

  parseToken(start, chars, ctx?: ParseContext): number {
    let index = start;
    for (let i = 0; i < chars.length; i++) {
      if (this.data[index] !== chars[i]) {
        throw new Error(
          `Unexpected token ${bufToString(
            this.data[index]
          )} at ${index}. Expected ${bufToString(chars)}`
        );
      }
      index++;
    }
    const token = bufToString(this.data.subarray(start, index));
    if (ctx && ctx.nodeInfo) {
      if (token === 'null') {
        ctx.nodeInfo.type = 'null';
      } else {
        ctx.nodeInfo.type = 'boolean';
      }
      ctx.nodeInfo.chars = index - start;
    }
    if (ctx && ctx.value !== undefined) {
      ctx.value = JSON.parse(token);
    }
    return index;
  }

  parseNative(start, end) {
    return JSON.parse(bufToString(this.data.subarray(start, end)));
  }

  private skipIgnored(start: number) {
    for (let i = start; i < this.data.length; i++) {
      if (IGNORED.indexOf(this.data[i]) !== -1) {
        continue;
      }
      return i;
    }
  }
}

function bufToString(buf: number | number[] | Uint16Array) {
  if (typeof buf === 'number') {
    buf = [buf];
  }
  return String.fromCharCode.apply(null, buf);
}

function assertStartLimit(start, limit) {
  if (isNaN(start) || start < 0) {
    throw new Error(`Invalid start ${start}`);
  }
  if (limit && limit < 0) {
    throw new Error(`Invalid limit ${limit}`);
  }
}

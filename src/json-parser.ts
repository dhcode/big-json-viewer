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

const IGNORED = [SPACE, TAB, NEWLINE, CARRIAGE_RETURN];
const DIGIT = '0123456789'.split('').map(d => d.charCodeAt(0));
const NULL = 'null'.split('').map(d => d.charCodeAt(0));
const TRUE = 'true'.split('').map(d => d.charCodeAt(0));
const FALSE = 'false'.split('').map(d => d.charCodeAt(0));

function bufToString(buf: number | number[] | Uint16Array) {
    if (typeof(buf) === 'number') {
        buf = [buf];
    }
    return String.fromCharCode.apply(null, buf);
}


export type NodeType = 'string' | 'number' | 'array' | 'object' | 'boolean' | 'null';
const valueTypes = ['string', 'number', 'boolean', 'null'];

export interface ParseContext {
    path: string[];
    start?: number;
    limit?: number;
    objectKeys?: string[]; // truthy if keys should be resolved
    objectNodes?: { [key: string]: JsonNodeInfo }; // truthy if nodes should be resolved
    arrayNodes?: JsonNodeInfo[]; // truthy if nodes should be resolved
    value?: string | number | boolean; // truthy if value should be resolved
    nodeInfo?: JsonNodeInfo;  // truthy if node info should be filled
}

export class JsonNodeInfo {
    public type: NodeType;
    public path: string[] = [];
    public length?: number; // in case of array, object, string
    public chars: number;
    private parser: JsonParser;
    private index;

    constructor(parser: JsonParser, index: number, path: string[]) {
        this.parser = parser;
        this.index = index;
        this.path = path;
    }

    // in case of an object
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

    // in case of an object
    public getObjectNodes(start = 0, limit?: number): { [key: string]: JsonNodeInfo } {
        if (this.type !== 'object') {
            throw new Error(`Unsupported method on non-object ${this.type}`);
        }
        assertStartLimit(start, limit);
        const ctx: ParseContext = {
            path: this.path,
            objectNodes: {},
            start: start,
            limit: limit
        };
        this.parser.parseObject(this.index, ctx);
        return ctx.objectNodes;
    }

    // in case of an array
    public getArrayNodes(start = 0, limit?: number): JsonNodeInfo[] {
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

    // in case of string, number, boolean
    public getValue(): string | number | boolean | null {
        if (valueTypes.indexOf(this.type) === -1) {
            return undefined;
        }
        const ctx: ParseContext = {
            path: this.path,
            value: null
        };
        this.parser.parseValue(this.index, ctx);
        return ctx.value;
    }
}


export class JsonParser {
    data: Uint16Array;

    constructor(data: ArrayBuffer | string) {
        if (data instanceof ArrayBuffer) {
            this.data = new Uint16Array(data);
        } else if (typeof(data) === 'string') {
            this.data = new Uint16Array(new ArrayBuffer(data.length * 2));
            for (let i = 0; i < data.length; i++) {
                this.data[i] = data.charCodeAt(i);
            }
        }
    }

    /**
     * Returns information on the node at start
     */
    getRootNodeInfo(): JsonNodeInfo {
        let start = this.skipIgnored(0);

        const ctx: ParseContext = {
            path: [],
            nodeInfo: new JsonNodeInfo(this, start, [])
        };

        const end = this.parseValue(start, ctx);
        if (start === end) {
            return null;
        }
        return ctx.nodeInfo;
    }

    parseValue(start: number, ctx?: ParseContext): number {
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

        function isString(char) {
            return char === DOUBLE_QUOTE || char === SINGLE_QUOTE;
        }

        function isNumber(char) {
            return char === MINUS || DIGIT.indexOf(char) !== -1;
        }
    }


    parseObject(start: number, ctx?: ParseContext): number {
        let index = start + 1; // skip the start brace

        let length = 0;
        const keys = [];
        const dataMap = {};

        while (index < this.data.length) {
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
                throw new Error(`parse object unexpected token ${bufToString(this.data[index])} at ${index}. Expected :`);
            } else {
                index++;
            }

            index = this.skipIgnored(index);

            let valueCtx: ParseContext = null;
            if (keyCtx && ctx && ctx.objectNodes) {
                valueCtx = {
                    path: ctx.path,
                    nodeInfo: new JsonNodeInfo(this, index, [...ctx.path, keyCtx.value as string])
                };
            }

            index = this.parseValue(index, valueCtx);
            index = this.skipIgnored(index);

            if (valueCtx) {
                dataMap[keyCtx.value as string] = valueCtx.nodeInfo;
            }

            length++;

            if (this.data[index] === COMMA) {
                index++;
            } else if (this.data[index] !== BRACE_END) {
                throw new Error(`parse object unexpected token ${bufToString(this.data[index])} at ${index}. Expected , or }`);
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
            ctx.objectNodes = dataMap;
        }

        function getKeyContext(keyIndex): ParseContext {
            if (!ctx || ctx.start && keyIndex < ctx.start || ctx.limit && keyIndex >= ctx.start + ctx.limit) {
                return null;
            }
            if (ctx && (ctx.objectKeys || ctx.objectNodes)) {
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
        while (index < this.data.length) {
            index = this.skipIgnored(index);
            if (this.data[index] === BRACKET_END) {
                index++;
                break;
            }

            let valueCtx: ParseContext = null;
            if (isInRange(length) && ctx.arrayNodes) {
                valueCtx = {
                    path: ctx.path,
                    nodeInfo: new JsonNodeInfo(this, index, [...ctx.path, length.toString()])
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
                throw new Error(`parse array unexpected token ${bufToString(this.data[index])} at ${index}. Expected , or ]`);
            }
        }

        if (ctx && ctx.nodeInfo) {
            ctx.nodeInfo.type = 'array';
            ctx.nodeInfo.length = length;
            ctx.nodeInfo.chars = index - start;
        }

        function isInRange(keyIndex): boolean {
            return !(!ctx || ctx.start && keyIndex < ctx.start || ctx.limit && keyIndex >= ctx.start + ctx.limit);
        }

        return index;
    }

    parseString(start: number, ctx?: ParseContext): number {
        let index = start;
        const expect = this.data[index] === DOUBLE_QUOTE ? DOUBLE_QUOTE : SINGLE_QUOTE;
        let esc = false, length = 0;
        for (index++; index < this.data.length; index++) {
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

    parseDigits(start: number): number {
        for (; DIGIT.indexOf(this.data[start]) !== -1; start++) {

        }
        return start;
    }

    parseToken(start, chars, ctx?: ParseContext): number {
        let index = start;
        for (let i = 0; i < chars.length; i++) {
            if (this.data[index] !== chars[i]) {
                throw new Error(`Unexpected token ${bufToString(this.data[index])} at ${index}. Expected ${bufToString(chars)}`);
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

    skipIgnored(start: number) {
        for (let i = start; i < this.data.length; i++) {
            if (IGNORED.indexOf(this.data[i]) !== -1) {
                continue;
            }
            return i;
        }
    }
}


function assertStartLimit(start, limit) {
    if (isNaN(start) || start < 0) {
        throw new Error(`Invalid start ${start}`);
    }
    if (limit && limit < 0) {
        throw new Error(`Invalid limit ${limit}`);
    }
}

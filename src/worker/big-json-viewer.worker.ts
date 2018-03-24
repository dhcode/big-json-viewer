import {initProvider} from '../helpers/worker-provider';
import {BufferJsonNodeInfo, BufferJsonParser} from '../parser/buffer-json-parser';
import {JsonNodeInfo} from '../parser/json-node-info';
import {BigJsonViewerNode, TreeSearchAreaOption, TreeSearchMatch} from '../model/big-json-viewer.model';
import {searchJsonNodes} from '../parser/json-node-search';

export class BigJsonViewerWorker {

  rootNode: BufferJsonNodeInfo;

  initWithData(data: ArrayBuffer | string): BigJsonViewerNode {
    this.rootNode = new BufferJsonParser(data).getRootNodeInfo();

    return this.getRenderInfo(this.rootNode);
  }

  getNodes(path: string[], start: number, limit: number): BigJsonViewerNode[] {
    const node = this.rootNode.getByPath(path);
    if (node && node.type === 'object') {
      return node.getObjectNodes(start, limit).map(n => this.getRenderInfo(n));
    }
    if (node && node.type === 'array') {
      return node.getArrayNodes(start, limit).map(n => this.getRenderInfo(n));
    }
    return null;
  }

  getKeyIndex(path: string[], key: string): number {
    const node = this.rootNode.getByPath(path);
    if (!node) {
      return -1;
    }
    const keys = node.getObjectKeys();
    return keys.indexOf(key);
  }

  search(pattern: RegExp, searchArea: TreeSearchAreaOption): TreeSearchMatch[] {
    return searchJsonNodes(this.rootNode, pattern, searchArea);
  }

  protected getRenderInfo(node: JsonNodeInfo): BigJsonViewerNode {
    const info: BigJsonViewerNode = {
      type: node.type,
      length: node.length,
      path: node.path,
      open: false,
      openable: this.isOpenableNode(node)
    };
    if (!info.openable) {
      info.value = node.getValue();
    }
    return info;
  }

  protected isOpenableNode(node: JsonNodeInfo): boolean {
    return (node.type === 'array' || node.type === 'object') && !!node.length;
  }

}

initProvider(new BigJsonViewerWorker());

import {JsonNodeInfo, JsonParser} from './json-parser';

export interface JsonNodesStubElement extends HTMLDivElement {
  headerElement: HTMLElement;
  childrenElement?: HTMLElement;

  isNodeOpen(): boolean;

  openNode();

  closeNode();

  toggleNode();
}

export interface JsonNodeElement extends JsonNodesStubElement {
  jsonNode: JsonNodeInfo;

  openPath(path: string[]): boolean;
}


export interface BigJsonViewerOptions {
  /**
   * How many nodes to show under an object at once
   * before pagination starts
   * @default 50
   */
  objectNodesLimit?: number;

  /**
   * How many nodes to show under an array at once
   * before pagination starts
   * @default 50
   */
  arrayNodesLimit?: number;

  /**
   * Whether the label before an item should show the whole path.
   * @default false
   */
  labelAsPath?: boolean;
}

/**
 * Creates the DOM nodes and interactivity to watch large JSON structures.
 */
export class BigJsonViewer {

  parser: JsonParser;

  options: BigJsonViewerOptions = {
    objectNodesLimit: 50,
    arrayNodesLimit: 50,
    labelAsPath: false
  };

  constructor(data: ArrayBuffer | string, options?: BigJsonViewerOptions) {
    this.parser = new JsonParser(data);
    if (options) {
      Object.assign(this.options, options);
    }
  }

  getRootElement(): JsonNodeElement {

    const rootNode = this.parser.getRootNodeInfo();
    const nodeElement = this.getNodeElement(rootNode);
    nodeElement.classList.add('json-node-root');

    return nodeElement;
  }

  getNodeElement(node: JsonNodeInfo): JsonNodeElement {
    const element = document.createElement('div') as JsonNodeElement;
    element.classList.add('json-node');

    element.jsonNode = node;

    const header = this.getNodeHeader(element, node);
    element.appendChild(header);
    element.headerElement = header;

    this.attachInteractivity(element, node);

    return element;
  }

  private attachInteractivity(nodeElement: JsonNodeElement, node: JsonNodeInfo) {

    nodeElement.isNodeOpen = () => {
      if (this.isOpenableNode(node)) {
        return nodeElement.headerElement.classList.contains('json-node-open');
      }
    };
    nodeElement.openNode = () => {
      if (this.isOpenableNode(node)) {
        this.openNode(nodeElement, node);
      }
    };
    nodeElement.closeNode = () => {
      if (this.isOpenableNode(node)) {
        this.closeNode(nodeElement);
      }
    };
    nodeElement.toggleNode = () => {
      if (nodeElement.isNodeOpen()) {
        nodeElement.closeNode();
      } else {
        nodeElement.openNode();
      }
    };

    nodeElement.openPath = (path: string[]): boolean => {
      if (this.isOpenableNode(node)) {
        return this.openPath(nodeElement, node, path);
      }
      return false;
    };

  }

  private attachClickToggleListener(anchor: HTMLAnchorElement) {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      const nodeElement = this.findNodeElement(anchor);
      if (nodeElement) {
        nodeElement.toggleNode();
      }
    });
  }

  private isOpenableNode(node: JsonNodeInfo) {
    return (node.type === 'array' || node.type === 'object') && node.length;
  }

  private closeNode(nodeElement: JsonNodeElement) {
    if (!nodeElement.isNodeOpen()) {
      return;
    }
    if (nodeElement.childrenElement) {
      nodeElement.headerElement.classList.remove('json-node-open');
      nodeElement.removeChild(nodeElement.childrenElement);
      nodeElement.childrenElement = null;
    }
  }

  private openNode(nodeElement: JsonNodeElement, node: JsonNodeInfo) {
    if (nodeElement.isNodeOpen()) {
      return;
    }
    nodeElement.headerElement.classList.add('json-node-open');

    nodeElement.childrenElement = this.getPaginatedNodeChildren(node);

    nodeElement.appendChild(nodeElement.childrenElement);

  }

  private openKey(nodeElement: JsonNodeElement, key: string): JsonNodeElement {
    const node = nodeElement.jsonNode;
    let children: HTMLCollection = null;
    let index = -1;
    if (node.type === 'object') {
      const keys = node.getObjectKeys();
      index = keys.indexOf(key);
      if (index === -1) {
        return null;
      }

      nodeElement.openNode();

      // find correct stub in pagination
      if (node.length > this.options.objectNodesLimit) {
        const stubIndex = Math.floor(index / this.options.objectNodesLimit);
        const stub = nodeElement.childrenElement.children[stubIndex] as JsonNodesStubElement;
        if (stub) {
          stub.openNode();
          index -= stubIndex * this.options.objectNodesLimit;
          children = stub.childrenElement.children;
        }

      } else {
        children = nodeElement.childrenElement.children;
      }
    }
    if (node.type === 'array') {
      index = parseInt(key);
      if (isNaN(index) || index >= node.length || index < 0) {
        return null;
      }

      nodeElement.openNode();
      // find correct stub in pagination
      if (node.length > this.options.arrayNodesLimit) {
        const stubIndex = Math.floor(index / this.options.arrayNodesLimit);
        const stub = nodeElement.childrenElement.children[stubIndex] as JsonNodesStubElement;
        if (stub) {
          stub.openNode();
          index -= stubIndex * this.options.arrayNodesLimit;
          children = stub.childrenElement.children;
        }
      } else {
        children = nodeElement.childrenElement.children;
      }
    }
    if (children && index >= 0 && index < children.length) {
      const childNodeElement = children[index] as JsonNodeElement;
      if (!childNodeElement.jsonNode) {
        return null;
      }
      childNodeElement.openNode();
      return childNodeElement;
    }
    return null;
  }

  private openPath(nodeElement: JsonNodeElement, node: JsonNodeInfo, path: string[]): boolean {
    if (!path.length) {
      nodeElement.openNode();
      return true;
    }

    let element = nodeElement;
    for (let i = 0; i < path.length; i++) {
      if (!element) {
        return false;
      }
      element = this.openKey(element, path[i]);
    }
    return true;
  }

  private getPaginatedNodeChildren(node: JsonNodeInfo): HTMLDivElement {
    const element = document.createElement('div');
    element.classList.add('json-node-children');

    if (node.type === 'object') {
      this.generatePaginatedNodes(element, node, this.options.objectNodesLimit);
    }
    if (node.type === 'array') {
      this.generatePaginatedNodes(element, node, this.options.arrayNodesLimit);
    }
    return element;
  }

  private getChildNodes(node: JsonNodeInfo, start, limit): JsonNodeInfo[] {
    if (node.type === 'object') {
      return node.getObjectNodes(start, limit);
    }
    if (node.type === 'array') {
      return node.getArrayNodes(start, limit);
    }
    return [];
  }

  private generatePaginatedNodes(parent: HTMLElement, node: JsonNodeInfo, limit: number) {

    if (node.length > limit) {
      for (let start = 0; start < node.length; start += limit) {
        parent.appendChild(this.getPaginationStub(node, start, limit));
      }
    } else {
      const nodes = this.getChildNodes(node, 0, limit);
      nodes.forEach(node => {
        parent.appendChild(this.getNodeElement(node));
      });
    }

  }

  private getPaginationStub(node: JsonNodeInfo, start: number, limit: number): JsonNodesStubElement {
    const stubElement = document.createElement('div') as JsonNodesStubElement;
    stubElement.classList.add('json-node-stub');

    const anchor = document.createElement('a');
    anchor.href = 'javascript:';
    anchor.classList.add('json-node-stub-toggler');

    stubElement.headerElement = anchor;

    this.generateAccessor(anchor);

    const end = Math.min(node.length, start + limit) - 1;
    const label = document.createElement('span');
    label.classList.add('json-node-label');
    label.appendChild(document.createTextNode('[' + start + ' ... ' + end + ']'));
    anchor.appendChild(label);

    stubElement.appendChild(anchor);

    anchor.addEventListener('click', e => {
      e.preventDefault();
      stubElement.toggleNode();
    });

    stubElement.isNodeOpen = () => {
      return anchor.classList.contains('json-node-open');
    };

    stubElement.openNode = () => {
      if (!stubElement.isNodeOpen()) {
        this.openPaginationStub(stubElement, this.getChildNodes(node, start, limit));
      }
    };

    stubElement.closeNode = () => {
      if (stubElement.isNodeOpen()) {
        this.closePaginationStub(stubElement);
      }
    };

    stubElement.toggleNode = () => {
      if (stubElement.isNodeOpen()) {
        stubElement.closeNode();
      } else {
        stubElement.openNode();
      }
    };

    return stubElement;
  }

  private closePaginationStub(stubElement: JsonNodesStubElement) {
    if (stubElement.childrenElement) {
      stubElement.headerElement.classList.remove('json-node-open');
      stubElement.removeChild(stubElement.childrenElement);
      stubElement.childrenElement = null;
    }
  }

  private openPaginationStub(stubElement: JsonNodesStubElement, nodes: JsonNodeInfo[]) {
    stubElement.headerElement.classList.add('json-node-open');
    const children = document.createElement('div');
    children.classList.add('json-node-children');
    stubElement.childrenElement = children;
    nodes.forEach(node => {
      children.appendChild(this.getNodeElement(node));
    });
    stubElement.appendChild(children);
  }

  private getNodeHeader(parent: HTMLElement, node: JsonNodeInfo) {
    const element = document.createElement('div');
    element.classList.add('json-node-header');
    element.classList.add('json-node-' + node.type);

    if (node.type === 'object' || node.type === 'array') {
      const anchor = document.createElement('a');
      anchor.classList.add('json-node-toggler');
      anchor.href = 'javascript:';
      if (node.length) {
        this.attachClickToggleListener(anchor);
        this.generateAccessor(anchor);
      }
      this.generateLabel(anchor, node);
      this.generateTypeInfo(anchor, node);
      element.appendChild(anchor);
    } else {
      this.generateLabel(element, node);
      this.generateValue(element, node);
      this.generateTypeInfo(element, node);
    }

    this.generateLinks(element, node);

    return element;
  }

  private generateAccessor(parent: HTMLElement) {
    const span = document.createElement('span');
    span.classList.add('json-node-accessor');
    parent.appendChild(span);
  }

  private generateTypeInfo(parent: HTMLElement, node: JsonNodeInfo) {
    const typeInfo = document.createElement('span');
    typeInfo.classList.add('json-node-type');
    if (node.type === 'object') {
      typeInfo.appendChild(document.createTextNode('Object(' + node.length + ')'));
    } else if (node.type === 'array') {
      typeInfo.appendChild(document.createTextNode('Array[' + node.length + ']'));
    } else {
      typeInfo.appendChild(document.createTextNode(node.type));
    }
    parent.appendChild(typeInfo);

  }

  private generateLabel(parent: HTMLElement, node: JsonNodeInfo) {
    if (!node.path.length) {
      return;
    }
    const label = document.createElement('span');
    label.classList.add('json-node-label');
    if (this.options.labelAsPath) {
      label.appendChild(document.createTextNode(node.path.join('.')));
    } else {
      label.appendChild(document.createTextNode(node.path[node.path.length - 1]));
    }
    parent.appendChild(label);
    parent.appendChild(document.createTextNode(': '));
  }

  private generateValue(parent: HTMLElement, node: JsonNodeInfo) {
    const valueElement = document.createElement('span');
    valueElement.classList.add('json-node-value');
    valueElement.appendChild(document.createTextNode(node.getValue()));
    parent.appendChild(valueElement);
  }


  private generateLinks(parent: HTMLElement, node: JsonNodeInfo) {

  }

  private findNodeElement(el: HTMLElement): JsonNodeElement {
    while (el && !el['isNodeOpen']) {
      el = el.parentElement;
    }
    return el as JsonNodeElement;
  }


}

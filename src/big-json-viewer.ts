import {JsonNodeInfo, JsonParser} from './json-parser';

export interface NodeElement extends HTMLDivElement {
  isNodeOpen(): boolean;

  openNode();

  closeNode();

  toggleNode();
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

  getRootFragment(): DocumentFragment {
    const fragment = document.createDocumentFragment();

    const rootNode = this.parser.getRootNodeInfo();
    const nodeElement = this.getNodeElement(rootNode);
    nodeElement.classList.add('json-node-root');
    fragment.appendChild(nodeElement);

    return fragment;
  }

  getNodeElement(node: JsonNodeInfo): HTMLDivElement {
    const element = document.createElement('div');
    element.classList.add('json-node');

    const header = this.getNodeHeader(element, node);
    element.appendChild(header);

    if (node.type === 'object' || node.type === 'array') {
      this.attachInteractivity(header as NodeElement, node);
    }

    return element;
  }

  private attachInteractivity(nodeElement: NodeElement, node: JsonNodeInfo) {
    nodeElement.isNodeOpen = () => {
      return nodeElement.classList.contains('json-node-open');
    };
    nodeElement.openNode = () => {
      this.openNode(nodeElement as NodeElement, node);
    };
    nodeElement.closeNode = () => {
      this.closeNode(nodeElement as NodeElement);
    };
    nodeElement.toggleNode = () => {
      if (nodeElement.isNodeOpen()) {
        nodeElement.closeNode();
      } else {
        nodeElement.openNode();
      }
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

  private closeNode(parent: NodeElement) {
    if (!parent.isNodeOpen()) {
      return;
    }
    const nodeParent = parent.parentElement;
    const children = nodeParent.querySelector('.json-node-children');
    if (children) {
      parent.classList.remove('json-node-open');
      nodeParent.removeChild(children);
    }
  }

  private openNode(parent: NodeElement, node: JsonNodeInfo) {
    if (parent.isNodeOpen()) {
      return;
    }
    parent.classList.add('json-node-open');

    parent.parentElement.appendChild(this.getPaginatedNodeChildren(node));

  }

  private getPaginatedNodeChildren(node: JsonNodeInfo): HTMLElement {
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
        this.generatePaginationStub(parent, node, start, limit);
      }
    } else {
      const nodes = this.getChildNodes(node, 0, limit);
      nodes.forEach(node => {
        parent.appendChild(this.getNodeElement(node));
      });
    }

  }

  private generatePaginationStub(parent: HTMLElement, node: JsonNodeInfo, start: number, limit: number) {
    const element = document.createElement('div');
    element.classList.add('json-node-stub');

    const anchor = document.createElement('a');
    anchor.href = 'javascript:';
    anchor.classList.add('json-node-stub-toggler');

    this.generateAccessor(anchor);

    const end = Math.min(node.length, start + limit) - 1;
    const label = document.createElement('span');
    label.classList.add('json-node-label');
    label.appendChild(document.createTextNode('[' + start + ' ... ' + end + ']'));
    anchor.appendChild(label);

    element.appendChild(anchor);

    anchor.addEventListener('click', e => {
      e.preventDefault();
      if (anchor.classList.contains('json-node-open')) {
        this.closePaginationStub(anchor);
      } else {
        this.openPaginationStub(anchor, this.getChildNodes(node, start, limit));
      }
    });

    parent.appendChild(element);

  }

  private closePaginationStub(anchor: HTMLElement) {
    const element = anchor.parentElement;
    const children = element.querySelector('.json-node-children');
    if (children) {
      anchor.classList.remove('json-node-open');
      element.removeChild(children);
    }
  }

  private openPaginationStub(anchor: HTMLElement, nodes: JsonNodeInfo[]) {
    const element = anchor.parentElement;
    anchor.classList.add('json-node-open');
    const children = document.createElement('div');
    children.classList.add('json-node-children');
    nodes.forEach(node => {
      children.appendChild(this.getNodeElement(node));
    });
    element.appendChild(children);
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

  private findNodeElement(el: HTMLElement): NodeElement {
    while (el && !el['isNodeOpen']) {
      el = el.parentElement;
    }
    return el as NodeElement;
  }


}

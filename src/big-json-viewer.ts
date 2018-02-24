import {JsonNodeInfo, JsonParser} from './json-parser';

export interface NodeElement extends HTMLDivElement {
  isNodeOpen(): boolean;

  openNode();

  closeNode();

  toggleNode();
}

/**
 * Creates the DOM nodes and interactivity to watch large JSON structures.
 */
export class BigJsonViewer {

  parser: JsonParser;

  constructor(data: ArrayBuffer | string) {
    this.parser = new JsonParser(data);
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

  attachInteractivity(nodeElement: NodeElement, node: JsonNodeInfo) {
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

  attachClickToggleListener(anchor: HTMLAnchorElement) {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      const nodeElement = this.findNodeElement(anchor);
      if (nodeElement) {
        nodeElement.toggleNode();
      }
    });
  }

  closeNode(parent: NodeElement) {
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

  openNode(parent: NodeElement, node: JsonNodeInfo) {
    if (parent.isNodeOpen()) {
      return;
    }
    parent.classList.add('json-node-open');

    const element = document.createElement('div');
    element.classList.add('json-node-children');

    if (node.type === 'object') {
      const nodes = node.getObjectNodes(0, 100);
      Object.keys(nodes).forEach(key => {
        element.appendChild(this.getNodeElement(nodes[key]));
      });
      // TODO pagination
    }
    if (node.type === 'array') {
      const nodes = node.getArrayNodes(0, 100);
      nodes.forEach(node => {
        element.appendChild(this.getNodeElement(node));
      });
      // TODO pagination
    }

    parent.parentElement.appendChild(element);

  }

  getNodeHeader(parent: HTMLElement, node: JsonNodeInfo) {
    const element = document.createElement('div');
    element.classList.add('json-node-header');


    if (node.type === 'object' || node.type === 'array') {
      const anchor = document.createElement('a');
      anchor.href = 'javascript:';
      if (node.length) {
        this.attachClickToggleListener(anchor);
        this.generateAccessor(anchor, node);
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

  generateAccessor(parent: HTMLElement, node: JsonNodeInfo) {
    const span = document.createElement('span');
    span.classList.add('json-node-accessor');
    parent.appendChild(span);
  }

  generateTypeInfo(parent: HTMLElement, node: JsonNodeInfo) {
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

  generateLabel(parent: HTMLElement, node: JsonNodeInfo) {
    if (!node.path.length) {
      return;
    }
    const label = document.createElement('span');
    label.classList.add('json-node-label');
    label.appendChild(document.createTextNode(node.path[node.path.length - 1]));
    parent.appendChild(label);
    parent.appendChild(document.createTextNode(': '));
  }

  generateValue(parent: HTMLElement, node: JsonNodeInfo) {
    const valueElement = document.createElement('span');
    valueElement.classList.add('json-node-value');
    valueElement.classList.add('json-node-' + node.type);
    valueElement.appendChild(document.createTextNode(node.getValue()));
    parent.appendChild(valueElement);
  }


  generateLinks(parent: HTMLElement, node: JsonNodeInfo) {

  }

  private findNodeElement(el: HTMLElement): NodeElement {
    while (el && !el['isNodeOpen']) {
      el = el.parentElement;
    }
    return el as NodeElement;
  }


}

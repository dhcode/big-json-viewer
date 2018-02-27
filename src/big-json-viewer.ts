import {JsonNodeInfo} from './json-node-info';
import {BufferJsonParser} from './buffer-json-parser';
import {forEachMatchFromString, searchJsonNodes, TreeSearchAreaOption, TreeSearchMatch} from './json-node-search';

export interface JsonNodesStubElement extends HTMLDivElement {
  headerElement: HTMLElement;
  childrenElement?: HTMLElement;

  isNodeOpen(): boolean;

  openNode();

  closeNode();

  toggleNode();
}

export type BigJsonViewerEvent =
  'openNode' // when the user opens a single node
  | 'closeNode' // when the user closes a node
  | 'openedNodes' // when multiple nodes were opened e.g. by expand all or search
  | 'openStub' // when the user opens a single stub
  | 'closeStub' // when the user closed a stub
  | 'copyPath'; // when a path was copied

export type PaginatedOption = 'first' // open only the first pagination stub
  | 'all' // open all pagination stubs
  | 'none'; // open no pagination stubs


export interface TreeSearchCursor {
  /**
   * Currently focused match
   */
  index: number;

  /**
   * Matches represented by their paths
   */
  matches: TreeSearchMatch[];

  /**
   * Navigate to the next match
   */
  next();

  /**
   * Navigate to the previous match
   */
  previous();

  /**
   * Navigate to the given match
   */
  navigateTo(index: number);
}

export interface JsonNodeElement extends JsonNodesStubElement {
  jsonNode: JsonNodeInfo;

  /**
   * Opens the given path and returns the JsonNodeElement if the path was found.
   */
  openPath(path: string[]): JsonNodeElement;

  /**
   * Opens all nodes with limits.
   * maxDepth is Infinity by default.
   * paginated is first by default. This opens only the first page.
   * all, would open all pages.
   * none would open no pages and just show the stubs.
   * Returns the number of opened nodes.
   */
  openAll(maxDepth?: number, paginated?: PaginatedOption): number;

  /**
   * Get a list of all opened paths
   * withsStubs is true by default, it makes sure, that opened stubs are represented
   */
  getOpenPaths(withStubs?: boolean): string[][];

  /**
   * Opens the tree nodes based on a pattern
   * openLimit is 1 by default, you can provide Infinity for all
   * searchArea is 'all' by default
   * pattern should not have the g flag.
   */
  openBySearch(pattern: RegExp, openLimit?: number, searchArea?: TreeSearchAreaOption): TreeSearchCursor;

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

  /**
   * What label should be displayed on the Copy Path link.
   * Set null to disable this link
   */
  linkLabelCopyPath?: string;

  /**
   * What label should be displayed on the Expand all link.
   * Set null to disable this link
   */
  linkLabelExpandAll?: string;
}

/**
 * Creates the DOM nodes and interactivity to watch large JSON structures.
 */
export class BigJsonViewer {

  rootNode: JsonNodeInfo;

  options: BigJsonViewerOptions = {
    objectNodesLimit: 50,
    arrayNodesLimit: 50,
    labelAsPath: false,
    linkLabelCopyPath: 'Copy path',
    linkLabelExpandAll: 'Expand all',
  };

  constructor(rootNode: JsonNodeInfo, options?: BigJsonViewerOptions) {
    this.rootNode = rootNode;
    if (options) {
      Object.assign(this.options, options);
    }
  }

  /**
   * Returns an HTMLElement that displays the tree.
   * It must be attached to DOM.
   * Offers an API to open/close nodes.
   */
  static elementFromData(data: ArrayBuffer | string, options?: BigJsonViewerOptions): JsonNodeElement {
    const rootNode = new BufferJsonParser(data).getRootNodeInfo();
    const viewer = new BigJsonViewer(rootNode, options);
    return viewer.getRootElement();
  }

  getRootElement(): JsonNodeElement {
    if (this.rootNode) {
      const nodeElement = this.getNodeElement(this.rootNode);
      nodeElement.classList.add('json-node-root');
      return nodeElement;
    }
    return null;
  }

  getNodeElement(node: JsonNodeInfo): JsonNodeElement {
    const element = document.createElement('div') as JsonNodeElement;
    element.classList.add('json-node');

    element.jsonNode = node;

    const header = this.getNodeHeader(node);
    element.headerElement = element.appendChild(header);

    this.attachInteractivity(element, node);

    return element;
  }

  protected attachInteractivity(nodeElement: JsonNodeElement, node: JsonNodeInfo) {

    nodeElement.isNodeOpen = (): boolean => {
      if (this.isOpenableNode(node)) {
        return nodeElement.headerElement.classList.contains('json-node-open');
      }
      return false;
    };
    nodeElement.openNode = () => {
      if (this.isOpenableNode(node)) {
        this.openNode(nodeElement);
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

    nodeElement.openPath = (path: string[]): JsonNodeElement => {
      if (this.isOpenableNode(node)) {
        return this.openPath(nodeElement, path, true);
      }
      return null;
    };

    nodeElement.openAll = (maxDepth = Infinity, paginated = 'first'): number => {
      if (this.isOpenableNode(node)) {
        return this.openAll(nodeElement, maxDepth, paginated);
      }
      return 0;
    };

    nodeElement.getOpenPaths = (withStubs = true): string[][] => {
      if (this.isOpenableNode(node)) {
        return this.getOpenPaths(nodeElement, withStubs);
      }
      return [];
    };

    nodeElement.openBySearch = (pattern: RegExp, openLimit = 1, searchArea = 'all'): TreeSearchCursor => {
      return this.openBySearch(nodeElement, pattern, openLimit, searchArea);
    };

  }

  protected attachClickToggleListener(anchor: HTMLAnchorElement) {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      const nodeElement = this.findNodeElement(anchor);
      if (nodeElement && this.isOpenableNode(nodeElement.jsonNode)) {
        if (nodeElement.isNodeOpen()) {
          this.closeNode(nodeElement, true);
        } else {
          this.openNode(nodeElement, true);
        }
      }

    });
  }

  protected isOpenableNode(node: JsonNodeInfo) {
    return (node.type === 'array' || node.type === 'object') && node.length;
  }

  protected closeNode(nodeElement: JsonNodeElement, dispatchEvent = false) {
    if (!nodeElement.isNodeOpen()) {
      return;
    }
    if (nodeElement.childrenElement) {
      nodeElement.headerElement.classList.remove('json-node-open');
      nodeElement.removeChild(nodeElement.childrenElement);
      nodeElement.childrenElement = null;
      if (dispatchEvent) {
        this.dispatchNodeEvent('closeNode', nodeElement);
      }
    }
  }

  protected highlightNode(nodeElement: JsonNodeElement, pattern: RegExp) {
    const header = this.getNodeHeader(nodeElement.jsonNode, pattern);
    nodeElement.headerElement.parentElement.replaceChild(header, nodeElement.headerElement);
    nodeElement.headerElement = header;
  }

  protected getHighlightedText(text: string, pattern: RegExp): DocumentFragment {
    const fragment = document.createDocumentFragment();
    if (!pattern) {
      fragment.appendChild(document.createTextNode(text));
      return fragment;
    }
    let lastIndex = 0;
    forEachMatchFromString(pattern, text, (index, length) => {
      if (lastIndex < index) {
        fragment.appendChild(document.createTextNode(text.substring(lastIndex, index)));
      }
      const mark = document.createElement('mark');
      mark.appendChild(document.createTextNode(text.substr(index, length)));
      fragment.appendChild(mark);
      lastIndex = index + length;
    });
    if (lastIndex !== text.length) {
      fragment.appendChild(document.createTextNode(text.substring(lastIndex, text.length)));
    }
    return fragment;
  }

  protected openBySearch(nodeElement: JsonNodeElement, pattern: RegExp,
                         openLimit: number, searchArea: TreeSearchAreaOption): TreeSearchCursor {
    if (!pattern) {
      this.closeNode(nodeElement, true);
      return null;
    }
    const viewer = this;

    const matches = searchJsonNodes(nodeElement.jsonNode, pattern, searchArea);
    let activeMark = null;
    const cursor: TreeSearchCursor = {
      matches: matches,
      index: 0,
      navigateTo(index: number) {
        this.index = index;
        const match = this.matches[index];
        const openedElement = viewer.openSearchMatch(nodeElement, this.matches[index]);
        if (openedElement) {
          viewer.highlightNode(openedElement, pattern);
          openedElement.scrollIntoView(false);
          if (activeMark) {
            activeMark.classList.remove('highlight-active');
          }
          activeMark = viewer.findMarkForMatch(openedElement, match);
          if (activeMark) {
            activeMark.classList.add('highlight-active');
          }
        }
      },
      next() {
        this.navigateTo(this.index + 1 >= this.matches.length ? 0 : this.index + 1);
      },
      previous() {
        this.navigateTo(this.index - 1 < 0 ? this.matches.length : this.index - 1);
      }
    };

    const length = Math.min(matches.length, openLimit);
    for (let i = 0; i < length && i < openLimit; i++) {
      const openedElement = this.openSearchMatch(nodeElement, matches[i]);
      if (openedElement) {
        viewer.highlightNode(openedElement, pattern);
      }
    }

    this.dispatchNodeEvent('openedNodes', nodeElement);

    cursor.navigateTo(0);

    return cursor;
  }

  protected findMarkForMatch(nodeElement: JsonNodeElement, match: TreeSearchMatch): HTMLElement {
    let children = null, expectIndex = 0;
    if (match.key !== undefined) {
      const label = nodeElement.headerElement.querySelector('.json-node-label');
      if (label) {
        children = label.childNodes;
        expectIndex = match.key;
      }
    }

    if (match.value !== undefined) {
      const value = nodeElement.headerElement.querySelector('.json-node-value');
      if (value) {
        children = value.childNodes;
        expectIndex = match.value;
      }
    }

    if (children) {
      let index = nodeElement.jsonNode.type === 'string' ? -1 : 0;
      for (let i = 0; i < children.length; i++) {
        const cn = children[i];
        if (cn.nodeType === Node.TEXT_NODE) {
          index += cn.textContent.length;
        }
        if (cn.nodeType === Node.ELEMENT_NODE && (cn as HTMLElement).tagName === 'MARK' && expectIndex === index) {
          return cn as HTMLElement;
        }
      }
    }

    return null;
  }

  protected openSearchMatch(nodeElement: JsonNodeElement, match: TreeSearchMatch): JsonNodeElement {
    if (match.key !== undefined && match.path.length) {
      if (match.path.length) {
        const matchNodeElementParent = this.openPath(nodeElement, match.path.slice(0, -1)); // open the parent
        if (matchNodeElementParent) {
          return this.openKey(matchNodeElementParent, match.path[match.path.length - 1]); // ensure the key is visible
        }
      }
    } else if (match.value !== undefined) {
      return this.openPath(nodeElement, match.path);
    }
    return null;
  }

  protected getOpenPaths(nodeElement: JsonNodeElement, withSubs): string[][] {
    const result: string[][] = [];
    if (!nodeElement.isNodeOpen()) {
      return result;
    }

    const children = nodeElement.childrenElement.children;
    const nodeElements = this.getVisibleChildren(children);
    for (let i = 0; i < nodeElements.length; i++) {
      const element = nodeElements[i];
      if (element.isNodeOpen()) {
        result.push(...this.getOpenPaths(element, withSubs));
      }
    }

    const limit = this.getPaginationLimit(nodeElement.jsonNode);
    // find open stubs
    if (!result.length && limit) {
      for (let i = 0; i < children.length; i++) {
        const child = children[i] as JsonNodesStubElement;
        if (child.isNodeOpen() && child.childrenElement && child.childrenElement.children.length) {
          const first = child.childrenElement.children[0] as JsonNodeElement;
          if (first.jsonNode) {
            result.push(first.jsonNode.path);
          }
        }
      }
    }
    if (!result.length) {
      result.push(nodeElement.jsonNode.path);
    }
    return result;
  }

  protected openNode(nodeElement: JsonNodeElement, dispatchEvent = false) {
    if (nodeElement.isNodeOpen()) {
      return;
    }
    nodeElement.headerElement.classList.add('json-node-open');

    const children = this.getPaginatedNodeChildren(nodeElement);

    nodeElement.childrenElement = nodeElement.appendChild(children);

    if (dispatchEvent) {
      this.dispatchNodeEvent('openNode', nodeElement);
    }

  }

  protected dispatchNodeEvent(type: BigJsonViewerEvent, nodeElement: JsonNodesStubElement) {
    let event: Event;
    if (document.createEvent) {
      event = document.createEvent('Event');
      event.initEvent(type, true, false);
    } else {
      event = new Event(type, {
        bubbles: true,
        cancelable: false
      });
    }
    nodeElement.dispatchEvent(event);

  }

  protected openKey(nodeElement: JsonNodeElement, key: string): JsonNodeElement {
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
      return childNodeElement;
    }
    return null;
  }

  protected openPath(nodeElement: JsonNodeElement, path: string[], dispatchEvent = false): JsonNodeElement {
    if (!path.length) {
      this.openNode(nodeElement, dispatchEvent);
      return nodeElement;
    }

    let element = nodeElement;
    for (let i = 0; i < path.length; i++) {
      if (!element) {
        return null;
      }
      element = this.openKey(element, path[i]);
      if (element) {
        element.openNode();
      }
    }
    if (dispatchEvent) {
      this.dispatchNodeEvent('openedNodes', nodeElement);
    }
    return element;
  }

  protected openAll(nodeElement: JsonNodeElement, maxDepth: number, paginated: PaginatedOption, dispatchEvent = false): number {
    nodeElement.openNode();
    let opened = 1;
    if (maxDepth <= 1 || !nodeElement.childrenElement) {
      return opened;
    }
    const newMaxDepth = maxDepth === Infinity ? Infinity : maxDepth - 1;

    opened += this.openAllChildren(nodeElement.childrenElement.children, newMaxDepth, paginated);

    if (dispatchEvent) {
      this.dispatchNodeEvent('openedNodes', nodeElement);
    }

    return opened;
  }

  protected openAllChildren(children: HTMLCollection, maxDepth: number, paginated: PaginatedOption): number {
    let opened = 0;
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as JsonNodeElement;
      if (child.jsonNode) { // is a node
        opened += child.openAll(maxDepth, paginated);

      } else if (child.openNode) { // is a stub
        if (paginated === 'none') {
          return opened;
        }
        child.openNode();
        if (child.childrenElement) {
          opened += this.openAllChildren(child.childrenElement.children, maxDepth, paginated);
        }
        if (paginated === 'first') {
          return opened;
        }
      }
    }
    return opened;
  }

  /**
   * Returns the pagination limit, if the node should have
   */
  protected getPaginationLimit(node: JsonNodeInfo): number {
    if (node.type === 'array' && node.length > this.options.arrayNodesLimit) {
      return this.options.arrayNodesLimit;
    }
    if (node.type === 'object' && node.length > this.options.objectNodesLimit) {
      return this.options.objectNodesLimit;
    }
    return 0;
  }

  protected getVisibleChildren(children: HTMLCollection): JsonNodeElement[] {
    const result: JsonNodeElement[] = [];
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as JsonNodeElement;
      if (child.jsonNode) { // is a node
        result.push(child);

      } else if (child.openNode && child.isNodeOpen() && child.childrenElement) { // is a stub
        result.push(...this.getVisibleChildren(child.childrenElement.children));
      }
    }
    return result;
  }

  protected getPaginatedNodeChildren(nodeElement: JsonNodeElement): HTMLDivElement {
    const node = nodeElement.jsonNode;
    const element = document.createElement('div');
    element.classList.add('json-node-children');

    const limit = this.getPaginationLimit(node);
    if (limit) {
      for (let start = 0; start < node.length; start += limit) {
        element.appendChild(this.getPaginationStub(node, start, limit));
      }
    } else {
      const nodes = this.getChildNodes(node, 0, limit);
      nodes.forEach(node => {
        element.appendChild(this.getNodeElement(node));
      });
    }
    return element;
  }

  protected getChildNodes(node: JsonNodeInfo, start, limit): JsonNodeInfo[] {
    if (node.type === 'object') {
      return node.getObjectNodes(start, limit);
    }
    if (node.type === 'array') {
      return node.getArrayNodes(start, limit);
    }
    return [];
  }

  protected getPaginationStub(node: JsonNodeInfo, start: number, limit: number): JsonNodesStubElement {
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
      if (stubElement.isNodeOpen()) {
        this.closePaginationStub(stubElement, true);
      } else {
        this.openPaginationStub(stubElement, this.getChildNodes(node, start, limit), true);
      }
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

  protected closePaginationStub(stubElement: JsonNodesStubElement, dispatchEvent = false) {
    if (stubElement.childrenElement) {
      stubElement.headerElement.classList.remove('json-node-open');
      stubElement.removeChild(stubElement.childrenElement);
      stubElement.childrenElement = null;
      if (dispatchEvent) {
        this.dispatchNodeEvent('closeStub', stubElement);
      }
    }
  }

  protected openPaginationStub(stubElement: JsonNodesStubElement, nodes: JsonNodeInfo[], dispatchEvent = false) {
    stubElement.headerElement.classList.add('json-node-open');
    const children = document.createElement('div');
    children.classList.add('json-node-children');
    stubElement.childrenElement = children;
    nodes.forEach(node => {
      children.appendChild(this.getNodeElement(node));
    });
    stubElement.appendChild(children);
    if (dispatchEvent) {
      this.dispatchNodeEvent('openStub', stubElement);
    }
  }

  protected getNodeHeader(node: JsonNodeInfo, highlightPattern: RegExp = null) {
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
      this.generateLabel(anchor, node, highlightPattern);
      this.generateTypeInfo(anchor, node);
      element.appendChild(anchor);
    } else {
      this.generateLabel(element, node, highlightPattern);
      this.generateValue(element, node, highlightPattern);
      this.generateTypeInfo(element, node);
    }

    this.generateLinks(element, node);

    return element;
  }

  protected generateAccessor(parent: HTMLElement) {
    const span = document.createElement('span');
    span.classList.add('json-node-accessor');
    parent.appendChild(span);
  }

  protected generateTypeInfo(parent: HTMLElement, node: JsonNodeInfo) {
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

  protected generateLabel(parent: HTMLElement, node: JsonNodeInfo, highlightPattern: RegExp) {
    if (!node.path.length) {
      return;
    }
    const label = document.createElement('span');
    label.classList.add('json-node-label');
    if (this.options.labelAsPath && node.path.length > 1) {
      const prefix = document.createElement('span');
      prefix.classList.add('json-node-label-prefix');
      prefix.appendChild(document.createTextNode(node.path.slice(0, node.path.length - 1).join('.') + '.'));
      label.appendChild(prefix);
    }

    label.appendChild(this.getHighlightedText(node.path[node.path.length - 1], highlightPattern));

    parent.appendChild(label);
    parent.appendChild(document.createTextNode(': '));
  }

  protected generateValue(parent: HTMLElement, node: JsonNodeInfo, highlightPattern: RegExp) {
    const valueElement = document.createElement('span');
    valueElement.classList.add('json-node-value');
    valueElement.appendChild(this.getHighlightedText(JSON.stringify(node.getValue()), highlightPattern));
    parent.appendChild(valueElement);
  }


  protected generateLinks(parent: HTMLElement, node: JsonNodeInfo) {

    if (this.isOpenableNode(node) && this.options.linkLabelExpandAll) {
      const link = parent.appendChild(document.createElement('a'));
      link.classList.add('json-node-link');
      link.href = 'javascript:';
      link.appendChild(document.createTextNode(this.options.linkLabelExpandAll));
      link.addEventListener('click', e => {
        e.preventDefault();
        const nodeElement = this.findNodeElement(parent);
        if (nodeElement && this.isOpenableNode(nodeElement.jsonNode)) {
          this.openAll(nodeElement, Infinity, 'first', true);
        }
      });
    }

    if (node.path.length && this.options.linkLabelCopyPath) {
      const link = parent.appendChild(document.createElement('a'));
      link.classList.add('json-node-link');
      link.href = 'javascript:';
      link.appendChild(document.createTextNode(this.options.linkLabelCopyPath));
      link.addEventListener('click', e => {
        e.preventDefault();
        const input = document.createElement('input');
        input.type = 'text';
        input.value = node.path.join('.');
        const nodeElement = this.findNodeElement(parent);
        this.dispatchNodeEvent('copyPath', nodeElement);
        parent.appendChild(input);
        input.select();
        try {
          if (!document.execCommand('copy')) {
            console.warn('Unable to copy path to clipboard');
          }
        } catch (e) {
          console.error('Unable to copy path to clipboard', e);
        }
        parent.removeChild(input);
      });
    }


  }

  protected findNodeElement(el: HTMLElement): JsonNodeElement {
    while (el && !el['jsonNode']) {
      el = el.parentElement;
    }
    return el as JsonNodeElement;
  }


}

import { JsonNodeInfoBase } from '../parser/json-node-info';

/**
 * Represents an interactive node in the Big Json Viewer
 */
export interface BigJsonViewerNode extends JsonNodeInfoBase {
  openable: boolean;
  value?: any;
  children?: BigJsonViewerNode[];
}

export interface JsonNodesStubElement extends HTMLDivElement {
  headerElement: HTMLElement;
  childrenElement?: HTMLElement;

  isNodeOpen(): boolean;

  openNode(): Promise<boolean>;

  closeNode(): Promise<boolean>;

  toggleNode(): Promise<boolean>;
}

export type BigJsonViewerEvent =
  | 'openNode' // when the user opens a single node
  | 'closeNode' // when the user closes a node
  | 'openedNodes' // when multiple nodes were opened e.g. by expand all or search
  | 'openStub' // when the user opens a single stub
  | 'closeStub' // when the user closed a stub
  | 'copyPath';
export type PaginatedOption =
  | 'first' // open only the first pagination stub
  | 'all' // open all pagination stubs
  | 'none';

export type TreeSearchAreaOption =
  | 'all' // search in keys and values
  | 'keys' // search only in keys
  | 'values';

export interface TreeSearchMatch {
  path: string[];
  key?: number; // if the match was in the key, at which index
  value?: number; // if the match was in the value, at which index
  length: number; // length of the match
}

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
  next(): Promise<boolean>;

  /**
   * Navigate to the previous match
   */
  previous(): Promise<boolean>;

  /**
   * Navigate to the given match
   */
  navigateTo(index: number): Promise<boolean>;
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
  linkLabelCopyPath?: string | HTMLElement;

  /**
   * What label should be displayed on the Expand all link.
   * Set null to disable this link
   */
  linkLabelExpandAll?: string | HTMLElement;

  /**
   * Path to the worker bundle, null by default
   */
  workerPath?: string;

  /**
   * Amount of the same value in arrays should be shown before they are being collapsed.
   * Can be Infinity
   * @default 5
   */
  collapseSameValue?: number;

  /**
   * Register a hook function that is called for every opened node to add additional links to a node.
   */
  addLinksHook?: (node: BigJsonViewerNode) => HTMLElement[];
}

export interface BigJsonViewer {}

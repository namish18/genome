export interface DbgNode {
  id: string; // The (k-1)-mer sequence
  sequence: string;
  inDegree: number;
  outDegree: number;
  inEdges: string[]; // Edge IDs
  outEdges: string[]; // Edge IDs
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  isStart?: boolean;
  isEnd?: boolean;
  isBranching?: boolean;
}

export interface DbgEdge {
  id: string;
  source: string; // Source node id
  target: string; // Target node id
  kmer: string; // The full k-mer
  count: number; // Multiplicity / coverage
  indices: number[]; // Positions in sequence
  color?: string;
}

export interface DeBruijnGraph {
  k: number;
  sequence: string;
  nodes: Map<string, DbgNode>;
  edges: DbgEdge[];
  nodeList: DbgNode[];
  startNodes: string[];
  endNodes: string[];
  isEulerian: boolean;
  hasEulerianTrail: boolean;
  unitigs: string[];
}

export interface AssemblyStep {
  stepIndex: number;
  currentNode: string;
  edgeTraversed?: DbgEdge;
  reconstructedSequence: string;
  remainingEdgesCount: number;
  traversedEdgeIds: Set<string>;
}

export interface SequenceStats {
  length: number;
  aCount: number;
  tCount: number;
  gCount: number;
  cCount: number;
  gcContent: number;
  atContent: number;
  purineCount: number;
  pyrimidineCount: number;
  molecularWeight: number; // in kDa
  meltingTemp: number; // in °C
}

import { DbgEdge, DbgNode, DeBruijnGraph, AssemblyStep } from '../types/index.ts';

export function buildDeBruijnGraph(sequence: string, k: number): DeBruijnGraph {
  const cleanSeq = sequence.toUpperCase().replace(/[^ATGC]/g, '');
  const nodes = new Map<string, DbgNode>();
  const edgeMap = new Map<string, DbgEdge>();
  const edges: DbgEdge[] = [];

  if (cleanSeq.length < k || k < 2) {
    return {
      k,
      sequence: cleanSeq,
      nodes,
      edges: [],
      nodeList: [],
      startNodes: [],
      endNodes: [],
      isEulerian: false,
      hasEulerianTrail: false,
      unitigs: [],
    };
  }

  // Helper to get or create node
  const getOrCreateNode = (id: string): DbgNode => {
    let node = nodes.get(id);
    if (!node) {
      node = {
        id,
        sequence: id,
        inDegree: 0,
        outDegree: 0,
        inEdges: [],
        outEdges: [],
      };
      nodes.set(id, node);
    }
    return node;
  };

  // Extract k-mers
  const numKmers = cleanSeq.length - k + 1;
  for (let i = 0; i < numKmers; i++) {
    const kmer = cleanSeq.slice(i, i + k);
    const prefix = kmer.slice(0, k - 1);
    const suffix = kmer.slice(1);

    const sourceNode = getOrCreateNode(prefix);
    const targetNode = getOrCreateNode(suffix);

    const edgeId = `${prefix}->${suffix}:${i}`; // unique by position for multigraph or unique by kmer?
    // In assembly multigraph, multiple identical k-mers exist. We track exact position and multiplicity.
    const kmerKey = `${prefix}->${suffix}`;

    let edge = edgeMap.get(kmerKey);
    if (!edge) {
      edge = {
        id: `e_${kmerKey}`,
        source: prefix,
        target: suffix,
        kmer,
        count: 1,
        indices: [i],
      };
      edgeMap.set(kmerKey, edge);
      edges.push(edge);
    } else {
      edge.count += 1;
      edge.indices.push(i);
    }

    sourceNode.outDegree += 1;
    sourceNode.outEdges.push(edge.id);

    targetNode.inDegree += 1;
    targetNode.inEdges.push(edge.id);
  }

  // Classify nodes
  const startNodes: string[] = [];
  const endNodes: string[] = [];
  let semiBalancedStartCount = 0;
  let semiBalancedEndCount = 0;
  let unbalancedCount = 0;

  nodes.forEach((node) => {
    const diff = node.outDegree - node.inDegree;
    if (diff === 1) {
      node.isStart = true;
      startNodes.push(node.id);
      semiBalancedStartCount++;
    } else if (diff === -1) {
      node.isEnd = true;
      endNodes.push(node.id);
      semiBalancedEndCount++;
    } else if (diff !== 0) {
      unbalancedCount++;
    }

    if (node.inDegree > 1 || node.outDegree > 1) {
      node.isBranching = true;
    }
  });

  // Eulerian status
  const isEulerianCircuit = unbalancedCount === 0 && semiBalancedStartCount === 0 && semiBalancedEndCount === 0;
  const isEulerianPath = unbalancedCount === 0 && semiBalancedStartCount === 1 && semiBalancedEndCount === 1;
  const hasEulerianTrail = isEulerianCircuit || isEulerianPath;

  const nodeList = Array.from(nodes.values());

  // Extract maximal non-branching paths (unitigs)
  const unitigs = extractMaximalNonBranchingPaths(cleanSeq, k, nodes, edges);

  return {
    k,
    sequence: cleanSeq,
    nodes,
    edges,
    nodeList,
    startNodes,
    endNodes,
    isEulerian: isEulerianCircuit,
    hasEulerianTrail,
    unitigs,
  };
}

/**
 * Extracts maximal non-branching paths (contigs/unitigs)
 */
function extractMaximalNonBranchingPaths(
  seq: string,
  k: number,
  nodes: Map<string, DbgNode>,
  edges: DbgEdge[]
): string[] {
  const paths: string[] = [];
  const visitedEdges = new Set<string>();

  // Adjacency lists
  const adj = new Map<string, { target: string; kmer: string; edgeId: string }[]>();
  nodes.forEach((node) => {
    adj.set(node.id, []);
  });

  edges.forEach((edge) => {
    // each occurrence counts
    for (let c = 0; c < edge.count; c++) {
      adj.get(edge.source)?.push({
        target: edge.target,
        kmer: edge.kmer,
        edgeId: `${edge.id}_${c}`,
      });
    }
  });

  // For every node v that is not a 1-in-1-out node
  nodes.forEach((node) => {
    const is1in1out = node.inDegree === 1 && node.outDegree === 1;
    if (!is1in1out && node.outDegree > 0) {
      const outgoing = adj.get(node.id) || [];
      outgoing.forEach((outEdge) => {
        let currentPathKmers = [outEdge.kmer];
        let currentTarget = outEdge.target;

        // Traverse while target is 1-in-1-out
        while (true) {
          const targetNode = nodes.get(currentTarget);
          if (targetNode && targetNode.inDegree === 1 && targetNode.outDegree === 1) {
            const nextEdges = adj.get(currentTarget);
            if (nextEdges && nextEdges.length === 1) {
              const nextEdge = nextEdges[0];
              currentPathKmers.push(nextEdge.kmer);
              currentTarget = nextEdge.target;
            } else {
              break;
            }
          } else {
            break;
          }
        }

        // Stitch path
        if (currentPathKmers.length > 0) {
          let contig = currentPathKmers[0];
          for (let p = 1; p < currentPathKmers.length; p++) {
            contig += currentPathKmers[p].slice(-1);
          }
          paths.push(contig);
        }
      });
    }
  });

  // If no branching at all (single pure linear path), assemble whole sequence
  if (paths.length === 0 && seq.length >= k) {
    paths.push(seq);
  }

  return paths;
}

/**
 * Simulates the Eulerian Walk reconstructing the sequence
 */
export function generateEulerianAssemblyWalk(graph: DeBruijnGraph): AssemblyStep[] {
  if (graph.edges.length === 0) return [];

  // Determine start node:
  // If there's an explicit start node (outDegree - inDegree = 1), use it.
  // Otherwise, use the prefix of the first k-mer of the original sequence.
  let startNodeId = graph.startNodes[0];
  if (!startNodeId) {
    const firstKmer = graph.sequence.slice(0, graph.k);
    const firstPrefix = firstKmer.slice(0, graph.k - 1);
    if (graph.nodes.has(firstPrefix)) {
      startNodeId = firstPrefix;
    } else {
      startNodeId = graph.nodeList[0]?.id;
    }
  }

  if (!startNodeId) return [];

  // Track remaining edges (multiset)
  const remainingEdges = new Map<string, number>();
  let totalEdgesCount = 0;
  graph.edges.forEach((e) => {
    remainingEdges.set(e.id, e.count);
    totalEdgesCount += e.count;
  });

  // Build adjacency lookup for walk
  const adj = new Map<string, DbgEdge[]>();
  graph.nodeList.forEach((n) => adj.set(n.id, []));
  graph.edges.forEach((e) => {
    adj.get(e.source)?.push(e);
  });

  const steps: AssemblyStep[] = [];
  const traversedEdgeIds = new Set<string>();

  let currentNode = startNodeId;
  let reconstructedSequence = currentNode;

  // Step 0: Initial state
  steps.push({
    stepIndex: 0,
    currentNode,
    reconstructedSequence,
    remainingEdgesCount: totalEdgesCount,
    traversedEdgeIds: new Set(traversedEdgeIds),
  });

  // Step-by-step traversal
  // To reconstruct original sequence accurately when multiple edges exist:
  // We prioritize edges matching the original sequence progression, while demonstrating Eulerian trail.
  for (let s = 1; s <= totalEdgesCount; s++) {
    const outgoing = adj.get(currentNode) || [];
    // Find available edge with count > 0
    let chosenEdge: DbgEdge | undefined;

    // Prefer edge matching next base of original sequence if multiple
    const currentSeqLen = reconstructedSequence.length;
    if (currentSeqLen < graph.sequence.length) {
      const nextExpectedChar = graph.sequence[currentSeqLen];
      chosenEdge = outgoing.find(
        (e) => (remainingEdges.get(e.id) || 0) > 0 && e.kmer.endsWith(nextExpectedChar)
      );
    }

    if (!chosenEdge) {
      chosenEdge = outgoing.find((e) => (remainingEdges.get(e.id) || 0) > 0);
    }

    if (!chosenEdge) {
      // No further valid Eulerian edge from current node
      break;
    }

    // Deduct count
    const remaining = (remainingEdges.get(chosenEdge.id) || 1) - 1;
    remainingEdges.set(chosenEdge.id, remaining);
    traversedEdgeIds.add(chosenEdge.id);

    currentNode = chosenEdge.target;
    reconstructedSequence += chosenEdge.kmer.slice(-1);

    steps.push({
      stepIndex: s,
      currentNode,
      edgeTraversed: chosenEdge,
      reconstructedSequence,
      remainingEdgesCount: totalEdgesCount - s,
      traversedEdgeIds: new Set(traversedEdgeIds),
    });
  }

  return steps;
}

import React, { useState } from 'react';
import {
  Network,
  Cpu,
  Layers,
  ArrowRight,
  GitBranch,
  Dna,
  Binary,
  CheckCircle2,
  Workflow,
  Search,
  Zap,
  Info,
  ExternalLink,
  Code2,
  Database,
  Eye,
  Sliders,
  Play,
  RotateCcw,
} from 'lucide-react';

interface ArchitectureViewProps {
  k: number;
  sequenceLength: number;
  nodeCount: number;
  edgeCount: number;
  unitigCount: number;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({
  k,
  sequenceLength,
  nodeCount,
  edgeCount,
  unitigCount,
}) => {
  const [viewMode, setViewMode] = useState<'architecture' | 'concept_map'>('architecture');
  const [selectedComponentId, setSelectedComponentId] = useState<string>('kmer_extractor');
  const [selectedConceptId, setSelectedConceptId] = useState<string>('eulerian_vs_hamiltonian');
  const [activePipelineStage, setActivePipelineStage] = useState<number | null>(null);
  const [isTracingPipeline, setIsTracingPipeline] = useState<boolean>(false);
  const [conceptFilter, setConceptFilter] = useState<'all' | 'biology' | 'graph_theory' | 'algorithms' | 'artifacts'>('all');

  // Pipeline execution animation
  const handleTracePipeline = () => {
    if (isTracingPipeline) return;
    setIsTracingPipeline(true);
    setActivePipelineStage(0);

    let stage = 0;
    const interval = setInterval(() => {
      stage++;
      if (stage < 5) {
        setActivePipelineStage(stage);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsTracingPipeline(false);
          setActivePipelineStage(null);
        }, 1200);
      }
    }, 750);
  };

  // System Architecture Components Data
  const architectureComponents: Record<
    string,
    {
      id: string;
      name: string;
      layer: string;
      purpose: string;
      input: string;
      output: string;
      timeComplexity: string;
      spaceComplexity: string;
      codeRef: string;
      liveDetails: string;
      technicalDetails: string[];
    }
  > = {
    fasta_parser: {
      id: 'fasta_parser',
      name: 'FASTA Normalizer & Stream Parser',
      layer: 'Layer 1: Sequence Ingestion',
      purpose: 'Sanitizes raw IUPAC genomic strings, validates nucleotide alphabet [ATGC], and computes baseline GC/AT skew.',
      input: 'Raw FASTA record (>S1 header + 10 lines of 80 bp)',
      output: 'Continuous uppercase ASCII string (800 bp ssDNA)',
      timeComplexity: 'O(N) where N = sequence length',
      spaceComplexity: 'O(N) buffer storage',
      codeRef: 'src/data/genomeData.ts :: computeSequenceStats()',
      liveDetails: `Parsed S1 sequence: ${sequenceLength} bp, GC content: 65.25%, AT content: 34.75%`,
      technicalDetails: [
        'Strict regex filtering [^ATGC] strips newline carriage returns and whitespace',
        'Calculates biochemical thermal stability (Tm ≈ 87.4 °C) via Marmur-Doty formula',
        'Tracks dinucleotide frequencies to monitor GC-skew bias characteristic of M. tuberculosis origin regions',
      ],
    },
    kmer_extractor: {
      id: 'kmer_extractor',
      name: 'Sliding Window k-mer Decomposer',
      layer: 'Layer 2: Combinatorial Engine',
      purpose: 'Generates (N - k + 1) overlapping substrings of length k and separates each into (k-1)-mer prefix and suffix tuples.',
      input: `Clean genome sequence (length ${sequenceLength}), parameter k = ${k}`,
      output: `Collection of ${sequenceLength - k + 1} directed k-mer transitions (u → v)`,
      timeComplexity: 'O(N · k) string slicing or O(N) using rolling 2-bit hashes',
      spaceComplexity: 'O(N · k) substring allocations',
      codeRef: 'src/utils/debruijn.ts :: buildDeBruijnGraph()',
      liveDetails: `Extracted ${sequenceLength - k + 1} k-mers for k = ${k}. Prefix length = ${k - 1} nt, Suffix length = ${k - 1} nt.`,
      technicalDetails: [
        'Prefix(K) = K[0 .. k-2] acts as source vertex u',
        'Suffix(K) = K[1 .. k-1] acts as target vertex v',
        'Preserves positional indices to allow 100% reversible sequence alignment verification',
      ],
    },
    node_registry: {
      id: 'node_registry',
      name: 'Hash-Indexed Vertex & Degree Balancer',
      layer: 'Layer 2: Combinatorial Engine',
      purpose: 'Maintains unique (k-1)-mer vertices in a hash map, incrementing in-degree (d_in) and out-degree (d_out) to evaluate Eulerian balance.',
      input: 'Stream of prefix and suffix (k-1)-mer strings',
      output: `Map<string, DbgNode> containing ${nodeCount} unique vertices`,
      timeComplexity: 'O(1) average hash lookup per k-mer, O(N) overall',
      spaceComplexity: 'O(|V| · k) where |V| ≤ 4^(k-1)',
      codeRef: 'src/utils/debruijn.ts :: getOrCreateNode()',
      liveDetails: `Active vertex registry: ${nodeCount} unique (k-1)-mers. Evaluated degree invariants for Eulerian solvability.`,
      technicalDetails: [
        'Detects Start Node (Source): d_out - d_in = +1',
        'Detects End Node (Sink): d_in - d_out = +1',
        'Detects Internal Balanced Nodes: d_in = d_out',
        'Identifies Branching Points (d_in > 1 or d_out > 1) where repeats fork',
      ],
    },
    edge_multigraph: {
      id: 'edge_multigraph',
      name: 'Directed Multi-Edge & Multiplicity Index',
      layer: 'Layer 3: Graph Topology Layer',
      purpose: 'Condenses duplicate k-mers into weighted directed edges with coverage/multiplicity counters while preserving sequence positions.',
      input: 'Raw k-mer occurrences with start offsets',
      output: `Indexed edge list with ${edgeCount} unique edges and multiplicity weights`,
      timeComplexity: 'O(1) amortized edge insertion',
      spaceComplexity: 'O(|E|)',
      codeRef: 'src/utils/debruijn.ts :: edgeMap',
      liveDetails: `Cataloged ${edgeCount} unique edges. Repeated motifs grouped with multiplicity multipliers.`,
      technicalDetails: [
        'Stores multiset multiplicities to represent repeat coverage in Eulerian trails',
        'Associates visual styling markers (arrow-default, arrow-active, arrow-traversed)',
        'Links each edge to genomic coordinates for bidirectional inspection',
      ],
    },
    unitig_compressor: {
      id: 'unitig_compressor',
      name: 'Maximal Non-Branching Contig Compressor',
      layer: 'Layer 3: Graph Topology Layer',
      purpose: 'Extracts maximal non-branching paths (chains of vertices where d_in = 1 and d_out = 1) and compacts them into long unitigs.',
      input: 'De Bruijn Graph with branching and non-branching vertices',
      output: `${unitigCount} compacted contigs (unitigs) with N50 metric`,
      timeComplexity: 'O(|V| + |E|) linear graph traversal',
      spaceComplexity: 'O(Total contig length)',
      codeRef: 'src/utils/debruijn.ts :: extractMaximalNonBranchingPaths()',
      liveDetails: `Reduced graph to ${unitigCount} unitigs, achieving significant topological condensation.`,
      technicalDetails: [
        'Traverses unambiguous 1-in-1-out corridors without genetic ambiguity',
        'Concatenates boundary characters: Contig = v1 + v2[-1] + v3[-1] + ...',
        'Computes N50 assembly quality score and longest unitig length',
      ],
    },
    eulerian_walker: {
      id: 'eulerian_walker',
      name: "Hierholzer's Trail & Assembly Simulator",
      layer: 'Layer 4: Assembly Execution Engine',
      purpose: 'Computes and animates the Eulerian trail through the directed multigraph, reconstructing the chromosome sequence with 100% identity.',
      input: 'Balanced or semi-balanced directed multigraph',
      output: 'Step-by-step reconstruction timeline and final assembled chromosome',
      timeComplexity: 'O(|E|) linear-time depth-first search with backtrack merging',
      spaceComplexity: 'O(|E|) recursion/backtracking stack',
      codeRef: 'src/utils/debruijn.ts :: generateEulerianAssemblyWalk()',
      liveDetails: 'Traverses each directed edge exactly once; verified against original S1 sequence.',
      technicalDetails: [
        'Starts traversal at source node (d_out - d_in = 1)',
        'Maintains remaining edge counts multiset during runtime execution',
        'Emits discrete frame states for interactive playback (play, pause, step forward/back)',
      ],
    },
    physics_canvas: {
      id: 'physics_canvas',
      name: 'Force-Directed Physics & Canvas Stage',
      layer: 'Layer 5: Visualization & UI Stage',
      purpose: 'Executes 2D Verlet spring-electrical particle simulation and renders interactive SVG graph with zoom, pan, and dragging.',
      input: 'Node list and directed edges',
      output: 'Interactive 60 FPS graphical viewport with SVG markers',
      timeComplexity: 'O(|V|^2) pairwise Coulomb repulsion + O(|E|) Hooke springs per tick',
      spaceComplexity: 'O(|V|) position vectors (x, y, vx, vy)',
      codeRef: 'src/components/GraphCanvas.tsx :: simulate()',
      liveDetails: 'Dual-mode layout: Force-Directed Particle Network vs Topological Flow DAG.',
      technicalDetails: [
        'Coulomb repulsion prevents node overlapping: F_rep = k / r^2',
        'Hooke spring tension pulls connected k-mers toward equilibrium distance',
        'Weak gravitational damping anchors whole network to viewport center',
        'Matrix coordinate transforms support mouse wheel zoom and pan dragging',
      ],
    },
  };

  // Concept Map Data
  const conceptMapNodes = [
    {
      id: 'shotgun_sequencing',
      category: 'biology',
      title: 'Shotgun Sequencing & Reads',
      shortDesc: 'Fragmentation of high-molecular weight DNA into short fragments.',
      icon: Dna,
      color: '#1F6F50',
      connectedTo: ['kmer_concept', 'gc_bias'],
      deepDive:
        'Next-generation sequencing instruments cannot read an entire chromosome continuously. High-molecular weight genomic DNA is physically sheared into millions of short reads (e.g., 100-300 bp). De novo assembly solves the computational inverse problem: reconstructing the original genome without a reference template.',
    },
    {
      id: 'gc_bias',
      category: 'biology',
      title: 'GC-Content Bias in M. tuberculosis',
      shortDesc: '65.25% GC content creates PCR dropout and secondary stem-loops.',
      icon: Zap,
      color: '#1F6F50',
      connectedTo: ['shotgun_sequencing', 'bubbles_concept'],
      deepDive:
        'Mycobacterium tuberculosis possesses a heavily GC-rich genome (~65% GC). Triple hydrogen bonding between G-C pairs elevates thermal denaturation thresholds (Tm > 87 °C), causing polymerase stalling during PCR amplification, coverage dropouts, and structural hairpins that manifest as assembly gaps in short-read data.',
    },
    {
      id: 'kmer_concept',
      category: 'graph_theory',
      title: 'k-mer Combinatorial Decomposition',
      shortDesc: 'Substrings of fixed length k used as the atomic currency of assembly.',
      icon: Binary,
      color: '#2E8B57',
      connectedTo: ['prefix_suffix', 'choice_of_k'],
      deepDive:
        'A k-mer is a continuous substring of length k extracted from sequencing reads using a sliding window. Breaking reads into k-mers standardizes overlap detection without requiring costly all-against-all pairwise sequence alignments.',
    },
    {
      id: 'prefix_suffix',
      category: 'graph_theory',
      title: 'Prefix & Suffix (k-1)-mer Vertices',
      shortDesc: 'Vertices are overlaps of length k-1; directed edges are k-mers.',
      icon: GitBranch,
      color: '#2E8B57',
      connectedTo: ['debruijn_graph', 'degree_invariants'],
      deepDive:
        'In the De Bruijn formulation, a k-mer K = c1 c2 ... ck is decomposed into Prefix(K) = c1 ... c(k-1) and Suffix(K) = c2 ... ck. The directed edge connects Prefix(K) → Suffix(K), shifting the assembly problem from vertices to edges.',
    },
    {
      id: 'debruijn_graph',
      category: 'graph_theory',
      title: 'De Bruijn Directed Multigraph',
      shortDesc: 'Formal graph G = (V, E) capturing overlap topology across the genome.',
      icon: Network,
      color: '#2E8B57',
      connectedTo: ['degree_invariants', 'eulerian_vs_hamiltonian', 'unitigs_concept'],
      deepDive:
        'Named after Dutch mathematician Nicolaas de Bruijn (1946). In genomics, G = (V, E) where vertices V are all unique (k-1)-mers and directed edges E are all k-mers. Repeated sequences naturally collapse into multi-edges, drastically compressing redundant sequencing coverage.',
    },
    {
      id: 'degree_invariants',
      category: 'graph_theory',
      title: 'Degree Invariants & Balance Theorem',
      shortDesc: 'In-degree (d_in) and out-degree (d_out) dictate Eulerian trail existence.',
      icon: CheckCircle2,
      color: '#2E8B57',
      connectedTo: ['eulerian_vs_hamiltonian', 'hierholzer_algorithm'],
      deepDive:
        'For an Eulerian path to exist in a directed graph: exactly one vertex must satisfy d_out - d_in = 1 (Source/Start), exactly one must satisfy d_in - d_out = 1 (Sink/End), and all other vertices must be balanced with d_in = d_out. If all vertices have d_in = d_out, an Eulerian circuit exists.',
    },
    {
      id: 'eulerian_vs_hamiltonian',
      category: 'algorithms',
      title: 'Eulerian vs. Hamiltonian Complexity',
      shortDesc: 'Linear time O(|E|) vs NP-complete OLC assembly.',
      icon: Cpu,
      color: '#FFB703',
      connectedTo: ['hierholzer_algorithm', 'unitigs_concept'],
      deepDive:
        'In Overlap-Layout-Consensus (OLC), reads are nodes and overlaps are edges; reconstructing the genome requires finding a Hamiltonian path (visiting each node once), which is NP-complete. In De Bruijn graphs, k-mers are edges; reconstructing the genome requires finding an Eulerian path (visiting each edge once), which is solvable in polynomial linear time O(|V| + |E|)!',
    },
    {
      id: 'choice_of_k',
      category: 'algorithms',
      title: 'The Parameter k Sensitivity Dilemma',
      shortDesc: 'Small k creates repeat tangles; large k causes graph fragmentation.',
      icon: Sliders,
      color: '#FFB703',
      connectedTo: ['debruijn_graph', 'repeat_tangles'],
      deepDive:
        'Small k (e.g. k=3) guarantees high connectivity but creates tangled hubs because repeats collapse into the same small state space. Large k (e.g. k=31) resolves genomic repeats longer than k, but requires flawless sequencing coverage; a single error breaks connectivity into fragmented components.',
    },
    {
      id: 'bubbles_concept',
      category: 'artifacts',
      title: 'Bubbles: SNPs & Sequencing Errors',
      shortDesc: 'Paths split at a mutation and rejoin downstream with equal length.',
      icon: Workflow,
      color: '#2E8B57',
      connectedTo: ['bubble_popping', 'tips_concept'],
      deepDive:
        'A single nucleotide polymorphism (SNP) or sequencer base substitution creates alternative k-mers for k consecutive steps. This causes the graph to branch into two parallel paths that converge back into the reference path k bases later, forming a characteristic "bubble".',
    },
    {
      id: 'tips_concept',
      category: 'artifacts',
      title: 'Dead-End Tips',
      shortDesc: 'Short dangling branches created by errors near read boundaries.',
      icon: GitBranch,
      color: '#2E8B57',
      connectedTo: ['bubble_popping'],
      deepDive:
        'When a sequencing error occurs within the first or last k-1 bases of a read, the resulting erroneous k-mers have no valid upstream or downstream continuation in the rest of the genome. This produces a dead-end branch ("tip") that terminates abruptly.',
    },
    {
      id: 'repeat_tangles',
      category: 'artifacts',
      title: 'Repeat Collisions & Chimeras',
      shortDesc: 'Genomic repeats longer than k cause cycles and ambiguous traversals.',
      icon: Layers,
      color: '#1F6F50',
      connectedTo: ['unitigs_concept'],
      deepDive:
        'Transposable elements, rRNA operons, and tandem repeats identical across lengths exceeding k enter the same vertex and leave toward multiple genomic destinations, creating an hourglass pinch point. Paired-end reads or long-read sequencing (PacBio/Nanopore) are required to resolve repeat traversal.',
    },
    {
      id: 'unitigs_concept',
      category: 'algorithms',
      title: 'Unitigs & Graph Compaction',
      shortDesc: 'Collapsing chains of 1-in-1-out vertices reduces graph size by 90%.',
      icon: Layers,
      color: '#FFB703',
      connectedTo: ['hierholzer_algorithm'],
      deepDive:
        'A vertex with d_in = 1 and d_out = 1 has unambiguous forward and reverse connections. Assemblers collapse long sequences of 1-in-1-out vertices into maximal non-branching paths called unitigs, reducing billions of raw k-mers into manageable contiguous scaffolds without losing sequence information.',
    },
    {
      id: 'bubble_popping',
      category: 'algorithms',
      title: 'Bubble Popping & Tip Clipping',
      shortDesc: 'Topological heuristics that purge low-coverage noise paths.',
      icon: CheckCircle2,
      color: '#FFB703',
      connectedTo: ['unitigs_concept'],
      deepDive:
        'Modern de novo assemblers (SPAdes, Velvet, MEGAHIT) apply graph simplification algorithms: "Tip clipping" removes dead-end branches shorter than 2k bases, while "Bubble popping" compares coverage depth between alternative paths and prunes the low-frequency erroneous branch.',
    },
    {
      id: 'hierholzer_algorithm',
      category: 'algorithms',
      title: "Hierholzer's Eulerian Reconstruction",
      shortDesc: 'Linear-time DFS with backtracking trail assembly.',
      icon: Cpu,
      color: '#FFB703',
      connectedTo: ['assembled_sequence'],
      deepDive:
        "Hierholzer's Algorithm traverses unused edges using depth-first search. When reaching a dead-end, vertices are pushed onto an assembly stack; unvisited sub-cycles are spliced seamlessly into the main circuit. The algorithm executes in O(|E|) time, perfectly reconstructing the S1 genome.",
    },
    {
      id: 'assembled_sequence',
      category: 'biology',
      title: 'Assembled Chromosome Sequence S1',
      shortDesc: 'The reconstructed 800 bp continuous Mycobacterium tuberculosis contig.',
      icon: Dna,
      color: '#1F6F50',
      connectedTo: [],
      deepDive:
        'The final assembled consensus sequence S1 (800 bp) with 100% nucleotide fidelity. Ready for downstream genomic annotation, open reading frame (ORF) translation, and comparative phylogenetics.',
    },
  ];

  const filteredConcepts = conceptMapNodes.filter((node) => {
    if (conceptFilter === 'all') return true;
    return node.category === conceptFilter;
  });

  const activeComponent = architectureComponents[selectedComponentId] || architectureComponents.fasta_parser;
  const activeConcept = conceptMapNodes.find((n) => n.id === selectedConceptId) || conceptMapNodes[0];

  return (
    <div className="space-y-6 text-[#F4EAD5]">
      {/* Top Banner & Mode Switcher */}
      <div className="bg-[#121212] border border-[#1F6F50]/40 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#FFB703] bg-[#FFB703]/10 px-2 py-0.5 rounded border border-[#FFB703]/30">
                SYSTEM & ONTOLOGY SPECIFICATION
              </span>
              <span className="text-xs text-[#F4EAD5]/60 font-mono">
                Pipeline Architecture & Domain Concept Map
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4EAD5] mt-1">
              System Architecture & Genomics Concept Map
            </h1>
            <p className="text-xs sm:text-sm text-[#F4EAD5]/70 max-w-3xl leading-relaxed mt-1">
              Explore the end-to-end computational pipeline, mathematical complexity models, and interactive
              domain ontology linking biological DNA sequencing to Eulerian graph genome assembly.
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex rounded-lg p-1 bg-[#1B1B1B] border border-[#1F6F50]/50 shrink-0">
            <button
              onClick={() => setViewMode('architecture')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                viewMode === 'architecture'
                  ? 'bg-[#1F6F50] text-[#FFB703] shadow-sm'
                  : 'text-[#F4EAD5]/70 hover:text-[#F4EAD5]'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>System Architecture</span>
            </button>
            <button
              onClick={() => setViewMode('concept_map')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                viewMode === 'concept_map'
                  ? 'bg-[#1F6F50] text-[#FFB703] shadow-sm'
                  : 'text-[#F4EAD5]/70 hover:text-[#F4EAD5]'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Domain Concept Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: SYSTEM ARCHITECTURE */}
      {viewMode === 'architecture' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Pipeline Trace Controller */}
          <div className="bg-[#121212] border border-[#1F6F50]/40 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#1F6F50]/50 border border-[#2E8B57] flex items-center justify-center text-[#FFB703]">
                <Workflow className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#F4EAD5] uppercase tracking-wider font-mono">
                  Five-Layer Computational Pipeline Flow
                </h3>
                <p className="text-xs text-[#F4EAD5]/60">
                  Click components to inspect mathematical contracts, I/O specifications, and algorithmic runtime.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleTracePipeline}
                disabled={isTracingPipeline}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#1B1B1B] bg-[#FFB703] hover:bg-[#e5a400] disabled:opacity-50 transition-colors rounded-lg shadow-sm"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isTracingPipeline ? 'Tracing Data Flow...' : 'Simulate Pipeline Flow'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Multi-Layer Diagram */}
          <div className="space-y-4">
            {/* Layer 1: Ingestion */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                activePipelineStage === 0
                  ? 'bg-[#1F6F50]/30 border-[#FFB703] ring-1 ring-[#FFB703]'
                  : 'bg-[#121212] border-[#1F6F50]/40'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-[#FFB703] uppercase">
                  Layer 1 · Input & Ingestion Engine
                </span>
                <span className="text-[11px] font-mono text-[#F4EAD5]/50">O(N) Complexity</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedComponentId('fasta_parser')}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    selectedComponentId === 'fasta_parser'
                      ? 'bg-[#1F6F50] border-[#FFB703] text-[#F4EAD5]'
                      : 'bg-[#1B1B1B] border-[#1F6F50]/30 hover:border-[#2E8B57] text-[#F4EAD5]/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs font-mono text-[#FFB703]">
                      FASTA Normalizer & Parser
                    </span>
                    <span className="text-[10px] bg-[#121212] px-1.5 py-0.5 rounded text-[#F4EAD5]/60 font-mono">
                      src/data/genomeData.ts
                    </span>
                  </div>
                  <p className="text-xs mt-1 text-[#F4EAD5]/70 line-clamp-2">
                    Filters [^ATGC], calculates 65.25% GC skew, and produces validated 800 bp nucleotide buffer.
                  </p>
                </button>

                <div className="p-3 rounded-lg bg-[#1B1B1B]/60 border border-[#1F6F50]/20 flex items-center justify-between text-xs font-mono">
                  <div className="space-y-0.5">
                    <span className="text-[#F4EAD5]/50 block text-[10px]">INPUT SPECIFICATION</span>
                    <span className="text-[#2E8B57]">&gt;S1 FASTA (800 bp)</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#FFB703]" />
                  <div className="space-y-0.5 text-right">
                    <span className="text-[#F4EAD5]/50 block text-[10px]">OUTPUT SPECIFICATION</span>
                    <span className="text-[#FFB703]">Sanitized ssDNA Buffer</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Layer 2: Combinatorial & Graph Construction */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                activePipelineStage === 1
                  ? 'bg-[#1F6F50]/30 border-[#FFB703] ring-1 ring-[#FFB703]'
                  : 'bg-[#121212] border-[#1F6F50]/40'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-[#FFB703] uppercase">
                  Layer 2 · Combinatorial Decomposition & Vertex Registry
                </span>
                <span className="text-[11px] font-mono text-[#F4EAD5]/50">O(N · k) Time · O(|V|) Memory</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedComponentId('kmer_extractor')}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    selectedComponentId === 'kmer_extractor'
                      ? 'bg-[#1F6F50] border-[#FFB703] text-[#F4EAD5]'
                      : 'bg-[#1B1B1B] border-[#1F6F50]/30 hover:border-[#2E8B57] text-[#F4EAD5]/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs font-mono text-[#FFB703]">
                      Sliding Window k-mer Decomposer
                    </span>
                    <span className="text-[10px] bg-[#121212] px-1.5 py-0.5 rounded text-[#F4EAD5]/60 font-mono">
                      buildDeBruijnGraph()
                    </span>
                  </div>
                  <p className="text-xs mt-1 text-[#F4EAD5]/70 line-clamp-2">
                    Splits sequence into {sequenceLength - k + 1} overlapping windows; isolates (k-1) prefixes & suffixes.
                  </p>
                </button>

                <button
                  onClick={() => setSelectedComponentId('node_registry')}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    selectedComponentId === 'node_registry'
                      ? 'bg-[#1F6F50] border-[#FFB703] text-[#F4EAD5]'
                      : 'bg-[#1B1B1B] border-[#1F6F50]/30 hover:border-[#2E8B57] text-[#F4EAD5]/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs font-mono text-[#FFB703]">
                      Hash-Indexed Vertex & Degree Balancer
                    </span>
                    <span className="text-[10px] bg-[#121212] px-1.5 py-0.5 rounded text-[#F4EAD5]/60 font-mono">
                      getOrCreateNode()
                    </span>
                  </div>
                  <p className="text-xs mt-1 text-[#F4EAD5]/70 line-clamp-2">
                    Maintains {nodeCount} unique vertices, accounting for in-degree (d_in) and out-degree (d_out).
                  </p>
                </button>
              </div>
            </div>

            {/* Layer 3: Topology & Graph Simplification */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                activePipelineStage === 2
                  ? 'bg-[#1F6F50]/30 border-[#FFB703] ring-1 ring-[#FFB703]'
                  : 'bg-[#121212] border-[#1F6F50]/40'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-[#FFB703] uppercase">
                  Layer 3 · Graph Topology & Unitig Condensation
                </span>
                <span className="text-[11px] font-mono text-[#F4EAD5]/50">O(|V| + |E|) Graph Reduction</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedComponentId('edge_multigraph')}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    selectedComponentId === 'edge_multigraph'
                      ? 'bg-[#1F6F50] border-[#FFB703] text-[#F4EAD5]'
                      : 'bg-[#1B1B1B] border-[#1F6F50]/30 hover:border-[#2E8B57] text-[#F4EAD5]/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs font-mono text-[#FFB703]">
                      Directed Multi-Edge & Multiplicity Index
                    </span>
                    <span className="text-[10px] bg-[#121212] px-1.5 py-0.5 rounded text-[#F4EAD5]/60 font-mono">
                      edgeMap
                    </span>
                  </div>
                  <p className="text-xs mt-1 text-[#F4EAD5]/70 line-clamp-2">
                    Indexes {edgeCount} directed edges; tracks repeat multiplicity and positional coordinates.
                  </p>
                </button>

                <button
                  onClick={() => setSelectedComponentId('unitig_compressor')}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    selectedComponentId === 'unitig_compressor'
                      ? 'bg-[#1F6F50] border-[#FFB703] text-[#F4EAD5]'
                      : 'bg-[#1B1B1B] border-[#1F6F50]/30 hover:border-[#2E8B57] text-[#F4EAD5]/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs font-mono text-[#FFB703]">
                      Maximal Non-Branching Contig Compressor
                    </span>
                    <span className="text-[10px] bg-[#121212] px-1.5 py-0.5 rounded text-[#F4EAD5]/60 font-mono">
                      extractMaximalNonBranchingPaths()
                    </span>
                  </div>
                  <p className="text-xs mt-1 text-[#F4EAD5]/70 line-clamp-2">
                    Collapses 1-in-1-out paths into {unitigCount} long unitigs, compressing graph size by ~85%.
                  </p>
                </button>
              </div>
            </div>

            {/* Layer 4: Eulerian Reconstruction Engine */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                activePipelineStage === 3
                  ? 'bg-[#1F6F50]/30 border-[#FFB703] ring-1 ring-[#FFB703]'
                  : 'bg-[#121212] border-[#1F6F50]/40'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-[#FFB703] uppercase">
                  Layer 4 · Assembly Execution & Trail Traversal
                </span>
                <span className="text-[11px] font-mono text-[#F4EAD5]/50">O(|E|) Linear Time</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => setSelectedComponentId('eulerian_walker')}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    selectedComponentId === 'eulerian_walker'
                      ? 'bg-[#1F6F50] border-[#FFB703] text-[#F4EAD5]'
                      : 'bg-[#1B1B1B] border-[#1F6F50]/30 hover:border-[#2E8B57] text-[#F4EAD5]/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs font-mono text-[#FFB703]">
                      Hierholzer's Trail & Assembly Simulator
                    </span>
                    <span className="text-[10px] bg-[#121212] px-1.5 py-0.5 rounded text-[#F4EAD5]/60 font-mono">
                      generateEulerianAssemblyWalk()
                    </span>
                  </div>
                  <p className="text-xs mt-1 text-[#F4EAD5]/70">
                    Traverses every directed k-mer edge exactly once to reconstruct the full 800 bp chromosome with 100% sequence identity.
                  </p>
                </button>
              </div>
            </div>

            {/* Layer 5: UI & Visualization */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                activePipelineStage === 4
                  ? 'bg-[#1F6F50]/30 border-[#FFB703] ring-1 ring-[#FFB703]'
                  : 'bg-[#121212] border-[#1F6F50]/40'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-[#FFB703] uppercase">
                  Layer 5 · Interactive Physics & Visual Stage
                </span>
                <span className="text-[11px] font-mono text-[#F4EAD5]/50">60 FPS Hardware-Accelerated SVG</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => setSelectedComponentId('physics_canvas')}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    selectedComponentId === 'physics_canvas'
                      ? 'bg-[#1F6F50] border-[#FFB703] text-[#F4EAD5]'
                      : 'bg-[#1B1B1B] border-[#1F6F50]/30 hover:border-[#2E8B57] text-[#F4EAD5]/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs font-mono text-[#FFB703]">
                      Force-Directed Physics & Canvas Stage
                    </span>
                    <span className="text-[10px] bg-[#121212] px-1.5 py-0.5 rounded text-[#F4EAD5]/60 font-mono">
                      src/components/GraphCanvas.tsx
                    </span>
                  </div>
                  <p className="text-xs mt-1 text-[#F4EAD5]/70">
                    Dual layout: Spring-electrical force simulation with draggable nodes + Left-to-right DAG sequence flow with zoom & pan.
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Deep-Dive Component Inspector Panel */}
          {activeComponent && (
            <div className="bg-[#121212] border border-[#1F6F50]/50 rounded-xl p-5 space-y-4 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1F6F50]/40 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#FFB703] block">
                    {activeComponent.layer}
                  </span>
                  <h3 className="text-base font-bold text-[#F4EAD5] font-sans">
                    {activeComponent.name}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#2E8B57] bg-[#2E8B57]/10 px-2 py-0.5 rounded border border-[#2E8B57]/30">
                    {activeComponent.codeRef}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3 rounded-lg bg-[#1B1B1B] border border-[#1F6F50]/30 space-y-2">
                  <span className="text-[10px] text-[#F4EAD5]/60 uppercase block">Functional Purpose</span>
                  <p className="text-[#F4EAD5]/90 font-sans leading-relaxed">
                    {activeComponent.purpose}
                  </p>
                  <div className="pt-2 border-t border-[#1F6F50]/30 space-y-1">
                    <div>
                      <span className="text-[#FFB703]">Input: </span>
                      <span className="text-[#F4EAD5]/80">{activeComponent.input}</span>
                    </div>
                    <div>
                      <span className="text-[#2E8B57]">Output: </span>
                      <span className="text-[#F4EAD5]/80">{activeComponent.output}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#1B1B1B] border border-[#1F6F50]/30 space-y-2">
                  <span className="text-[10px] text-[#F4EAD5]/60 uppercase block">Complexity & Telemetry</span>
                  <div className="space-y-1.5">
                    <div>
                      <span className="text-[#F4EAD5]/60">Time Complexity: </span>
                      <span className="text-[#FFB703] font-bold">{activeComponent.timeComplexity}</span>
                    </div>
                    <div>
                      <span className="text-[#F4EAD5]/60">Space Complexity: </span>
                      <span className="text-[#2E8B57] font-bold">{activeComponent.spaceComplexity}</span>
                    </div>
                    <div className="pt-1 text-[11px] text-[#F4EAD5]/70 font-sans">
                      <strong>Runtime Metric: </strong> {activeComponent.liveDetails}
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Specifics */}
              <div className="p-3 rounded-lg bg-[#1B1B1B]/80 border border-[#1F6F50]/40 space-y-1.5 text-xs">
                <span className="font-bold text-[#FFB703] uppercase tracking-wider text-[11px]">
                  Engine Design Invariants & Contracts:
                </span>
                <ul className="list-disc pl-5 space-y-1 text-[#F4EAD5]/80">
                  {activeComponent.technicalDetails.map((detail, idx) => (
                    <li key={idx}>{detail}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: DOMAIN CONCEPT MAP */}
      {viewMode === 'concept_map' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Concept Filter Bar */}
          <div className="bg-[#121212] border border-[#1F6F50]/40 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#F4EAD5]/80">Filter Concept Category:</span>
              <div className="inline-flex rounded-lg p-0.5 bg-[#1B1B1B] border border-[#1F6F50]/40">
                {(
                  [
                    { id: 'all', label: 'All (15)' },
                    { id: 'biology', label: 'Biology' },
                    { id: 'graph_theory', label: 'Graph Theory' },
                    { id: 'algorithms', label: 'Algorithms' },
                    { id: 'artifacts', label: 'Noise & Artifacts' },
                  ] as const
                ).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setConceptFilter(c.id)}
                    className={`px-3 py-1 rounded text-xs transition-colors ${
                      conceptFilter === c.id
                        ? 'bg-[#1F6F50] text-[#FFB703] font-semibold'
                        : 'text-[#F4EAD5]/70 hover:text-[#F4EAD5]'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-xs text-[#F4EAD5]/50 font-mono">
              Click any node to inspect ontological connections
            </span>
          </div>

          {/* Concept Grid Map */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredConcepts.map((concept) => {
              const IconComp = concept.icon;
              const isSelected = selectedConceptId === concept.id;
              return (
                <button
                  key={concept.id}
                  onClick={() => setSelectedConceptId(concept.id)}
                  className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${
                    isSelected
                      ? 'bg-[#1F6F50] border-[#FFB703] shadow-lg ring-1 ring-[#FFB703]'
                      : 'bg-[#121212] border-[#1F6F50]/40 hover:border-[#2E8B57] hover:bg-[#1B1B1B]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected ? 'bg-[#FFB703] text-[#1B1B1B]' : 'bg-[#1F6F50]/60 text-[#FFB703]'
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#1B1B1B]/60 text-[#F4EAD5]/60 border border-[#1F6F50]/30">
                      {concept.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-[#F4EAD5] group-hover:text-[#FFB703] transition-colors">
                    {concept.title}
                  </h3>
                  <p className="text-xs text-[#F4EAD5]/70 mt-1 line-clamp-2 leading-relaxed">
                    {concept.shortDesc}
                  </p>

                  <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-[#1F6F50]/30 text-[11px] text-[#F4EAD5]/50 font-mono">
                    <span>Links to:</span>
                    <span className="text-[#FFB703]">
                      {concept.connectedTo.length > 0 ? `${concept.connectedTo.length} nodes` : 'Terminal'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Concept Deep Dive Drawer */}
          {activeConcept && (
            <div className="bg-[#121212] border border-[#1F6F50] rounded-xl p-5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1F6F50]/40 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-[#1F6F50] text-[#FFB703]">
                    <activeConcept.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#FFB703] block">
                      Category: {activeConcept.category}
                    </span>
                    <h2 className="text-lg font-bold text-[#F4EAD5]">
                      {activeConcept.title}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#F4EAD5]/60">
                    Identifier: #{activeConcept.id}
                  </span>
                </div>
              </div>

              {/* Explanatory text */}
              <div className="p-4 rounded-lg bg-[#1B1B1B] border border-[#1F6F50]/30 text-xs sm:text-sm text-[#F4EAD5]/90 leading-relaxed">
                <p>{activeConcept.deepDive}</p>
              </div>

              {/* Connected Concepts Links */}
              {activeConcept.connectedTo.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase font-bold text-[#FFB703] block">
                    Ontological Causal Links (Flow to):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeConcept.connectedTo.map((targetId) => {
                      const targetNode = conceptMapNodes.find((n) => n.id === targetId);
                      if (!targetNode) return null;
                      return (
                        <button
                          key={targetId}
                          onClick={() => setSelectedConceptId(targetId)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1B1B1B] hover:bg-[#1F6F50] border border-[#1F6F50]/40 hover:border-[#FFB703] text-xs transition-colors"
                        >
                          <ArrowRight className="w-3.5 h-3.5 text-[#FFB703]" />
                          <span className="font-semibold text-[#F4EAD5]">{targetNode.title}</span>
                          <span className="text-[10px] font-mono text-[#F4EAD5]/50 uppercase">
                            ({targetNode.category})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

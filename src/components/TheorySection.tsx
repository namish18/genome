import React, { useState } from 'react';
import {
  BookOpen,
  Dna,
  GitBranch,
  Layers,
  Cpu,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Binary,
  ArrowRight,
} from 'lucide-react';

export const TheorySection: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('intro');

  const chapters = [
    { id: 'intro', title: '1. Sequence S1 Biological Background' },
    { id: 'olc_vs_dbg', title: '2. Hamiltonian (OLC) vs Eulerian (De Bruijn)' },
    { id: 'anatomy', title: '3. Anatomy of a De Bruijn Graph' },
    { id: 'choice_of_k', title: '4. The Parameter k Dilemma' },
    { id: 'artifacts', title: '5. Real-World Artifacts: Bubbles, Tips & Repeats' },
    { id: 'compaction', title: '6. Unitigs & Compacted Graphs' },
    { id: 'algorithm', title: "7. Hierholzer's Algorithm Implementation" },
  ];

  return (
    <div className="bg-[#121212] border border-[#1F6F50]/40 rounded-xl p-6 space-y-6 text-[#F4EAD5]">
      {/* Header */}
      <div className="border-b border-[#1F6F50]/40 pb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#FFB703]" />
          <h2 className="text-xl font-bold text-[#F4EAD5] font-sans">
            Bioinformatics & De Bruijn Graph Theory
          </h2>
        </div>
        <p className="text-xs text-[#F4EAD5]/70 mt-1">
          Theoretical foundations, mathematical formalisms, and computational paradigms in de novo genome assembly.
        </p>
      </div>

      {/* Chapter Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-[#1B1B1B] rounded-lg border border-[#1F6F50]/30">
        {chapters.map((ch) => (
          <button
            key={ch.id}
            onClick={() => setActiveSection(ch.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeSection === ch.id
                ? 'bg-[#1F6F50] text-[#FFB703] font-semibold shadow-sm border border-[#2E8B57]'
                : 'text-[#F4EAD5]/70 hover:text-[#F4EAD5]'
            }`}
          >
            {ch.title}
          </button>
        ))}
      </div>

      {/* Main Content Pane */}
      <div className="space-y-6 leading-relaxed text-sm text-[#F4EAD5]/90">
        {/* Chapter 1 */}
        {activeSection === 'intro' && (
          <section className="space-y-4 animate-in fade-in duration-150">
            <h3 className="text-base font-bold text-[#FFB703] font-sans flex items-center gap-2">
              <Dna className="w-4 h-4" />
              <span>1. The Genomic Dataset S1: Origin & Biochemical Properties</span>
            </h3>

            <div className="bg-[#1B1B1B] p-4 rounded-lg border border-[#1F6F50]/30 space-y-3">
              <p>
                The 800 base pair sequence <code>&gt;S1</code> investigated in this application corresponds
                to the genomic replication locus of <strong>Mycobacterium tuberculosis H37Rv</strong>,
                flanking the <em>dnaA</em> gene (chromosomal replication initiator protein).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3">
                <div className="p-3 bg-[#121212] rounded border border-[#1F6F50]/40">
                  <span className="text-[10px] font-mono text-[#F4EAD5]/60 block uppercase">GC Content</span>
                  <span className="text-lg font-mono font-bold text-[#FFB703]">65.25%</span>
                  <span className="text-[10px] text-[#F4EAD5]/60 block mt-0.5">Extreme High-GC Organism</span>
                </div>
                <div className="p-3 bg-[#121212] rounded border border-[#1F6F50]/40">
                  <span className="text-[10px] font-mono text-[#F4EAD5]/60 block uppercase">Melting Temperature</span>
                  <span className="text-lg font-mono font-bold text-[#2E8B57]">87.4 °C</span>
                  <span className="text-[10px] text-[#F4EAD5]/60 block mt-0.5">High Thermal Stability</span>
                </div>
                <div className="p-3 bg-[#121212] rounded border border-[#1F6F50]/40">
                  <span className="text-[10px] font-mono text-[#F4EAD5]/60 block uppercase">Sequence Length</span>
                  <span className="text-lg font-mono font-bold text-[#F4EAD5]">800 bp</span>
                  <span className="text-[10px] text-[#F4EAD5]/60 block mt-0.5">Standard Sanger / Contig Span</span>
                </div>
              </div>
              <h4 className="text-xs font-bold uppercase text-[#FFB703] pt-2">Why High-GC Genomes Challenge Assembly:</h4>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#F4EAD5]/80">
                <li>
                  <strong>Strong Triple Hydrogen Bonds:</strong> Cytosine and Guanine pair via three hydrogen bonds (compared to two in A-T pairs), dramatically stabilizing DNA secondary structures (hairpins, stem-loops).
                </li>
                <li>
                  <strong>PCR Amplification Bias:</strong> Next-generation sequencing (NGS) platforms such as Illumina show uneven coverage dropout in high-GC regions due to polymerase pausing and incomplete denaturation during library amplification.
                </li>
                <li>
                  <strong>K-mer Spectrum Distortion:</strong> High-GC sequences feature skewed k-mer frequency distributions, increasing repeat collisions and complex graph forks at small values of <em>k</em>.
                </li>
              </ul>
            </div>
          </section>
        )}

        {/* Chapter 2 */}
        {activeSection === 'olc_vs_dbg' && (
          <section className="space-y-4 animate-in fade-in duration-150">
            <h3 className="text-base font-bold text-[#FFB703] font-sans flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              <span>2. Overlap-Layout-Consensus (Hamiltonian) vs. De Bruijn (Eulerian)</span>
            </h3>

            <p>
              In computational biology, the two dominant paradigms for de novo genome assembly are{' '}
              <strong>Overlap-Layout-Consensus (OLC)</strong> and <strong>De Bruijn Graphs (DBG)</strong>.
              The transition from OLC to DBG represented one of the greatest algorithmic breakthroughs in bioinformatics.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* OLC Column */}
              <div className="bg-[#1B1B1B] p-4 rounded-lg border border-rose-900/40 space-y-2">
                <span className="text-xs font-mono font-bold text-rose-400 uppercase block">
                  Approach A: Overlap Graph (OLC)
                </span>
                <ul className="text-xs space-y-1.5 text-[#F4EAD5]/80 list-disc pl-4">
                  <li><strong>Nodes:</strong> Represent entire sequencing reads.</li>
                  <li><strong>Edges:</strong> Directed edges represent suffix-to-prefix overlaps between reads.</li>
                  <li>
                    <strong>Assembly Formulation:</strong> Find a path that visits <em>every vertex exactly once</em>.
                  </li>
                  <li>
                    <strong>Mathematical Problem:</strong> <strong className="text-rose-400">Hamiltonian Path Problem</strong>.
                  </li>
                  <li>
                    <strong>Computational Complexity:</strong> <span className="font-mono text-rose-400">NP-complete</span>. No known polynomial-time algorithm exists; heuristic approximations scale poorly with billions of short reads.
                  </li>
                </ul>
              </div>

              {/* De Bruijn Column */}
              <div className="bg-[#1B1B1B] p-4 rounded-lg border border-[#2E8B57]/50 space-y-2">
                <span className="text-xs font-mono font-bold text-[#FFB703] uppercase block">
                  Approach B: De Bruijn Graph (DBG)
                </span>
                <ul className="text-xs space-y-1.5 text-[#F4EAD5]/80 list-disc pl-4">
                  <li><strong>Nodes:</strong> Represent unique (<em>k</em> - 1)-mer prefixes and suffixes.</li>
                  <li><strong>Edges:</strong> Directed edges represent the <em>k</em>-mers themselves.</li>
                  <li>
                    <strong>Assembly Formulation:</strong> Find a path that visits <em>every directed edge exactly once</em>.
                  </li>
                  <li>
                    <strong>Mathematical Problem:</strong> <strong className="text-[#FFB703]">Eulerian Path Problem</strong>.
                  </li>
                  <li>
                    <strong>Computational Complexity:</strong> <span className="font-mono text-[#2E8B57]">O(|V| + |E|)</span> (Strictly Linear Time via Hierholzer's Algorithm). Feasible for gigabase-scale eukaryotic genomes.
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-3 bg-[#1F6F50]/20 rounded-lg border border-[#1F6F50]/40 text-xs">
              <strong>Historical Note:</strong> The De Bruijn graph was introduced by Dutch mathematician Nicolaas Govert de Bruijn in 1946 for combinatorial word problems. In 1995, Idury and Waterman adapted it for sequencing by hybridization, and in 2001, Pavel Pevzner, Haixu Tang, and Michael Waterman demonstrated its revolutionary effectiveness for whole-genome short-read assembly in the <em>Euler</em> assembler.
            </div>
          </section>
        )}

        {/* Chapter 3 */}
        {activeSection === 'anatomy' && (
          <section className="space-y-4 animate-in fade-in duration-150">
            <h3 className="text-base font-bold text-[#FFB703] font-sans flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              <span>3. Anatomy & Topological Conditions of a De Bruijn Graph</span>
            </h3>

            <p>
              Given a DNA sequence $S$ and an integer $k \ge 2$, the directed De Bruijn graph $G = (V, E)$ is constructed as follows:
            </p>

            <div className="bg-[#1B1B1B] p-4 rounded-lg border border-[#1F6F50]/30 space-y-3 font-mono text-xs">
              <div className="text-[#FFB703] font-bold">// Formal Graph Definition</div>
              <div>
                1. For each k-mer K in sequence S:<br />
                &nbsp;&nbsp;&nbsp;Prefix(K) = K[0 .. k-2]&nbsp;&nbsp;(length k-1)<br />
                &nbsp;&nbsp;&nbsp;Suffix(K) = K[1 .. k-1]&nbsp;&nbsp;(length k-1)<br />
                2. Vertices V = &#123; Prefix(K), Suffix(K) for all K &#125;<br />
                3. Directed Edges E = &#123; (Prefix(K) → Suffix(K)) for all K &#125;
              </div>
            </div>

            <h4 className="text-sm font-bold text-[#F4EAD5] pt-2">Degree Balance & Eulerian Trail Existence</h4>
            <p className="text-xs">
              For any vertex v ∈ V, let d_in(v) denote the number of incoming edges and d_out(v) denote the number of outgoing edges.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#1B1B1B] rounded border border-[#FFB703]/40">
                <span className="font-bold text-[#FFB703] block mb-1">Source Node (Assembly Start)</span>
                <p className="font-mono">d_out(v) - d_in(v) = +1</p>
                <p className="text-[#F4EAD5]/60 mt-1">The origin of the linear chromosome walk.</p>
              </div>

              <div className="p-3 bg-[#1B1B1B] rounded border border-[#2E8B57]/40">
                <span className="font-bold text-[#2E8B57] block mb-1">Sink Node (Assembly End)</span>
                <p className="font-mono">d_in(v) - d_out(v) = +1</p>
                <p className="text-[#F4EAD5]/60 mt-1">The termination of the linear chromosome walk.</p>
              </div>

              <div className="p-3 bg-[#1B1B1B] rounded border border-[#1F6F50]/50">
                <span className="font-bold text-[#F4EAD5] block mb-1">Internal Balanced Nodes</span>
                <p className="font-mono">d_in(v) = d_out(v)</p>
                <p className="text-[#F4EAD5]/60 mt-1">Every entry into v has an equal exit path.</p>
              </div>
            </div>

            <div className="p-3 bg-[#1F6F50]/20 rounded-lg border border-[#2E8B57]/40 text-xs">
              <strong>Eulerian Path Theorem:</strong> A weakly connected directed multigraph contains an Eulerian path if and only if:
              <br />
              (1) Exactly one vertex is a Source (d_out - d_in = 1),
              <br />
              (2) Exactly one vertex is a Sink (d_in - d_out = 1), and
              <br />
              (3) All other vertices satisfy d_in(v) = d_out(v).
            </div>
          </section>
        )}

        {/* Chapter 4 */}
        {activeSection === 'choice_of_k' && (
          <section className="space-y-4 animate-in fade-in duration-150">
            <h3 className="text-base font-bold text-[#FFB703] font-sans flex items-center gap-2">
              <Binary className="w-4 h-4" />
              <span>4. The Parameter k Dilemma: Sensitivity vs Specificity</span>
            </h3>

            <p>
              Selecting the optimal value for <em>k</em> is the central design decision in De Bruijn graph assembly. The parameter governs a fundamental mathematical trade-off:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#1B1B1B] rounded-lg border border-amber-900/40 space-y-2">
                <span className="font-bold text-amber-300 uppercase block font-mono">Small k (e.g. k = 3 or 4)</span>
                <ul className="list-disc pl-4 space-y-1 text-[#F4EAD5]/80">
                  <li><strong>High Sensitivity:</strong> Reads easily overlap; few gaps in connectivity.</li>
                  <li><strong>Severe Tangling:</strong> With only 4<sup>k-1</sup> available node states, repeated sequences collide into tangled hubs.</li>
                  <li><strong>Non-Unique Assembly:</strong> Millions of alternative Eulerian paths exist, making unambiguous chromosome reconstruction impossible.</li>
                </ul>
              </div>

              <div className="p-4 bg-[#1B1B1B] rounded-lg border border-emerald-900/40 space-y-2">
                <span className="font-bold text-[#2E8B57] uppercase block font-mono">Large k (e.g. k = 21, 31, 55)</span>
                <ul className="list-disc pl-4 space-y-1 text-[#F4EAD5]/80">
                  <li><strong>High Specificity:</strong> Repeats shorter than <em>k</em> are cleanly resolved into linear paths.</li>
                  <li><strong>Fragile Connectivity:</strong> Requires high sequencing depth. A single sequencing error or uncovered base breaks the chain of overlaps, shattering the graph into disconnected components.</li>
                </ul>
              </div>
            </div>

            <div className="p-3 bg-[#1F6F50]/20 rounded-lg border border-[#1F6F50]/40 text-xs space-y-1.5">
              <div className="font-bold text-[#FFB703]">Why k is Almost Always Odd in Practice:</div>
              <p>
                In double-stranded sequencing, both forward and reverse-complement strands are sequenced. If <em>k</em> were even, a <em>k</em>-mer could equal its own reverse complement (a palindromic k-mer, e.g. <code>ACGTACGT</code>), producing degenerate self-reverse edges that form false cycles. Choosing an <strong>odd k</strong> prevents exact self-complementary k-mers.
              </p>
            </div>
          </section>
        )}

        {/* Chapter 5 */}
        {activeSection === 'artifacts' && (
          <section className="space-y-4 animate-in fade-in duration-150">
            <h3 className="text-base font-bold text-[#FFB703] font-sans flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>5. Real-World Artifacts: Bubbles, Tips, and Repeats</span>
            </h3>

            <p>
              In idealized theoretical graphs, every base is perfectly sequenced. In real wet-lab high-throughput sequencing data, instrument errors and biological variation create distinctive topological artifacts:
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-[#1B1B1B] rounded-lg border border-[#1F6F50]/40 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-[#FFB703]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFB703]" />
                  <span>1. Bubbles (Diverging & Rejoining Paths)</span>
                </div>
                <p className="text-[#F4EAD5]/80">
                  <strong>Cause:</strong> A single nucleotide substitution error in a read, or a heterozygous single-nucleotide polymorphism (SNP) in diploid genomes.
                  <br />
                  <strong>Topology:</strong> A path splits at a fork node, travels through <em>k</em> alternative intermediate nodes with lower coverage, and rejoins the primary path at a sink node of equal length.
                  <br />
                  <strong>Resolution:</strong> Assemblers compare path coverage ("bubble popping") and remove the low-coverage alternative branch.
                </p>
              </div>

              <div className="p-3.5 bg-[#1B1B1B] rounded-lg border border-[#1F6F50]/40 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span>2. Dead-End Tips</span>
                </div>
                <p className="text-[#F4EAD5]/80">
                  <strong>Cause:</strong> Sequencing errors occurring near the beginning or end of a sequencing read.
                  <br />
                  <strong>Topology:</strong> A short branch that emerges from a valid contig path and dead-ends abruptly within fewer than <em>k</em> steps.
                  <br />
                  <strong>Resolution:</strong> "Tip clipping" algorithms prune all dead-end paths shorter than 2k with below-threshold coverage.
                </p>
              </div>

              <div className="p-3.5 bg-[#1B1B1B] rounded-lg border border-[#1F6F50]/40 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-[#2E8B57]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2E8B57]" />
                  <span>3. Complex Repeat Loops</span>
                </div>
                <p className="text-[#F4EAD5]/80">
                  <strong>Cause:</strong> Genomic repeats (transposons, tandem duplications, rRNA operons) longer than the read length <em>k</em>.
                  <br />
                  <strong>Topology:</strong> A cycle where multiple independent upstream regions enter the same repeated node, and multiple downstream regions leave it, creating an hourglass tangle.
                  <br />
                  <strong>Resolution:</strong> Paired-end reads and long reads (PacBio/Oxford Nanopore) provide long-range bridging constraints to scaffold through the repeats.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Chapter 6 */}
        {activeSection === 'compaction' && (
          <section className="space-y-4 animate-in fade-in duration-150">
            <h3 className="text-base font-bold text-[#FFB703] font-sans flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>6. Unitigs & Graph Compaction</span>
            </h3>

            <p>
              Raw De Bruijn graphs for whole genomes contain billions of vertices. Storing and traversing individual (<em>k</em> - 1)-mers is computationally memory-prohibitive.
            </p>

            <div className="bg-[#1B1B1B] p-4 rounded-lg border border-[#1F6F50]/30 space-y-3 text-xs">
              <h4 className="font-bold text-[#FFB703] uppercase">Maximal Non-Branching Paths (Unitigs):</h4>
              <p className="text-[#F4EAD5]/80">
                A node v with in-degree = 1 and out-degree = 1 is unambiguous: it has exactly one preceding neighbor and one succeeding neighbor. A sequence of such 1-in-1-out vertices forms a <strong>maximal non-branching path</strong>.
              </p>
              <div className="p-3 bg-[#121212] rounded border border-[#1F6F50]/40 font-mono">
                Vertex chain: (v1) → (v2) → (v3) → ... → (vn)<br />
                Where for all intermediate v_i: inDegree(v_i) = 1 AND outDegree(v_i) = 1.<br />
                Compacted result: Single contiguous sequence string = v1 + v2[-1] + v3[-1] + ... + vn[-1]
              </div>
              <p className="text-[#F4EAD5]/80">
                Compacting all non-branching paths into <strong>unitigs</strong> reduces graph size by 80% to 95% without losing a single base of assembly information.
              </p>
            </div>
          </section>
        )}

        {/* Chapter 7 */}
        {activeSection === 'algorithm' && (
          <section className="space-y-4 animate-in fade-in duration-150">
            <h3 className="text-base font-bold text-[#FFB703] font-sans flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>7. Hierholzer's Algorithm for Eulerian Trail Assembly</span>
            </h3>

            <p className="text-xs">
              Hierholzer's Algorithm finds an Eulerian path or circuit in a directed graph in linear time O(|E|) using a depth-first search (DFS) with backtrack merging:
            </p>

            <div className="bg-[#1B1B1B] p-4 rounded-lg border border-[#1F6F50]/40 font-mono text-xs space-y-2">
              <span className="text-[#FFB703] font-bold">// Hierholzer's Algorithm Pseudo-code</span>
              <pre className="text-[#F4EAD5]/80 leading-relaxed overflow-x-auto whitespace-pre">
{`function FindEulerianTrail(Graph G):
    // 1. Identify start node:
    // If a vertex has outDegree - inDegree == 1, start there.
    // Otherwise pick any vertex with outDegree > 0.
    startNode = FindSourceNode(G)
    
    stack = [startNode]
    trail = []
    
    while stack is not empty:
        current = stack.top()
        if G has unused outgoing edges from current:
            edge = G.removeOutgoingEdge(current)
            stack.push(edge.target)
        else:
            // Backtrack: when stuck, record vertex in reverse order
            trail.push(stack.pop())
            
    return Reverse(trail)`}
              </pre>
            </div>

            <div className="p-3 bg-[#1F6F50]/20 rounded-lg border border-[#2E8B57]/40 text-xs">
              <strong>Interactive Simulation:</strong> You can watch Hierholzer's algorithm reconstruct sequence <code>&gt;S1</code> in real time under the <strong>Eulerian Walk</strong> tab above!
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

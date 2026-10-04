import React, { useState, useMemo } from 'react';
import { Header } from './components/Header.tsx';
import { ShowDataModal } from './components/ShowDataModal.tsx';
import { GraphCanvas } from './components/GraphCanvas.tsx';
import { AssemblyControls } from './components/AssemblyControls.tsx';
import { EulerianWalkSimulator } from './components/EulerianWalkSimulator.tsx';
import { ContigViewer } from './components/ContigViewer.tsx';
import { KmerSpectrum } from './components/KmerSpectrum.tsx';
import { TheorySection } from './components/TheorySection.tsx';
import { GENOME_S1_SEQUENCE, S1_STATS } from './data/genomeData.ts';
import { buildDeBruijnGraph, generateEulerianAssemblyWalk } from './utils/debruijn.ts';
import { DbgNode } from './types/index.ts';
import {
  Network,
  Activity,
  Layers,
  Database,
  BookOpen,
  Dna,
  Sliders,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function App() {
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'visualizer' | 'simulator' | 'contigs' | 'kmers' | 'theory'
  >('visualizer');

  // Assembly Parameters
  const [k, setK] = useState<number>(5);
  const [windowSize, setWindowSize] = useState<number>(80);
  const [windowOffset, setWindowOffset] = useState<number>(0);
  const [layoutMode, setLayoutMode] = useState<'force' | 'flow'>('force');
  const [hasSimulatedError, setHasSimulatedError] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<DbgNode | null>(null);

  // Eulerian Walk Simulation State
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Derive active sequence based on window & simulated error
  const activeSequence = useMemo(() => {
    let raw = GENOME_S1_SEQUENCE.slice(windowOffset, windowOffset + windowSize);
    if (hasSimulatedError && raw.length > 25) {
      // Introduce an alternate base at position 25 to show a bubble
      const chars = raw.split('');
      const targetIdx = 25;
      chars[targetIdx] = chars[targetIdx] === 'A' ? 'G' : 'A';
      raw = chars.join('');
    }
    return raw;
  }, [windowOffset, windowSize, hasSimulatedError]);

  // Build the De Bruijn Graph
  const graph = useMemo(() => {
    return buildDeBruijnGraph(activeSequence, k);
  }, [activeSequence, k]);

  // Generate assembly walk steps
  const walkSteps = useMemo(() => {
    return generateEulerianAssemblyWalk(graph);
  }, [graph]);

  // Reset simulator step when graph changes
  React.useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [graph]);

  const currentStep = walkSteps[currentStepIndex] || walkSteps[0];
  const activeEulerianEdgeId = currentStep?.edgeTraversed?.id;
  const traversedEdgeIds = currentStep?.traversedEdgeIds;

  return (
    <div className="min-h-screen bg-[#1B1B1B] text-[#F4EAD5] flex flex-col font-sans">
      {/* Header */}
      <Header
        onOpenDataModal={() => setIsDataModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Overview & Context Card */}
        <div className="bg-[#121212] border border-[#1F6F50]/40 rounded-xl p-5 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#FFB703] bg-[#FFB703]/10 px-2 py-0.5 rounded border border-[#FFB703]/30">
                  DE BRUIJN GRAPH (k={k})
                </span>
                <span className="text-xs font-mono text-[#F4EAD5]/60">
                  Sequence Window: {windowSize} bp (pos {windowOffset + 1}-{Math.min(GENOME_S1_SEQUENCE.length, windowOffset + windowSize)})
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4EAD5]">
                Genome Construction Pipeline · Dataset &gt;S1
              </h1>
              <p className="text-xs sm:text-sm text-[#F4EAD5]/70 max-w-3xl leading-relaxed">
                Decomposes genomic sequence into directed {k}-mer edges bridging ({k - 1})-mer nodes.
                Linear-time Eulerian paths reconstruct the underlying DNA chromosome without reference alignment.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="bg-[#1B1B1B] border border-[#1F6F50]/40 px-3 py-2 rounded-lg text-center font-mono">
                <span className="text-[10px] text-[#F4EAD5]/60 block uppercase">Nodes (k-1)</span>
                <span className="text-base font-bold text-[#FFB703] tabular-nums">
                  {graph.nodeList.length}
                </span>
              </div>

              <div className="bg-[#1B1B1B] border border-[#1F6F50]/40 px-3 py-2 rounded-lg text-center font-mono">
                <span className="text-[10px] text-[#F4EAD5]/60 block uppercase">Edges (k)</span>
                <span className="text-base font-bold text-[#2E8B57] tabular-nums">
                  {graph.edges.length}
                </span>
              </div>

              <div className="bg-[#1B1B1B] border border-[#1F6F50]/40 px-3 py-2 rounded-lg text-center font-mono">
                <span className="text-[10px] text-[#F4EAD5]/60 block uppercase">Unitigs</span>
                <span className="text-base font-bold text-[#F4EAD5] tabular-nums">
                  {graph.unitigs.length}
                </span>
              </div>

              <button
                onClick={() => setIsDataModalOpen(true)}
                className="px-3.5 py-2 text-xs font-bold text-[#1B1B1B] bg-[#FFB703] hover:bg-[#e5a400] transition-colors rounded-lg flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Show Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Graph Visualizer */}
        {activeTab === 'visualizer' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Assembly Controls */}
            <AssemblyControls
              k={k}
              setK={setK}
              windowSize={windowSize}
              setWindowSize={setWindowSize}
              windowOffset={windowOffset}
              setWindowOffset={setWindowOffset}
              maxSeqLength={GENOME_S1_SEQUENCE.length}
              layoutMode={layoutMode}
              setLayoutMode={setLayoutMode}
              hasSimulatedError={hasSimulatedError}
              setHasSimulatedError={setHasSimulatedError}
            />

            {/* Interactive Graph Canvas */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[#F4EAD5]/70">
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-[#FFB703]" />
                  <span className="font-semibold text-[#F4EAD5]">Interactive Topological Graph Stage</span>
                </div>
                <span>Click & drag nodes to adjust positions · Mouse wheel to zoom</span>
              </div>

              <GraphCanvas
                graph={graph}
                activeEulerianEdgeId={activeEulerianEdgeId}
                traversedEdgeIds={traversedEdgeIds}
                highlightedNodeId={selectedNode?.id}
                onSelectNode={setSelectedNode}
                layoutMode={layoutMode}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Eulerian Walk Simulator */}
        {activeTab === 'simulator' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Controls */}
            <AssemblyControls
              k={k}
              setK={setK}
              windowSize={windowSize}
              setWindowSize={setWindowSize}
              windowOffset={windowOffset}
              setWindowOffset={setWindowOffset}
              maxSeqLength={GENOME_S1_SEQUENCE.length}
              layoutMode={layoutMode}
              setLayoutMode={setLayoutMode}
              hasSimulatedError={hasSimulatedError}
              setHasSimulatedError={setHasSimulatedError}
            />

            {/* Walk Player */}
            <EulerianWalkSimulator
              graph={graph}
              steps={walkSteps}
              currentStepIndex={currentStepIndex}
              setCurrentStepIndex={setCurrentStepIndex}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
            />

            {/* Live Canvas synchronization */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[#F4EAD5]/70">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#FFB703]" />
                  <span className="font-semibold text-[#F4EAD5]">Synchronized Eulerian Graph Traversal</span>
                </div>
                <span className="font-mono text-xs text-[#FFB703]">
                  Active Step: {currentStepIndex}/{Math.max(0, walkSteps.length - 1)}
                </span>
              </div>

              <GraphCanvas
                graph={graph}
                activeEulerianEdgeId={activeEulerianEdgeId}
                traversedEdgeIds={traversedEdgeIds}
                highlightedNodeId={currentStep?.currentNode}
                onSelectNode={setSelectedNode}
                layoutMode={layoutMode}
              />
            </div>
          </div>
        )}

        {/* Tab 3: Compacted Contigs / Unitigs */}
        {activeTab === 'contigs' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <AssemblyControls
              k={k}
              setK={setK}
              windowSize={windowSize}
              setWindowSize={setWindowSize}
              windowOffset={windowOffset}
              setWindowOffset={setWindowOffset}
              maxSeqLength={GENOME_S1_SEQUENCE.length}
              layoutMode={layoutMode}
              setLayoutMode={setLayoutMode}
              hasSimulatedError={hasSimulatedError}
              setHasSimulatedError={setHasSimulatedError}
            />
            <ContigViewer unitigs={graph.unitigs} k={k} />
          </div>
        )}

        {/* Tab 4: K-mer Spectrum */}
        {activeTab === 'kmers' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <AssemblyControls
              k={k}
              setK={setK}
              windowSize={windowSize}
              setWindowSize={setWindowSize}
              windowOffset={windowOffset}
              setWindowOffset={setWindowOffset}
              maxSeqLength={GENOME_S1_SEQUENCE.length}
              layoutMode={layoutMode}
              setLayoutMode={setLayoutMode}
              hasSimulatedError={hasSimulatedError}
              setHasSimulatedError={setHasSimulatedError}
            />
            <KmerSpectrum edges={graph.edges} k={k} />
          </div>
        )}

        {/* Tab 5: Comprehensive Theory */}
        {activeTab === 'theory' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <TheorySection />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1F6F50]/30 bg-[#121212] px-4 lg:px-8 py-4 text-xs text-[#F4EAD5]/60 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>De Bruijn Graph Genome Assembler · Sequence S1</span>
            <span aria-hidden="true">·</span>
            <span>Mycobacterium tuberculosis H37Rv</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDataModalOpen(true)}
              className="text-[#FFB703] hover:underline"
            >
              Show Data Record
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setActiveTab('theory')}
              className="text-[#2E8B57] hover:underline"
            >
              Theory Documentation
            </button>
          </div>
        </div>
      </footer>

      {/* Show Data Modal Popup */}
      <ShowDataModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
      />
    </div>
  );
}

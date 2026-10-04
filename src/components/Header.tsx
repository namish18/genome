import React from 'react';
import { Database, FileText, Share2, Sparkles, BookOpen, Activity, Network } from 'lucide-react';

interface HeaderProps {
  onOpenDataModal: () => void;
  activeTab: 'visualizer' | 'simulator' | 'contigs' | 'kmers' | 'theory';
  setActiveTab: (tab: 'visualizer' | 'simulator' | 'contigs' | 'kmers' | 'theory') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDataModal,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#1B1B1B]/95 backdrop-blur border-b border-[#1F6F50]/40 px-4 lg:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element brand wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1F6F50] border border-[#2E8B57] flex items-center justify-center text-[#FFB703] font-mono font-bold text-sm shadow-sm">
            dB
          </div>
          <span className="text-lg font-bold tracking-tight text-[#F4EAD5] font-sans">
            De Bruijn Genome Assembler
          </span>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#F4EAD5]/70">
          <button
            onClick={() => setActiveTab('visualizer')}
            className={`transition-colors flex items-center gap-1.5 pb-0.5 ${
              activeTab === 'visualizer'
                ? 'text-[#FFB703] border-b-2 border-[#FFB703] font-semibold'
                : 'hover:text-[#F4EAD5]'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>Graph Visualizer</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`transition-colors flex items-center gap-1.5 pb-0.5 ${
              activeTab === 'simulator'
                ? 'text-[#FFB703] border-b-2 border-[#FFB703] font-semibold'
                : 'hover:text-[#F4EAD5]'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Eulerian Walk</span>
          </button>

          <button
            onClick={() => setActiveTab('contigs')}
            className={`transition-colors flex items-center gap-1.5 pb-0.5 ${
              activeTab === 'contigs'
                ? 'text-[#FFB703] border-b-2 border-[#FFB703] font-semibold'
                : 'hover:text-[#F4EAD5]'
            }`}
          >
            <span>Compacted Unitigs</span>
          </button>

          <button
            onClick={() => setActiveTab('kmers')}
            className={`transition-colors flex items-center gap-1.5 pb-0.5 ${
              activeTab === 'kmers'
                ? 'text-[#FFB703] border-b-2 border-[#FFB703] font-semibold'
                : 'hover:text-[#F4EAD5]'
            }`}
          >
            <span>K-mer Spectrum</span>
          </button>

          <button
            onClick={() => setActiveTab('theory')}
            className={`transition-colors flex items-center gap-1.5 pb-0.5 ${
              activeTab === 'theory'
                ? 'text-[#FFB703] border-b-2 border-[#FFB703] font-semibold'
                : 'hover:text-[#F4EAD5]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Bioinformatics Theory</span>
          </button>
        </nav>

        {/* Zone 3: Primary action - "Show Data" button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenDataModal}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-[#1B1B1B] bg-[#FFB703] hover:bg-[#e5a400] transition-colors rounded-lg shadow-sm whitespace-nowrap active:scale-[0.98]"
            title="Inspect sequence S1 FASTA and nucleotide statistics"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Show Data</span>
          </button>
        </div>
      </div>

      {/* Mobile nav drawer row */}
      <div className="md:hidden flex items-center gap-3 overflow-x-auto pt-2.5 text-xs text-[#F4EAD5]/70 border-t border-[#1F6F50]/20 mt-2">
        <button
          onClick={() => setActiveTab('visualizer')}
          className={`px-2 py-1 rounded whitespace-nowrap ${
            activeTab === 'visualizer' ? 'bg-[#1F6F50] text-[#FFB703]' : ''
          }`}
        >
          Graph
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-2 py-1 rounded whitespace-nowrap ${
            activeTab === 'simulator' ? 'bg-[#1F6F50] text-[#FFB703]' : ''
          }`}
        >
          Walk
        </button>
        <button
          onClick={() => setActiveTab('contigs')}
          className={`px-2 py-1 rounded whitespace-nowrap ${
            activeTab === 'contigs' ? 'bg-[#1F6F50] text-[#FFB703]' : ''
          }`}
        >
          Unitigs
        </button>
        <button
          onClick={() => setActiveTab('kmers')}
          className={`px-2 py-1 rounded whitespace-nowrap ${
            activeTab === 'kmers' ? 'bg-[#1F6F50] text-[#FFB703]' : ''
          }`}
        >
          K-mers
        </button>
        <button
          onClick={() => setActiveTab('theory')}
          className={`px-2 py-1 rounded whitespace-nowrap ${
            activeTab === 'theory' ? 'bg-[#1F6F50] text-[#FFB703]' : ''
          }`}
        >
          Theory
        </button>
      </div>
    </header>
  );
};

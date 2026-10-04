import React, { useState, useMemo } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Dna,
  Search,
  ExternalLink,
  Info,
  BarChart2,
  FileCode,
} from 'lucide-react';
import {
  RAW_FASTA_HEADER,
  RAW_SEQUENCE_LINES,
  GENOME_S1_SEQUENCE,
  FULL_FASTA_TEXT,
  computeSequenceStats,
} from '../data/genomeData.ts';

interface ShowDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShowDataModal: React.FC<ShowDataModalProps> = ({ isOpen, onClose }) => {
  const [copiedType, setCopiedType] = useState<'fasta' | 'raw' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'formatted' | 'color' | 'fasta'>('color');

  const stats = useMemo(() => computeSequenceStats(GENOME_S1_SEQUENCE), []);

  // Search match highlight
  const cleanSearch = searchQuery.trim().toUpperCase();
  const searchMatches = useMemo(() => {
    if (!cleanSearch || cleanSearch.length < 2) return [];
    const matches: number[] = [];
    let idx = GENOME_S1_SEQUENCE.indexOf(cleanSearch);
    while (idx !== -1) {
      matches.push(idx);
      idx = GENOME_S1_SEQUENCE.indexOf(cleanSearch, idx + 1);
    }
    return matches;
  }, [cleanSearch]);

  if (!isOpen) return null;

  const handleCopyFasta = () => {
    navigator.clipboard.writeText(FULL_FASTA_TEXT);
    setCopiedType('fasta');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(GENOME_S1_SEQUENCE);
    setCopiedType('raw');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadFasta = () => {
    const blob = new Blob([FULL_FASTA_TEXT], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'genome_S1_m_tuberculosis.fasta';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getNucleotideClass = (base: string) => {
    switch (base) {
      case 'A':
        return 'text-rose-400 bg-rose-950/30';
      case 'T':
        return 'text-amber-300 bg-amber-950/30';
      case 'G':
        return 'text-[#FFB703] bg-amber-900/30';
      case 'C':
        return 'text-[#2E8B57] bg-emerald-950/30';
      default:
        return 'text-[#F4EAD5]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B1B1B]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-[#1B1B1B] border border-[#1F6F50] rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-[#F4EAD5]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#1F6F50]/40 flex items-center justify-between bg-[#1F6F50]/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#1F6F50]/60 text-[#FFB703]">
              <Dna className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-[#F4EAD5]">
                  Dataset Record: Sequence S1
                </h2>
                <span className="text-xs font-mono text-[#FFB703] bg-[#FFB703]/10 px-2 py-0.5 rounded border border-[#FFB703]/30">
                  {stats.length} bp
                </span>
              </div>
              <p className="text-xs text-[#F4EAD5]/70">
                Organism: Mycobacterium tuberculosis H37Rv (dnaA / Replication Origin)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadFasta}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#F4EAD5] bg-[#1F6F50]/50 hover:bg-[#1F6F50] rounded-lg transition-colors border border-[#2E8B57]/40"
              title="Download .fasta file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download FASTA</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#F4EAD5]/70 hover:text-[#F4EAD5] hover:bg-[#1F6F50]/40 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#1F6F50]/15 border border-[#1F6F50]/40 rounded-lg p-3">
              <span className="text-xs text-[#F4EAD5]/60 block font-mono">GC CONTENT</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold font-mono text-[#FFB703] tabular-nums">
                  {stats.gcContent}%
                </span>
              </div>
              <div className="w-full bg-[#1B1B1B] h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-[#FFB703] h-full"
                  style={{ width: `${stats.gcContent}%` }}
                />
              </div>
            </div>

            <div className="bg-[#1F6F50]/15 border border-[#1F6F50]/40 rounded-lg p-3">
              <span className="text-xs text-[#F4EAD5]/60 block font-mono">SEQUENCE LENGTH</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold font-mono text-[#F4EAD5] tabular-nums">
                  {stats.length}
                </span>
                <span className="text-xs font-mono text-[#F4EAD5]/60">bp</span>
              </div>
              <span className="text-xs text-[#2E8B57] mt-1 block">10 lines × 80 bp</span>
            </div>

            <div className="bg-[#1F6F50]/15 border border-[#1F6F50]/40 rounded-lg p-3">
              <span className="text-xs text-[#F4EAD5]/60 block font-mono">MELTING TEMP (Tm)</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold font-mono text-[#2E8B57] tabular-nums">
                  {stats.meltingTemp}
                </span>
                <span className="text-xs font-mono text-[#F4EAD5]/60">°C</span>
              </div>
              <span className="text-xs text-[#F4EAD5]/60 mt-1 block">High stability</span>
            </div>

            <div className="bg-[#1F6F50]/15 border border-[#1F6F50]/40 rounded-lg p-3">
              <span className="text-xs text-[#F4EAD5]/60 block font-mono">PURINE / PYRIMIDINE</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold font-mono text-[#F4EAD5] tabular-nums">
                  {(stats.purineCount / stats.length * 100).toFixed(1)}%
                </span>
                <span className="text-xs font-mono text-[#F4EAD5]/60">/ {(stats.pyrimidineCount / stats.length * 100).toFixed(1)}%</span>
              </div>
              <span className="text-xs text-[#F4EAD5]/60 mt-1 block">A+G: {stats.purineCount} | C+T: {stats.pyrimidineCount}</span>
            </div>
          </div>

          {/* Nucleotide Frequency Breakdown */}
          <div className="bg-[#1F6F50]/10 border border-[#1F6F50]/30 rounded-lg p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FFB703] mb-3">
              Base Composition Breakdown
            </h4>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-2.5 rounded bg-[#1B1B1B]/60 border border-rose-900/30">
                <div className="text-sm font-bold text-rose-400">Adenine (A)</div>
                <div className="text-xl font-mono font-bold text-[#F4EAD5] tabular-nums mt-0.5">
                  {stats.aCount}
                </div>
                <div className="text-xs text-[#F4EAD5]/60 font-mono">
                  {(stats.aCount / stats.length * 100).toFixed(2)}%
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#1B1B1B]/60 border border-amber-900/30">
                <div className="text-sm font-bold text-amber-300">Thymine (T)</div>
                <div className="text-xl font-mono font-bold text-[#F4EAD5] tabular-nums mt-0.5">
                  {stats.tCount}
                </div>
                <div className="text-xs text-[#F4EAD5]/60 font-mono">
                  {(stats.tCount / stats.length * 100).toFixed(2)}%
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#1B1B1B]/60 border border-yellow-900/30">
                <div className="text-sm font-bold text-[#FFB703]">Guanine (G)</div>
                <div className="text-xl font-mono font-bold text-[#F4EAD5] tabular-nums mt-0.5">
                  {stats.gCount}
                </div>
                <div className="text-xs text-[#F4EAD5]/60 font-mono">
                  {(stats.gCount / stats.length * 100).toFixed(2)}%
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#1B1B1B]/60 border border-emerald-900/30">
                <div className="text-sm font-bold text-[#2E8B57]">Cytosine (C)</div>
                <div className="text-xl font-mono font-bold text-[#F4EAD5] tabular-nums mt-0.5">
                  {stats.cCount}
                </div>
                <div className="text-xs text-[#F4EAD5]/60 font-mono">
                  {(stats.cCount / stats.length * 100).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          {/* Sequence Viewer Controls & Search */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#F4EAD5]/80">Format View:</span>
                <div className="inline-flex rounded-lg p-0.5 bg-[#1F6F50]/30 border border-[#1F6F50]/50 text-xs">
                  <button
                    onClick={() => setViewMode('color')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      viewMode === 'color'
                        ? 'bg-[#1F6F50] text-[#FFB703] font-semibold'
                        : 'text-[#F4EAD5]/70 hover:text-[#F4EAD5]'
                    }`}
                  >
                    Color-Coded Bases
                  </button>
                  <button
                    onClick={() => setViewMode('formatted')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      viewMode === 'formatted'
                        ? 'bg-[#1F6F50] text-[#FFB703] font-semibold'
                        : 'text-[#F4EAD5]/70 hover:text-[#F4EAD5]'
                    }`}
                  >
                    Numbered Blocks
                  </button>
                  <button
                    onClick={() => setViewMode('fasta')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      viewMode === 'fasta'
                        ? 'bg-[#1F6F50] text-[#FFB703] font-semibold'
                        : 'text-[#F4EAD5]/70 hover:text-[#F4EAD5]'
                    }`}
                  >
                    Raw FASTA
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#F4EAD5]/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search motif (e.g. TTGACC)..."
                    className="pl-8 pr-3 py-1 text-xs bg-[#1B1B1B] border border-[#1F6F50] rounded-lg text-[#F4EAD5] placeholder-[#F4EAD5]/40 focus:outline-none focus:border-[#FFB703] uppercase font-mono w-52"
                  />
                </div>
                {searchMatches.length > 0 && (
                  <span className="text-xs font-mono text-[#FFB703]">
                    {searchMatches.length} match{searchMatches.length > 1 ? 'es' : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Sequence Box */}
            <div className="bg-[#121212] border border-[#1F6F50]/60 rounded-xl p-4 font-mono text-xs overflow-x-auto relative">
              <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                <button
                  onClick={handleCopyFasta}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-[#1F6F50]/60 hover:bg-[#1F6F50] text-[#F4EAD5] rounded-md transition-colors border border-[#2E8B57]/50"
                  title="Copy full FASTA with header"
                >
                  {copiedType === 'fasta' ? (
                    <>
                      <Check className="w-3 h-3 text-[#FFB703]" />
                      <span className="text-[#FFB703]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy FASTA</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleCopyRaw}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-[#1B1B1B] hover:bg-[#1F6F50]/40 text-[#F4EAD5]/80 hover:text-[#F4EAD5] rounded-md transition-colors border border-[#1F6F50]/40"
                  title="Copy 800bp sequence string"
                >
                  {copiedType === 'raw' ? (
                    <>
                      <Check className="w-3 h-3 text-[#FFB703]" />
                      <span className="text-[#FFB703]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <FileCode className="w-3 h-3" />
                      <span>Copy Bases</span>
                    </>
                  )}
                </button>
              </div>

              {viewMode === 'fasta' ? (
                <pre className="text-[#F4EAD5]/90 whitespace-pre font-mono leading-relaxed pt-6">
                  {FULL_FASTA_TEXT}
                </pre>
              ) : viewMode === 'formatted' ? (
                <div className="space-y-1 pt-6 text-[#F4EAD5]/90">
                  <div className="text-[#FFB703] font-semibold">{RAW_FASTA_HEADER} (800 bp)</div>
                  {RAW_SEQUENCE_LINES.map((line, lineIdx) => {
                    const startPos = lineIdx * 80 + 1;
                    const endPos = (lineIdx + 1) * 80;
                    // Split line into 10-char blocks for high readability
                    const chunks = line.match(/.{1,10}/g) || [];
                    return (
                      <div key={lineIdx} className="flex items-center gap-3 hover:bg-[#1F6F50]/20 px-1 py-0.5 rounded">
                        <span className="w-16 text-right text-[#F4EAD5]/40 select-none tabular-nums">
                          {startPos}-{endPos}
                        </span>
                        <div className="flex gap-2">
                          {chunks.map((chunk, cIdx) => (
                            <span key={cIdx} className="tracking-wider">
                              {chunk}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Color-coded base mode */
                <div className="space-y-1.5 pt-6">
                  <div className="text-[#FFB703] font-semibold mb-2">{RAW_FASTA_HEADER}</div>
                  {RAW_SEQUENCE_LINES.map((line, lineIdx) => {
                    const startPos = lineIdx * 80 + 1;
                    return (
                      <div key={lineIdx} className="flex items-start gap-3 hover:bg-[#1F6F50]/15 px-1 py-0.5 rounded">
                        <span className="w-12 text-right text-[#F4EAD5]/40 select-none tabular-nums pt-0.5">
                          {startPos}
                        </span>
                        <div className="flex flex-wrap gap-x-1.5 gap-y-1 flex-1 font-mono tracking-wide leading-none">
                          {line.split('').map((base, charIdx) => {
                            const globalPos = lineIdx * 80 + charIdx;
                            const isSearchMatch =
                              cleanSearch.length > 1 &&
                              searchMatches.some(
                                (m) => globalPos >= m && globalPos < m + cleanSearch.length
                              );

                            return (
                              <span
                                key={charIdx}
                                className={`px-0.5 py-0.5 rounded font-bold transition-transform ${
                                  isSearchMatch
                                    ? 'bg-[#FFB703] text-[#1B1B1B] ring-2 ring-[#FFB703] scale-125 z-10'
                                    : getNucleotideClass(base)
                                }`}
                                title={`Pos ${globalPos + 1}: ${base}`}
                              >
                                {base}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Biological Background Banner */}
          <div className="bg-[#1F6F50]/20 border border-[#2E8B57]/50 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-[#FFB703] font-bold">
              <Info className="w-4 h-4" />
              <span>Bioinformatics Context: The Mycobacterium tuberculosis Replication Origin</span>
            </div>
            <p className="text-[#F4EAD5]/80 leading-relaxed">
              This 800 bp genomic segment derives from the <em>Mycobacterium tuberculosis</em> H37Rv
              chromosome near the <strong>dnaA</strong> replication initiator gene. With a pronounced GC
              content of <strong>65.25%</strong>, this sequence serves as an ideal benchmark for De
              Bruijn graph de novo assembly because high-GC microbial genomes generate complex secondary
              structures and severe sequencing bias in next-generation sequencing (NGS).
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#1F6F50]/40 flex items-center justify-between bg-[#1B1B1B]">
          <div className="text-xs text-[#F4EAD5]/60 flex items-center gap-3">
            <span>Color Palette: Pine Core, Forest Mint, Citrus Peel, Linen Pulp, Night Drunk</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-[#1B1B1B] bg-[#FFB703] hover:bg-[#e5a400] transition-colors rounded-lg"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

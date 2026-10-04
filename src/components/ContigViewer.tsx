import React, { useState } from 'react';
import { Copy, Check, Scissors, Layers, CheckCircle2 } from 'lucide-react';

interface ContigViewerProps {
  unitigs: string[];
  k: number;
}

export const ContigViewer: React.FC<ContigViewerProps> = ({ unitigs, k }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Compute N50 and statistics
  const sortedUnitigs = [...unitigs].sort((a, b) => b.length - a.length);
  const totalLength = sortedUnitigs.reduce((acc, c) => acc + c.length, 0);

  let cumulative = 0;
  let n50 = 0;
  for (const c of sortedUnitigs) {
    cumulative += c.length;
    if (cumulative >= totalLength / 2) {
      n50 = c.length;
      break;
    }
  }

  const handleCopyContig = (seq: string, idx: number) => {
    navigator.clipboard.writeText(seq);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="bg-[#121212] border border-[#1F6F50]/40 rounded-xl p-5 space-y-5 text-[#F4EAD5]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1F6F50]/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#FFB703]" />
            <h3 className="text-base font-bold text-[#F4EAD5] font-sans">
              Compacted De Bruijn Graph & Unitigs
            </h3>
          </div>
          <p className="text-xs text-[#F4EAD5]/70 mt-1">
            Maximal non-branching paths collapsed into contiguous assembly blocks (unitigs).
          </p>
        </div>

        {/* N50 / Total Contigs */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="p-2 rounded bg-[#1B1B1B] border border-[#1F6F50]/40 text-center">
            <span className="text-[#F4EAD5]/60 block text-[10px]">TOTAL UNITIGS</span>
            <span className="text-base font-bold text-[#FFB703]">{unitigs.length}</span>
          </div>
          <div className="p-2 rounded bg-[#1B1B1B] border border-[#1F6F50]/40 text-center">
            <span className="text-[#F4EAD5]/60 block text-[10px]">N50 LENGTH</span>
            <span className="text-base font-bold text-[#2E8B57]">{n50} bp</span>
          </div>
          <div className="p-2 rounded bg-[#1B1B1B] border border-[#1F6F50]/40 text-center">
            <span className="text-[#F4EAD5]/60 block text-[10px]">LONGEST CONTIG</span>
            <span className="text-base font-bold text-[#F4EAD5]">
              {sortedUnitigs[0]?.length || 0} bp
            </span>
          </div>
        </div>
      </div>

      {/* Explanation Banner */}
      <div className="bg-[#1F6F50]/20 border border-[#2E8B57]/40 rounded-lg p-3 text-xs leading-relaxed text-[#F4EAD5]/90 flex items-start gap-2.5">
        <Scissors className="w-4 h-4 text-[#FFB703] shrink-0 mt-0.5" />
        <div>
          <strong>Why Graph Compaction Matters in De Novo Assembly:</strong> In real sequencing data, storing every individual k-mer and (k-1)-mer vertex consumes gigabytes of memory. A node with in-degree = 1 and out-degree = 1 has an unambiguous forward and backward neighbor. Collapsing these paths reduces graph complexity by orders of magnitude while preserving 100% of topological information.
        </div>
      </div>

      {/* Contig List */}
      <div className="space-y-3">
        {sortedUnitigs.map((unitig, idx) => (
          <div
            key={idx}
            className="bg-[#1B1B1B] border border-[#1F6F50]/40 rounded-lg p-3 hover:border-[#FFB703]/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#FFB703]">
                  Unitig #{idx + 1}
                </span>
                <span className="text-[11px] font-mono text-[#2E8B57] bg-[#2E8B57]/10 px-2 py-0.5 rounded border border-[#2E8B57]/30">
                  {unitig.length} bp
                </span>
                <span className="text-[11px] font-mono text-[#F4EAD5]/50">
                  ({unitig.length - k + 1} k-mers)
                </span>
              </div>

              <button
                onClick={() => handleCopyContig(unitig, idx)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#F4EAD5]/80 hover:text-[#F4EAD5] bg-[#121212] hover:bg-[#1F6F50]/40 rounded border border-[#1F6F50]/40 transition-colors"
              >
                {copiedIndex === idx ? (
                  <>
                    <Check className="w-3 h-3 text-[#FFB703]" />
                    <span className="text-[#FFB703]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-[#0E0E0E] rounded p-2 font-mono text-xs text-[#F4EAD5]/90 break-all leading-relaxed max-h-24 overflow-y-auto">
              {unitig}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

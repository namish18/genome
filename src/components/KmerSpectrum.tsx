import React, { useState, useMemo } from 'react';
import { Search, Download, Filter, Database, ArrowRight } from 'lucide-react';
import { DbgEdge } from '../types/index.ts';

interface KmerSpectrumProps {
  edges: DbgEdge[];
  k: number;
}

export const KmerSpectrum: React.FC<KmerSpectrumProps> = ({ edges, k }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyRepeats, setOnlyRepeats] = useState(false);
  const [sortBy, setSortBy] = useState<'kmer' | 'count' | 'position'>('position');

  const filteredEdges = useMemo(() => {
    let result = edges.filter((e) => {
      if (onlyRepeats && e.count < 2) return false;
      if (searchTerm) {
        const term = searchTerm.toUpperCase();
        return (
          e.kmer.includes(term) ||
          e.source.includes(term) ||
          e.target.includes(term)
        );
      }
      return true;
    });

    if (sortBy === 'count') {
      result.sort((a, b) => b.count - a.count);
    } else if (sortBy === 'kmer') {
      result.sort((a, b) => a.kmer.localeCompare(b.kmer));
    } else {
      result.sort((a, b) => (a.indices[0] || 0) - (b.indices[0] || 0));
    }

    return result;
  }, [edges, searchTerm, onlyRepeats, sortBy]);

  const handleExportCSV = () => {
    const header = 'kmer,prefix,suffix,count,positions\n';
    const rows = filteredEdges
      .map(
        (e) =>
          `"${e.kmer}","${e.source}","${e.target}",${e.count},"${e.indices.map((i) => i + 1).join(';')}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kmer_spectrum_k${k}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const repeatCount = edges.filter((e) => e.count > 1).length;

  return (
    <div className="bg-[#121212] border border-[#1F6F50]/40 rounded-xl p-5 space-y-4 text-[#F4EAD5]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1F6F50]/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#FFB703]" />
            <h3 className="text-base font-bold text-[#F4EAD5] font-sans">
              k-mer Spectrum & Multiplicity Table
            </h3>
          </div>
          <p className="text-xs text-[#F4EAD5]/70 mt-1">
            Complete dictionary of {edges.length} unique {k}-mers forming the directed graph edges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#F4EAD5] bg-[#1F6F50]/40 hover:bg-[#1F6F50] rounded-lg border border-[#2E8B57]/40 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1B1B1B] p-3 rounded-lg border border-[#1F6F50]/30 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#F4EAD5]/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search k-mer, prefix, or suffix..."
              className="pl-8 pr-3 py-1.5 text-xs bg-[#121212] border border-[#1F6F50] rounded-lg text-[#F4EAD5] placeholder-[#F4EAD5]/40 focus:outline-none focus:border-[#FFB703] uppercase font-mono w-full"
            />
          </div>

          <button
            onClick={() => setOnlyRepeats(!onlyRepeats)}
            className={`px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
              onlyRepeats
                ? 'bg-[#1F6F50] border-[#FFB703] text-[#FFB703] font-semibold'
                : 'bg-[#121212] border-[#1F6F50]/40 text-[#F4EAD5]/70 hover:text-[#F4EAD5]'
            }`}
          >
            <Filter className="w-3 h-3" />
            <span>Repeats Only ({repeatCount})</span>
          </button>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 font-mono">
          <span className="text-[#F4EAD5]/60">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#121212] border border-[#1F6F50]/60 rounded px-2 py-1 text-[#F4EAD5] focus:outline-none"
          >
            <option value="position">Sequence Order</option>
            <option value="count">Multiplicity (Highest)</option>
            <option value="kmer">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="border border-[#1F6F50]/40 rounded-lg overflow-hidden max-h-[460px] overflow-y-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#1F6F50]/30 text-[#FFB703] border-b border-[#1F6F50]/40 sticky top-0 backdrop-blur z-10">
            <tr>
              <th className="py-2.5 px-3">#</th>
              <th className="py-2.5 px-3">k-mer (Edge)</th>
              <th className="py-2.5 px-3">Prefix Node (u)</th>
              <th className="py-2.5 px-3 text-center">→</th>
              <th className="py-2.5 px-3">Suffix Node (v)</th>
              <th className="py-2.5 px-3 text-center">Multiplicity</th>
              <th className="py-2.5 px-3">Start Position(s)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F6F50]/20 bg-[#121212]">
            {filteredEdges.map((edge, idx) => (
              <tr key={edge.id} className="hover:bg-[#1F6F50]/15 transition-colors">
                <td className="py-2 px-3 text-[#F4EAD5]/40 select-none">{idx + 1}</td>
                <td className="py-2 px-3 font-bold text-[#FFB703]">{edge.kmer}</td>
                <td className="py-2 px-3 text-[#F4EAD5]/80">{edge.source}</td>
                <td className="py-2 px-3 text-center text-[#2E8B57]">
                  <ArrowRight className="w-3 h-3 inline" />
                </td>
                <td className="py-2 px-3 text-[#F4EAD5]/80">{edge.target}</td>
                <td className="py-2 px-3 text-center">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-bold ${
                      edge.count > 1
                        ? 'bg-[#FFB703] text-[#1B1B1B]'
                        : 'bg-[#1F6F50]/30 text-[#F4EAD5]/80'
                    }`}
                  >
                    ×{edge.count}
                  </span>
                </td>
                <td className="py-2 px-3 text-[#F4EAD5]/60">
                  {edge.indices.map((i) => i + 1).join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

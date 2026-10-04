import React from 'react';
import { Sliders, Eye, AlertTriangle, RefreshCw, Zap, Sparkles } from 'lucide-react';

interface AssemblyControlsProps {
  k: number;
  setK: (k: number) => void;
  windowSize: number;
  setWindowSize: (size: number) => void;
  windowOffset: number;
  setWindowOffset: (offset: number) => void;
  maxSeqLength: number;
  layoutMode: 'force' | 'flow';
  setLayoutMode: (mode: 'force' | 'flow') => void;
  hasSimulatedError: boolean;
  setHasSimulatedError: (val: boolean) => void;
}

export const AssemblyControls: React.FC<AssemblyControlsProps> = ({
  k,
  setK,
  windowSize,
  setWindowSize,
  windowOffset,
  setWindowOffset,
  maxSeqLength,
  layoutMode,
  setLayoutMode,
  hasSimulatedError,
  setHasSimulatedError,
}) => {
  const kPresets = [3, 4, 5, 7, 9, 11, 15, 21];

  const windowPresets = [
    { label: 'Micro (60 bp)', size: 60 },
    { label: 'Medium (150 bp)', size: 150 },
    { label: 'Macro (350 bp)', size: 350 },
    { label: 'Full (800 bp)', size: 800 },
  ];

  return (
    <div className="bg-[#121212] border border-[#1F6F50]/40 rounded-xl p-4 space-y-4 text-[#F4EAD5]">
      <div className="flex items-center justify-between border-b border-[#1F6F50]/40 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#FFB703]" />
          <h3 className="text-sm font-bold text-[#F4EAD5] font-sans">
            Assembly & Graph Parameters
          </h3>
        </div>
        <span className="text-xs text-[#F4EAD5]/60 font-mono">
          Interactive Calibration
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. K-mer Length Selector */}
        <div className="space-y-2 bg-[#1B1B1B] p-3 rounded-lg border border-[#1F6F50]/30">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#F4EAD5]/90">
              k-mer Length (k):
            </label>
            <span className="text-sm font-mono font-bold text-[#FFB703] bg-[#FFB703]/10 px-2 py-0.5 rounded border border-[#FFB703]/30">
              k = {k}
            </span>
          </div>

          <input
            type="range"
            min={3}
            max={25}
            step={1}
            value={k}
            onChange={(e) => setK(parseInt(e.target.value))}
            className="w-full accent-[#FFB703] cursor-pointer"
          />

          <div className="flex flex-wrap gap-1 pt-1">
            {kPresets.map((preset) => (
              <button
                key={preset}
                onClick={() => setK(preset)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  k === preset
                    ? 'bg-[#1F6F50] text-[#FFB703] font-bold border border-[#2E8B57]'
                    : 'bg-[#121212] text-[#F4EAD5]/70 hover:bg-[#1F6F50]/40 border border-[#1F6F50]/30'
                }`}
              >
                k={preset}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-[#F4EAD5]/60 leading-tight">
            Nodes represent ({k - 1})-mers; directed edges represent {k}-mers.
          </p>
        </div>

        {/* 2. Sequence Window / Slice */}
        <div className="space-y-2 bg-[#1B1B1B] p-3 rounded-lg border border-[#1F6F50]/30">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#F4EAD5]/90">
              Sequence Window:
            </label>
            <span className="text-sm font-mono font-bold text-[#2E8B57] bg-[#2E8B57]/10 px-2 py-0.5 rounded border border-[#2E8B57]/30">
              {windowSize} bp
            </span>
          </div>

          <div className="flex flex-wrap gap-1">
            {windowPresets.map((p) => (
              <button
                key={p.size}
                onClick={() => {
                  setWindowSize(p.size);
                  setWindowOffset(0);
                }}
                className={`px-2 py-1 rounded text-[11px] font-mono transition-colors flex-1 text-center ${
                  windowSize === p.size
                    ? 'bg-[#1F6F50] text-[#FFB703] font-bold border border-[#2E8B57]'
                    : 'bg-[#121212] text-[#F4EAD5]/70 hover:bg-[#1F6F50]/40 border border-[#1F6F50]/30'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {windowSize < maxSeqLength && (
            <div className="pt-1 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[#F4EAD5]/60 font-mono">
                <span>Start Offset:</span>
                <span>pos {windowOffset + 1} - {Math.min(maxSeqLength, windowOffset + windowSize)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={Math.max(0, maxSeqLength - windowSize)}
                value={windowOffset}
                onChange={(e) => setWindowOffset(parseInt(e.target.value))}
                className="w-full accent-[#2E8B57] cursor-pointer"
              />
            </div>
          )}
          <p className="text-[11px] text-[#F4EAD5]/60 leading-tight">
            Micro slices provide crystal-clear readable node sequences on screen.
          </p>
        </div>

        {/* 3. Layout Mode & Error Simulator */}
        <div className="space-y-2.5 bg-[#1B1B1B] p-3 rounded-lg border border-[#1F6F50]/30">
          <label className="text-xs font-semibold text-[#F4EAD5]/90 block">
            Graph Topology & Artifact Simulation:
          </label>

          <div className="flex rounded-md p-0.5 bg-[#121212] border border-[#1F6F50]/40 text-xs">
            <button
              onClick={() => setLayoutMode('force')}
              className={`flex-1 py-1 rounded font-medium transition-colors ${
                layoutMode === 'force'
                  ? 'bg-[#1F6F50] text-[#FFB703]'
                  : 'text-[#F4EAD5]/70 hover:text-[#F4EAD5]'
              }`}
            >
              Force Network
            </button>
            <button
              onClick={() => setLayoutMode('flow')}
              className={`flex-1 py-1 rounded font-medium transition-colors ${
                layoutMode === 'flow'
                  ? 'bg-[#1F6F50] text-[#FFB703]'
                  : 'text-[#F4EAD5]/70 hover:text-[#F4EAD5]'
              }`}
            >
              Sequence Flow (DAG)
            </button>
          </div>

          {/* Error Injection Switch */}
          <div className="pt-1">
            <button
              onClick={() => setHasSimulatedError(!hasSimulatedError)}
              className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors border ${
                hasSimulatedError
                  ? 'bg-amber-950/40 border-[#FFB703] text-[#FFB703]'
                  : 'bg-[#121212] border-[#1F6F50]/40 text-[#F4EAD5]/70 hover:text-[#F4EAD5]'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>
                {hasSimulatedError ? 'Error Injected (Bubble Active)' : 'Simulate SNP / Read Error'}
              </span>
            </button>
            <span className="text-[10px] text-[#F4EAD5]/50 block mt-1">
              Demonstrates bubble formation (diverging & rejoining paths).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

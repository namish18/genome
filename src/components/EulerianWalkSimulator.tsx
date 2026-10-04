import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  CheckCircle2,
  FastForward,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { AssemblyStep, DeBruijnGraph } from '../types/index.ts';

interface EulerianWalkSimulatorProps {
  graph: DeBruijnGraph;
  steps: AssemblyStep[];
  currentStepIndex: number;
  setCurrentStepIndex: (stepIndex: number | ((prev: number) => number)) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean | ((prev: boolean) => boolean)) => void;
}

export const EulerianWalkSimulator: React.FC<EulerianWalkSimulatorProps> = ({
  graph,
  steps,
  currentStepIndex,
  setCurrentStepIndex,
  isPlaying,
  setIsPlaying,
}) => {
  const [speed, setSpeed] = useState<number>(1); // 0.5x, 1x, 2x, 5x, 10x
  const reconstructedContainerRef = useRef<HTMLDivElement>(null);

  const totalSteps = Math.max(0, steps.length - 1);
  const currentStep = steps[currentStepIndex] || steps[0];

  // Playback timer
  useEffect(() => {
    if (!isPlaying) return;

    if (currentStepIndex >= totalSteps) {
      setIsPlaying(false);
      return;
    }

    const intervalMs = Math.max(25, 400 / speed);
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= totalSteps) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, currentStepIndex, totalSteps, speed, setIsPlaying, setCurrentStepIndex]);

  // Auto-scroll reconstructed sequence to end as it builds
  useEffect(() => {
    if (reconstructedContainerRef.current) {
      reconstructedContainerRef.current.scrollLeft = reconstructedContainerRef.current.scrollWidth;
    }
  }, [currentStep?.reconstructedSequence]);

  const handleStepForward = () => {
    setIsPlaying(false);
    if (currentStepIndex < totalSteps) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleStepBack = () => {
    setIsPlaying(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const handleFastForward = () => {
    setIsPlaying(false);
    setCurrentStepIndex(totalSteps);
  };

  const isComplete = currentStepIndex >= totalSteps && totalSteps > 0;
  const targetSeq = graph.sequence;
  const currentReconstructed = currentStep?.reconstructedSequence || '';
  const isMatchSoFar = targetSeq.startsWith(currentReconstructed);
  const matchPercent = targetSeq.length > 0
    ? Math.round((currentReconstructed.length / targetSeq.length) * 100)
    : 0;

  return (
    <div className="bg-[#121212] border border-[#1F6F50]/40 rounded-xl p-5 space-y-5 text-[#F4EAD5]">
      {/* Header and Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1F6F50]/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#F4EAD5] font-sans">
              Eulerian Trail Genome Reconstruction
            </h3>
            <span className="text-xs font-mono text-[#FFB703] bg-[#FFB703]/10 px-2 py-0.5 rounded border border-[#FFB703]/30">
              Hierholzer's Algorithm Simulation
            </span>
          </div>
          <p className="text-xs text-[#F4EAD5]/70 mt-1">
            Traverses every directed k-mer edge exactly once to reconstruct the original linear chromosome sequence.
          </p>
        </div>

        {/* Progress percent badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-[#F4EAD5]/60 block font-mono">ASSEMBLY PROGRESS</span>
            <span className="text-lg font-mono font-bold text-[#FFB703] tabular-nums">
              {matchPercent}%
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#1F6F50]/30 border border-[#2E8B57] flex items-center justify-center font-mono font-bold text-xs text-[#FFB703]">
            {isComplete ? '✓' : `${currentStepIndex}/${totalSteps}`}
          </div>
        </div>
      </div>

      {/* Playback Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#1B1B1B] p-3 rounded-lg border border-[#1F6F50]/30">
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-[#1F6F50]/30 hover:bg-[#1F6F50]/60 text-[#F4EAD5] transition-colors"
            title="Reset walk to start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleStepBack}
            disabled={currentStepIndex === 0}
            className="p-2 rounded-lg bg-[#1F6F50]/30 hover:bg-[#1F6F50]/60 disabled:opacity-30 disabled:pointer-events-none text-[#F4EAD5] transition-colors"
            title="Step backward"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="px-4 py-2 rounded-lg bg-[#FFB703] hover:bg-[#e5a400] text-[#1B1B1B] font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>{currentStepIndex === totalSteps ? 'Replay' : 'Play Walk'}</span>
              </>
            )}
          </button>
          <button
            onClick={handleStepForward}
            disabled={currentStepIndex >= totalSteps}
            className="p-2 rounded-lg bg-[#1F6F50]/30 hover:bg-[#1F6F50]/60 disabled:opacity-30 disabled:pointer-events-none text-[#F4EAD5] transition-colors"
            title="Step forward"
          >
            <SkipForward className="w-4 h-4" />
          </button>
          <button
            onClick={handleFastForward}
            disabled={currentStepIndex >= totalSteps}
            className="p-2 rounded-lg bg-[#1F6F50]/30 hover:bg-[#1F6F50]/60 disabled:opacity-30 disabled:pointer-events-none text-[#F4EAD5] transition-colors"
            title="Fast-forward to completion"
          >
            <FastForward className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#F4EAD5]/60 font-mono">Speed:</span>
          <div className="inline-flex rounded-md p-0.5 bg-[#1F6F50]/20 border border-[#1F6F50]/40 font-mono">
            {[0.5, 1, 2, 5, 10].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  speed === s
                    ? 'bg-[#1F6F50] text-[#FFB703] font-bold'
                    : 'text-[#F4EAD5]/70 hover:text-[#F4EAD5]'
                }`}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current Step Telemetry Box */}
      {currentStep && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#1B1B1B] p-3 rounded-lg border border-[#1F6F50]/30 font-mono">
            <span className="text-[10px] text-[#F4EAD5]/60 block uppercase">Current Node (Prefix)</span>
            <div className="text-sm font-bold text-[#FFB703] mt-1 break-all">
              {currentStep.currentNode || '—'}
            </div>
            <span className="text-[10px] text-[#F4EAD5]/50 mt-1 block">
              Length: {currentStep.currentNode.length} nt
            </span>
          </div>

          <div className="bg-[#1B1B1B] p-3 rounded-lg border border-[#1F6F50]/30 font-mono">
            <span className="text-[10px] text-[#F4EAD5]/60 block uppercase">Edge Traversed (k-mer)</span>
            <div className="text-sm font-bold text-[#2E8B57] mt-1 break-all flex items-center gap-1.5">
              <span>{currentStep.edgeTraversed?.kmer || 'Start Position'}</span>
              {currentStep.edgeTraversed && (
                <span className="text-[10px] text-[#FFB703] bg-[#FFB703]/20 px-1 rounded">
                  +{currentStep.edgeTraversed.kmer.slice(-1)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-[#F4EAD5]/50 mt-1 block">
              Remaining edges: {currentStep.remainingEdgesCount}
            </span>
          </div>

          <div className="bg-[#1B1B1B] p-3 rounded-lg border border-[#1F6F50]/30 font-mono">
            <span className="text-[10px] text-[#F4EAD5]/60 block uppercase">Assembled Length</span>
            <div className="text-sm font-bold text-[#F4EAD5] mt-1 tabular-nums">
              {currentReconstructed.length} / {targetSeq.length} bp
            </div>
            <span className="text-[10px] text-[#2E8B57] mt-1 block">
              {isComplete ? 'Assembly complete (100%)' : 'Walking Eulerian trail...'}
            </span>
          </div>
        </div>
      )}

      {/* Live Reconstructed Sequence Terminal */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#F4EAD5]/80 font-mono">
            Reconstructed Sequence String:
          </span>
          <span className="font-mono text-[#F4EAD5]/60">
            {currentReconstructed.length} bases
          </span>
        </div>

        <div
          ref={reconstructedContainerRef}
          className="bg-[#0B0E17] border border-[#1F6F50]/50 rounded-lg p-3 font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed tracking-wider"
        >
          {currentReconstructed.length === 0 ? (
            <span className="text-[#F4EAD5]/30 italic">Click Play to begin reconstruction...</span>
          ) : (
            <>
              <span className="text-[#F4EAD5]/90">
                {currentReconstructed.slice(0, Math.max(0, currentReconstructed.length - 1))}
              </span>
              <span className="text-[#FFB703] font-bold bg-[#FFB703]/20 px-0.5 rounded ring-1 ring-[#FFB703] animate-pulse">
                {currentReconstructed.slice(-1)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Assembly Accuracy Validation */}
      {isComplete && (
        <div className="bg-[#1F6F50]/30 border border-[#2E8B57] rounded-lg p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#FFB703] shrink-0" />
          <div className="text-xs">
            <div className="font-bold text-[#FFB703]">
              Eulerian Trail Successfully Completed!
            </div>
            <div className="text-[#F4EAD5]/80 mt-0.5">
              Every directed edge in the De Bruijn graph was visited exactly once. The reconstructed sequence
              perfectly matches the original genomic sequence ({targetSeq.length} bp) with 100% fidelity.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

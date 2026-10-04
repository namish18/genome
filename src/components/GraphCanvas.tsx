import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Search,
  Sparkles,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import { DeBruijnGraph, DbgNode, DbgEdge } from '../types/index.ts';

interface GraphCanvasProps {
  graph: DeBruijnGraph;
  activeEulerianEdgeId?: string;
  traversedEdgeIds?: Set<string>;
  highlightedNodeId?: string;
  onSelectNode?: (node: DbgNode | null) => void;
  layoutMode: 'force' | 'flow';
}

interface SimNode {
  id: string;
  sequence: string;
  inDegree: number;
  outDegree: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number | null;
  fy?: number | null;
  isStart?: boolean;
  isEnd?: boolean;
  isBranching?: boolean;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  graph,
  activeEulerianEdgeId,
  traversedEdgeIds,
  highlightedNodeId,
  onSelectNode,
  layoutMode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<DbgNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Update container size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({
          width: clientWidth || 900,
          height: clientHeight || 600,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Initialize node positions based on layout
  const [simNodes, setSimNodes] = useState<SimNode[]>([]);

  useEffect(() => {
    const { width, height } = dimensions;
    const nodeCount = graph.nodeList.length;
    if (nodeCount === 0) {
      setSimNodes([]);
      return;
    }

    const radius = Math.min(width, height) * 0.38;
    const centerX = width / 2;
    const centerY = height / 2;

    const initialNodes: SimNode[] = graph.nodeList.map((n, i) => {
      if (layoutMode === 'flow') {
        // Flow layout: left to right in sequence order
        const spacingX = Math.max(120, (width * 1.5) / Math.max(nodeCount, 1));
        const col = i;
        const rowOffset = (i % 3 - 1) * 70;
        return {
          id: n.id,
          sequence: n.sequence,
          inDegree: n.inDegree,
          outDegree: n.outDegree,
          x: 80 + col * 90,
          y: centerY + rowOffset,
          vx: 0,
          vy: 0,
          isStart: n.isStart,
          isEnd: n.isEnd,
          isBranching: n.isBranching,
        };
      } else {
        // Force layout initial circular distribution with jitter
        const angle = (i / nodeCount) * 2 * Math.PI;
        const dist = radius * (0.4 + 0.6 * Math.random());
        return {
          id: n.id,
          sequence: n.sequence,
          inDegree: n.inDegree,
          outDegree: n.outDegree,
          x: centerX + Math.cos(angle) * dist,
          y: centerY + Math.sin(angle) * dist,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          isStart: n.isStart,
          isEnd: n.isEnd,
          isBranching: n.isBranching,
        };
      }
    });

    setSimNodes(initialNodes);

    // Auto-fit initial view
    if (layoutMode === 'flow' && nodeCount > 5) {
      setTransform({ x: 40, y: 0, scale: Math.min(1, 800 / (nodeCount * 90 + 100)) });
    } else {
      setTransform({ x: 0, y: 0, scale: 1 });
    }
  }, [graph, dimensions, layoutMode]);

  // Force simulation tick loop (only in 'force' mode)
  useEffect(() => {
    if (layoutMode !== 'force' || simNodes.length === 0) return;

    let animId: number;
    let iteration = 0;
    const maxIterations = 200;

    const simulate = () => {
      if (iteration >= maxIterations && !draggedNodeId) return;
      iteration++;

      setSimNodes((prevNodes) => {
        const next = prevNodes.map((n) => ({ ...n }));
        const nodeMap = new Map(next.map((n) => [n.id, n]));
        const { width, height } = dimensions;
        const centerX = width / 2;
        const centerY = height / 2;

        const kRepulsion = 4500;
        const kSpring = 0.04;
        const optimalLength = 110;
        const damping = 0.85;

        // 1. Repulsion between all pairs of nodes
        for (let i = 0; i < next.length; i++) {
          for (let j = i + 1; j < next.length; j++) {
            const n1 = next[i];
            const n2 = next[j];
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const distSq = dx * dx + dy * dy + 1;
            const dist = Math.sqrt(distSq);

            if (dist < 400) {
              const force = kRepulsion / distSq;
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;

              if (n1.id !== draggedNodeId) {
                n1.vx -= fx;
                n1.vy -= fy;
              }
              if (n2.id !== draggedNodeId) {
                n2.vx += fx;
                n2.vy += fy;
              }
            }
          }
        }

        // 2. Spring attraction along edges
        graph.edges.forEach((edge) => {
          const src = nodeMap.get(edge.source);
          const tgt = nodeMap.get(edge.target);
          if (src && tgt) {
            const dx = tgt.x - src.x;
            const dy = tgt.y - src.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const displacement = dist - optimalLength;
            const force = displacement * kSpring;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (src.id !== draggedNodeId) {
              src.vx += fx;
              src.vy += fy;
            }
            if (tgt.id !== draggedNodeId) {
              tgt.vx -= fx;
              tgt.vy -= fy;
            }
          }
        });

        // 3. Weak centering gravity towards center
        next.forEach((n) => {
          if (n.id === draggedNodeId) return;
          const dx = centerX - n.x;
          const dy = centerY - n.y;
          n.vx += dx * 0.003;
          n.vy += dy * 0.003;

          n.vx *= damping;
          n.vy *= damping;
          n.x += n.vx;
          n.y += n.vy;
        });

        return next;
      });

      animId = requestAnimationFrame(simulate);
    };

    animId = requestAnimationFrame(simulate);
    return () => cancelAnimationFrame(animId);
  }, [layoutMode, dimensions, graph.edges, draggedNodeId]);

  // Lookup for fast rendering
  const nodePositionMap = useMemo(() => {
    const map = new Map<string, SimNode>();
    simNodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [simNodes]);

  // Zoom handlers
  const handleZoom = (factor: number) => {
    setTransform((prev) => ({
      ...prev,
      scale: Math.max(0.15, Math.min(3.5, prev.scale * factor)),
    }));
  };

  const handleResetView = () => {
    setTransform({ x: 0, y: 0, scale: 1 });
  };

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName !== 'svg') return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setTransform((prev) => ({
        ...prev,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      }));
    } else if (draggedNodeId) {
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      const mouseX = (e.clientX - containerRect.left - transform.x) / transform.scale;
      const mouseY = (e.clientY - containerRect.top - transform.y) / transform.scale;

      setSimNodes((prev) =>
        prev.map((n) => (n.id === draggedNodeId ? { ...n, x: mouseX, y: mouseY, vx: 0, vy: 0 } : n))
      );
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNodeId(null);
  };

  // Node Dragging Start
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDraggedNodeId(nodeId);
    const n = graph.nodes.get(nodeId);
    if (n && onSelectNode) onSelectNode(n);
  };

  // Filter highlights
  const cleanSearch = searchQuery.trim().toUpperCase();

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[580px] bg-[#121212] border border-[#1F6F50]/40 rounded-xl overflow-hidden select-none cursor-grab active:cursor-grabbing flex flex-col"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={(e) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.08 : 0.92;
        handleZoom(factor);
      }}
    >
      {/* Top HUD Ribbon */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Quick search & stats */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#F4EAD5]/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find (k-1)-mer..."
              className="pl-8 pr-3 py-1 text-xs bg-[#1B1B1B]/90 border border-[#1F6F50] rounded-lg text-[#F4EAD5] placeholder-[#F4EAD5]/40 focus:outline-none focus:border-[#FFB703] uppercase font-mono w-44 backdrop-blur shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 bg-[#1B1B1B]/90 border border-[#1F6F50]/60 px-3 py-1 rounded-lg text-xs font-mono backdrop-blur text-[#F4EAD5]/80">
            <span>Nodes: <strong className="text-[#FFB703]">{graph.nodeList.length}</strong></span>
            <span className="text-[#F4EAD5]/30">|</span>
            <span>Edges: <strong className="text-[#2E8B57]">{graph.edges.length}</strong></span>
            <span className="text-[#F4EAD5]/30">|</span>
            <span>k: <strong className="text-[#F4EAD5]">{graph.k}</strong></span>
          </div>
        </div>

        {/* Right: Zoom & Reset Controls */}
        <div className="flex items-center gap-1.5 bg-[#1B1B1B]/90 border border-[#1F6F50]/60 p-1 rounded-lg backdrop-blur pointer-events-auto shadow-sm">
          <button
            onClick={() => handleZoom(1.2)}
            className="p-1.5 rounded hover:bg-[#1F6F50]/40 text-[#F4EAD5] transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(0.8)}
            className="p-1.5 rounded hover:bg-[#1F6F50]/40 text-[#F4EAD5] transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="p-1.5 rounded hover:bg-[#1F6F50]/40 text-[#F4EAD5] transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono text-[#F4EAD5]/60 px-1.5 tabular-nums">
            {Math.round(transform.scale * 100)}%
          </span>
        </div>
      </div>

      {/* SVG Canvas Stage */}
      <svg className="w-full h-full">
        <defs>
          {/* Arrowhead markers */}
          <marker
            id="arrow-default"
            viewBox="0 0 10 10"
            refX="22"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#2E8B57" />
          </marker>

          <marker
            id="arrow-active"
            viewBox="0 0 10 10"
            refX="22"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#FFB703" />
          </marker>

          <marker
            id="arrow-traversed"
            viewBox="0 0 10 10"
            refX="22"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#FFB703" opacity="0.8" />
          </marker>
        </defs>

        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
          {/* 1. Edges Layer */}
          {graph.edges.map((edge) => {
            const src = nodePositionMap.get(edge.source);
            const tgt = nodePositionMap.get(edge.target);
            if (!src || !tgt) return null;

            const isActiveEulerian = activeEulerianEdgeId === edge.id;
            const isTraversed = traversedEdgeIds?.has(edge.id);
            const isSelfLoop = edge.source === edge.target;

            // Draw self-loop or standard directed arc
            if (isSelfLoop) {
              const r = 24;
              const loopPath = `M ${src.x} ${src.y - 12} C ${src.x - r} ${src.y - r * 2.2}, ${src.x + r} ${src.y - r * 2.2}, ${src.x + 8} ${src.y - 12}`;
              return (
                <path
                  key={edge.id}
                  d={loopPath}
                  fill="none"
                  stroke={isActiveEulerian ? '#FFB703' : isTraversed ? '#FFB703' : '#1F6F50'}
                  strokeWidth={isActiveEulerian ? 3 : 1.5}
                  strokeDasharray={isActiveEulerian ? '4 2' : undefined}
                  markerEnd={isActiveEulerian ? 'url(#arrow-active)' : 'url(#arrow-default)'}
                />
              );
            }

            // Normal directed line with slight curve to separate bidirectional edges
            const dx = tgt.x - src.x;
            const dy = tgt.y - src.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const normX = -dy / dist;
            const normY = dx / dist;
            const curveOffset = Math.min(25, dist * 0.12);

            const midX = (src.x + tgt.x) / 2 + normX * curveOffset;
            const midY = (src.y + tgt.y) / 2 + normY * curveOffset;

            const pathD = `M ${src.x} ${src.y} Q ${midX} ${midY} ${tgt.x} ${tgt.y}`;

            return (
              <g key={edge.id} className="transition-opacity duration-150">
                <path
                  d={pathD}
                  fill="none"
                  stroke={
                    isActiveEulerian
                      ? '#FFB703'
                      : isTraversed
                      ? '#FFB703'
                      : '#2E8B57'
                  }
                  strokeWidth={isActiveEulerian ? 3.5 : isTraversed ? 2 : 1.5}
                  strokeOpacity={isActiveEulerian ? 1 : isTraversed ? 0.85 : 0.6}
                  markerEnd={
                    isActiveEulerian
                      ? 'url(#arrow-active)'
                      : isTraversed
                      ? 'url(#arrow-traversed)'
                      : 'url(#arrow-default)'
                  }
                />

                {/* Edge Multiplicity / Kmer Label if scale is sufficient */}
                {transform.scale > 0.7 && (
                  <text
                    x={midX}
                    y={midY}
                    fill={isActiveEulerian ? '#FFB703' : '#F4EAD5'}
                    fontSize={transform.scale > 1.2 ? '9px' : '8px'}
                    fontFamily="JetBrains Mono"
                    textAnchor="middle"
                    className="select-none pointer-events-none font-semibold"
                    opacity={isActiveEulerian ? 1 : 0.8}
                  >
                    {transform.scale > 1.4 ? edge.kmer : edge.count > 1 ? `×${edge.count}` : ''}
                  </text>
                )}
              </g>
            );
          })}

          {/* 2. Nodes Layer */}
          {simNodes.map((node) => {
            const isHighlighted =
              highlightedNodeId === node.id ||
              (cleanSearch.length > 0 && node.sequence.includes(cleanSearch));
            const isHovered = hoveredNode?.id === node.id;
            const isStart = node.isStart;
            const isEnd = node.isEnd;
            const isBranching = node.isBranching;

            // Compute node badge width based on sequence length
            const textLen = node.sequence.length;
            const nodeWidth = Math.max(54, textLen * 9 + 18);
            const nodeHeight = 26;

            let fillColor = '#1F6F50';
            let strokeColor = '#2E8B57';
            let textColor = '#F4EAD5';

            if (isStart) {
              fillColor = '#1F6F50';
              strokeColor = '#FFB703';
            } else if (isEnd) {
              fillColor = '#1F6F50';
              strokeColor = '#2E8B57';
            }

            if (isHighlighted || isHovered) {
              strokeColor = '#FFB703';
            }

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                onMouseEnter={() => {
                  const dbgN = graph.nodes.get(node.id);
                  if (dbgN) setHoveredNode(dbgN);
                }}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer group"
              >
                {/* Node Box */}
                <rect
                  x={-nodeWidth / 2}
                  y={-nodeHeight / 2}
                  width={nodeWidth}
                  height={nodeHeight}
                  rx={6}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isHighlighted || isStart || isEnd ? 2.5 : 1.2}
                  className="transition-all duration-150 shadow-md"
                />

                {/* Status Dot / Flag */}
                {isStart && (
                  <circle
                    cx={-nodeWidth / 2 + 6}
                    cy={0}
                    r={3}
                    fill="#FFB703"
                  />
                )}
                {isEnd && (
                  <circle
                    cx={nodeWidth / 2 - 6}
                    cy={0}
                    r={3}
                    fill="#2E8B57"
                  />
                )}
                {isBranching && !isStart && !isEnd && (
                  <circle
                    cx={-nodeWidth / 2 + 5}
                    cy={0}
                    r={2.5}
                    fill="#FFB703"
                    opacity={0.8}
                  />
                )}

                {/* Node Sequence Text */}
                <text
                  textAnchor="middle"
                  dy="4"
                  fill={textColor}
                  fontSize="10px"
                  fontFamily="JetBrains Mono"
                  fontWeight="600"
                  className="select-none pointer-events-none"
                >
                  {node.sequence}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Floating Node Inspection HUD */}
      {hoveredNode && (
        <div className="absolute bottom-12 left-3 z-20 bg-[#1B1B1B]/95 border border-[#1F6F50] rounded-xl p-3 shadow-xl text-xs text-[#F4EAD5] max-w-xs backdrop-blur font-mono animate-in fade-in duration-100">
          <div className="flex items-center justify-between border-b border-[#1F6F50]/40 pb-1.5 mb-2">
            <span className="font-bold text-[#FFB703]">{hoveredNode.sequence}</span>
            <div className="flex items-center gap-1.5 text-[10px]">
              {hoveredNode.isStart && (
                <span className="text-[#FFB703] bg-[#FFB703]/20 px-1.5 py-0.5 rounded border border-[#FFB703]/40">
                  SOURCE (Start)
                </span>
              )}
              {hoveredNode.isEnd && (
                <span className="text-[#2E8B57] bg-[#2E8B57]/20 px-1.5 py-0.5 rounded border border-[#2E8B57]/40">
                  SINK (End)
                </span>
              )}
              {hoveredNode.isBranching && (
                <span className="text-[#FFB703] bg-[#1F6F50] px-1.5 py-0.5 rounded">
                  BRANCH
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center mb-2">
            <div className="p-1 rounded bg-[#121212] border border-[#1F6F50]/30">
              <span className="text-[10px] text-[#F4EAD5]/60 block">In-Degree</span>
              <span className="font-bold text-[#F4EAD5]">{hoveredNode.inDegree}</span>
            </div>
            <div className="p-1 rounded bg-[#121212] border border-[#1F6F50]/30">
              <span className="text-[10px] text-[#F4EAD5]/60 block">Out-Degree</span>
              <span className="font-bold text-[#F4EAD5]">{hoveredNode.outDegree}</span>
            </div>
            <div className="p-1 rounded bg-[#121212] border border-[#1F6F50]/30">
              <span className="text-[10px] text-[#F4EAD5]/60 block">Balance Δ</span>
              <span className="font-bold text-[#FFB703]">
                {hoveredNode.outDegree - hoveredNode.inDegree > 0 ? '+' : ''}
                {hoveredNode.outDegree - hoveredNode.inDegree}
              </span>
            </div>
          </div>
          <div className="text-[10px] text-[#F4EAD5]/60 truncate">
            Drag to pin node · Mouse wheel to zoom
          </div>
        </div>
      )}

      {/* Bottom Legend Ribbon */}
      <div className="px-4 py-2 bg-[#1B1B1B]/95 border-t border-[#1F6F50]/40 flex flex-wrap items-center justify-between text-xs text-[#F4EAD5]/70 gap-3">
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFB703]" />
            <span>Source (Start Node: d_out - d_in = 1)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2E8B57]" />
            <span>Sink (End Node: d_in - d_out = 1)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#1F6F50] border border-[#2E8B57]" />
            <span>Balanced Node (d_in = d_out)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-[#FFB703]" />
            <span>Eulerian Traversed Edge</span>
          </div>
        </div>

        <div className="text-[11px] text-[#F4EAD5]/50">
          Tip: Click & drag any node to explore tangled loops
        </div>
      </div>
    </div>
  );
};

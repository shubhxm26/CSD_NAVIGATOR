import React, { useState, useRef } from 'react';
import {
  CATEGORY_COLORS,
  MAP_DIMENSIONS,
  CENTRAL_EMPTY_SPACE,
  ROOMS_DATA,
  CORRIDOR_JUNCTIONS,
  MAP_LEGEND,
} from '../data/floorData';
import { ZoomIn, ZoomOut, RotateCcw, MapPin, Navigation, Eye, CheckCircle2 } from 'lucide-react';

export default function FloorMap({
  graph,
  startNode,
  endNode,
  currentConfirmedNode,
  calculatedPath = [],
  travelHistory = [],
  onSelectNode,
  edgeWeights = [],
  highlightedStepNode = null,
}) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showEdgeWeights, setShowEdgeWeights] = useState(true);
  const [showJunctionNodes, setShowJunctionNodes] = useState(false);
  const [hoveredNode, setHoveredNode] = useState(null);
  const svgRef = useRef(null);

  // Zoom / Pan handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.6));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('button')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Split path into:
  // 1. Travelled path (from original start up to current confirmed node)
  // 2. Remaining path (from current confirmed node to destination)
  const currentIdx = calculatedPath.indexOf(currentConfirmedNode || startNode);
  const travelledPathNodes = currentIdx > 0 ? calculatedPath.slice(0, currentIdx + 1) : [];
  const remainingPathNodes = currentIdx >= 0 ? calculatedPath.slice(currentIdx) : calculatedPath;

  // Build SVG Path string from node array
  const buildSvgPath = (nodes) => {
    if (!nodes || nodes.length < 2) return '';
    const points = nodes
      .map((id) => {
        const v = graph.getVertex(id);
        if (!v) return null;
        return `${v.x},${v.y}`;
      })
      .filter(Boolean);
    return points.length > 1 ? `M ${points.join(' L ')}` : '';
  };

  const travelledPathString = buildSvgPath(travelledPathNodes);
  const remainingPathString = buildSvgPath(remainingPathNodes);
  const fullPathString = buildSvgPath(calculatedPath);

  // Get vertex helper
  const getV = (id) => graph.getVertex(id);

  const startVertex = getV(startNode);
  const endVertex = getV(endNode);
  const currentVertex = getV(currentConfirmedNode || startNode);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0a0a0a] rounded-lg overflow-hidden border border-[#2a2a2a] select-none">
      {/* Top Map Action Bar — CAD toolbar style */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-[#111111] border border-[#2a2a2a] px-2.5 py-1.5 rounded text-xs">
        <span className="font-mono text-[10px] text-[#555555] uppercase tracking-widest pr-2 border-r border-[#2a2a2a] mr-1">
          <Navigation className="w-3 h-3 inline mr-1" />4th Floor
        </span>
        <button
          onClick={() => setShowEdgeWeights(!showEdgeWeights)}
          className={`font-mono text-[10px] px-2 py-1 rounded border transition-colors flex items-center gap-1 ${
            showEdgeWeights
              ? 'border-amber-500/40 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-[#555555] hover:text-[#f0f0f0] hover:border-[#2a2a2a]'
          }`}
          title="Toggle marked corridor distances"
        >
          <Eye className="w-3 h-3" /> Distances
        </button>
        <button
          onClick={() => setShowJunctionNodes(!showJunctionNodes)}
          className={`font-mono text-[10px] px-2 py-1 rounded border transition-colors ${
            showJunctionNodes
              ? 'border-amber-500/40 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-[#555555] hover:text-[#f0f0f0] hover:border-[#2a2a2a]'
          }`}
          title="Toggle corridor graph junctions"
        >
          Corridor Nodes
        </button>
      </div>

      {/* Floating Zoom & Pan Controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 bg-[#111111] border border-[#2a2a2a] p-1 rounded">
        <button
          onClick={handleZoomIn}
          className="p-1.5 text-[#555555] hover:text-[#f0f0f0] hover:bg-[#1c1c1c] rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-1.5 text-[#555555] hover:text-[#f0f0f0] hover:bg-[#1c1c1c] rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          className="p-1.5 text-[#555555] hover:text-[#f0f0f0] hover:bg-[#1c1c1c] rounded transition-colors"
          title="Reset Zoom and Pan"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main SVG Floor Plan Canvas */}
      <div
        className="w-full flex-1 overflow-hidden cursor-grab active:cursor-grabbing relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${MAP_DIMENSIONS.width} ${MAP_DIMENSIONS.height}`}
          className="w-full h-full transition-transform duration-75"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          <defs>
            {/* Arrow marker for shortest route direction */}
            <marker
              id="route-arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
            </marker>

            {/* Arrow marker for travelled route */}
            <marker
              id="travelled-arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
            </marker>

            {/* Pattern for Central Empty Space (Obstacle) */}
            <pattern
              id="stripe-pattern"
              width="20"
              height="20"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="20" stroke="#cbd5e1" strokeWidth="2" strokeOpacity="0.4" />
            </pattern>

            {/* Glow filters for active shortest path */}
            <filter id="glow-path" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#38bdf8" floodOpacity="0.8" />
            </filter>
            <filter id="glow-current" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#f59e0b" floodOpacity="0.9" />
            </filter>
          </defs>

          {/* Background Canvas Outline */}
          <rect
            x="20"
            y="20"
            width={MAP_DIMENSIONS.width - 40}
            height={MAP_DIMENSIONS.height - 40}
            rx="12"
            fill="#ffffff"
            stroke="#94a3b8"
            strokeWidth="3"
          />

          {/* Corridor Area Fill (outer minus central obstacle) */}
          <rect
            x="35"
            y="30"
            width={MAP_DIMENSIONS.width - 70}
            height={MAP_DIMENSIONS.height - 60}
            fill="#f8fafc"
          />

          {/* Central Empty Space (Not Walkable) */}
          <g id="central-empty-space">
            <rect
              x={CENTRAL_EMPTY_SPACE.x}
              y={CENTRAL_EMPTY_SPACE.y}
              width={CENTRAL_EMPTY_SPACE.width}
              height={CENTRAL_EMPTY_SPACE.height}
              fill="#f1f5f9"
              stroke="#64748b"
              strokeWidth="2.5"
              rx="4"
            />
            {/* Diagonal hazard stripes */}
            <rect
              x={CENTRAL_EMPTY_SPACE.x}
              y={CENTRAL_EMPTY_SPACE.y}
              width={CENTRAL_EMPTY_SPACE.width}
              height={CENTRAL_EMPTY_SPACE.height}
              fill="url(#stripe-pattern)"
              rx="4"
            />
            {/* Inner aesthetic boundary */}
            <rect
              x={CENTRAL_EMPTY_SPACE.x + 10}
              y={CENTRAL_EMPTY_SPACE.y + 10}
              width={CENTRAL_EMPTY_SPACE.width - 20}
              height={CENTRAL_EMPTY_SPACE.height - 20}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.2"
              strokeDasharray="4 3"
              rx="2"
            />
            {/* Labels matching reference image */}
            <text
              x={CENTRAL_EMPTY_SPACE.x + CENTRAL_EMPTY_SPACE.width / 2}
              y={CENTRAL_EMPTY_SPACE.y + CENTRAL_EMPTY_SPACE.height / 2 - 8}
              textAnchor="middle"
              className="fill-slate-700 font-bold"
              style={{ fontSize: '18px', letterSpacing: '0.5px' }}
            >
              {CENTRAL_EMPTY_SPACE.label}
            </text>
            <text
              x={CENTRAL_EMPTY_SPACE.x + CENTRAL_EMPTY_SPACE.width / 2}
              y={CENTRAL_EMPTY_SPACE.y + CENTRAL_EMPTY_SPACE.height / 2 + 18}
              textAnchor="middle"
              className="fill-rose-700 font-semibold"
              style={{ fontSize: '13px' }}
            >
              {CENTRAL_EMPTY_SPACE.sublabel}
            </text>
          </g>

          {/* Corridor Walking Guideline Network */}
          <g id="corridor-network" opacity="0.35">
            {/* Top Corridor Guideline */}
            <line x1="180" y1="158" x2="780" y2="158" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3" />
            {/* Right Corridor Guideline */}
            <line x1="780" y1="158" x2="780" y2="475" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3" />
            {/* Bottom Corridor Guideline */}
            <line x1="180" y1="475" x2="780" y2="475" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3" />
            {/* Left Corridor Guideline */}
            <line x1="180" y1="158" x2="180" y2="475" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3" />
          </g>

          {/* Render Rooms and Hallways */}
          <g id="rooms-group">
            {ROOMS_DATA.map((room) => {
              const colors = CATEGORY_COLORS[room.category] || CATEGORY_COLORS.Classroom;
              const isStart = startNode === room.id;
              const isEnd = endNode === room.id;
              const isCurrent = (currentConfirmedNode || startNode) === room.id;
              const isHovered = hoveredNode === room.id;
              const isInPath = calculatedPath.includes(room.id);

              return (
                <g
                  key={room.id}
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => onSelectNode(room.id)}
                  onMouseEnter={() => setHoveredNode(room.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Room Box */}
                  <rect
                    x={room.x}
                    y={room.y}
                    width={room.width}
                    height={room.height}
                    fill={colors.fill}
                    stroke={
                      isCurrent
                        ? '#f59e0b'
                        : isEnd
                        ? '#ef4444'
                        : isStart
                        ? '#10b981'
                        : isHovered
                        ? '#2563eb'
                        : colors.stroke
                    }
                    strokeWidth={isStart || isEnd || isCurrent || isHovered ? '3.5' : '2'}
                    rx="8"
                    className="transition-all"
                  />

                  {/* Room Doorway Cutout */}
                  <rect
                    x={room.door.x}
                    y={room.door.y}
                    width={room.door.width}
                    height={room.door.height}
                    fill="#475569"
                    stroke="#0f172a"
                    strokeWidth="1"
                    rx="1"
                  />

                  {/* Room Doorway connector line to corridor junction */}
                  {room.junctionId && (
                    <line
                      x1={room.door.x + room.door.width / 2}
                      y1={room.door.y + room.door.height / 2}
                      x2={getV(room.junctionId)?.x}
                      y2={getV(room.junctionId)?.y}
                      stroke="#94a3b8"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />
                  )}

                  {/* Room Label */}
                  <text
                    x={room.x + room.width / 2}
                    y={room.y + room.height / 2 + (room.id === 'bhise_cabin' ? -4 : 4)}
                    textAnchor="middle"
                    fill={colors.text}
                    className="font-bold select-none pointer-events-none"
                    style={{ fontSize: room.name.length > 14 ? '12px' : '14px' }}
                  >
                    {room.name}
                  </text>

                  {/* Special indicator for Bhise Mam's Cabin default start marker */}
                  {room.isDefaultStart && !startNode && (
                    <text
                      x={room.x + room.width / 2}
                      y={room.y + room.height / 2 + 15}
                      textAnchor="middle"
                      fill="#be185d"
                      className="font-medium text-[10px] select-none pointer-events-none"
                    >
                      (Starting Location)
                    </text>
                  )}

                  {/* Selection Badges */}
                  {isStart && (
                    <g transform={`translate(${room.x + 8}, ${room.y + 8})`}>
                      <circle cx="10" cy="10" r="10" fill="#10b981" />
                      <text x="10" y="14" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                        S
                      </text>
                    </g>
                  )}

                  {isEnd && (
                    <g transform={`translate(${room.x + room.width - 28}, ${room.y + 8})`}>
                      <circle cx="10" cy="10" r="10" fill="#ef4444" />
                      <text x="10" y="14" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                        D
                      </text>
                    </g>
                  )}

                  {isCurrent && (
                    <g transform={`translate(${room.x + room.width / 2 - 10}, ${room.y - 12})`}>
                      <rect x="0" y="0" width="20" height="20" rx="10" fill="#f59e0b" filter="url(#glow-current)" />
                      <circle cx="10" cy="10" r="4" fill="#ffffff" />
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* Render Marked Distance Arrows & Labels matching sketch */}
          {showEdgeWeights && (
            <g id="marked-distances" pointerEvents="none">
              {/* Top Side Distances */}
              {/* Washroom to Lab 3: 0.5 m */}
              <g transform="translate(180, 80)">
                <line x1="-3" y1="0" x2="35" y2="0" stroke="#334155" strokeWidth="1.5" />
                <polygon points="-3,-3 -3,3 -8,0" fill="#334155" />
                <polygon points="35,-3 35,3 40,0" fill="#334155" />
                <rect x="2" y="-18" width="32" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                <text x="18" y="-7" textAnchor="middle" fill="#1e293b" fontSize="10" fontWeight="bold">
                  0.5 m
                </text>
              </g>

              {/* Lab 3 to Lab 4: 2 m */}
              <g transform="translate(365, 80)">
                <line x1="-3" y1="0" x2="43" y2="0" stroke="#334155" strokeWidth="1.5" />
                <polygon points="-3,-3 -3,3 -8,0" fill="#334155" />
                <polygon points="43,-3 43,3 48,0" fill="#334155" />
                <rect x="7" y="-18" width="28" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                <text x="21" y="-7" textAnchor="middle" fill="#1e293b" fontSize="10" fontWeight="bold">
                  2 m
                </text>
              </g>

              {/* Lab 4 to Bhise Mam's Cabin: 2 m */}
              <g transform="translate(565, 80)">
                <line x1="-3" y1="0" x2="38" y2="0" stroke="#334155" strokeWidth="1.5" />
                <polygon points="-3,-3 -3,3 -8,0" fill="#334155" />
                <polygon points="38,-3 38,3 43,0" fill="#334155" />
                <rect x="5" y="-18" width="28" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                <text x="19" y="-7" textAnchor="middle" fill="#1e293b" fontSize="10" fontWeight="bold">
                  2 m
                </text>
              </g>

              {/* Left Side Distances */}
              {/* Washroom to Lab 2: 0.5 m */}
              <g transform="translate(90, 125)">
                <line x1="0" y1="3" x2="0" y2="57" stroke="#334155" strokeWidth="1.5" />
                <polygon points="-3,3 3,3 0,-2" fill="#334155" />
                <polygon points="-3,57 3,57 0,62" fill="#334155" />
                <rect x="4" y="24" width="34" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                <text x="21" y="35" textAnchor="middle" fill="#1e293b" fontSize="10" fontWeight="bold">
                  0.5 m
                </text>
              </g>

              {/* Lab 2 to Lab 1: 2 m */}
              <g transform="translate(90, 295)">
                <line x1="0" y1="3" x2="0" y2="47" stroke="#334155" strokeWidth="1.5" />
                <polygon points="-3,3 3,3 0,-2" fill="#334155" />
                <polygon points="-3,47 3,47 0,52" fill="#334155" />
                <rect x="6" y="18" width="28" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                <text x="20" y="29" textAnchor="middle" fill="#1e293b" fontSize="10" fontWeight="bold">
                  2 m
                </text>
              </g>

              {/* Lab 1 to Passage: 2 m (provisional placeholder) */}
              <g transform="translate(90, 455)">
                <line x1="0" y1="3" x2="0" y2="47" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 2" />
                <polygon points="-3,3 3,3 0,-2" fill="#334155" />
                <polygon points="-3,47 3,47 0,52" fill="#334155" />
                <rect x="4" y="18" width="36" height="15" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
                <text x="22" y="29" textAnchor="middle" fill="#475569" fontSize="9" fontWeight="bold">
                  ~2 m *
                </text>
              </g>

              {/* Right Side Distances */}
              {/* Cabin to JVN 1: 2 m */}
              <g transform="translate(805, 125)">
                <line x1="0" y1="3" x2="0" y2="67" stroke="#334155" strokeWidth="1.5" />
                <polygon points="-3,3 3,3 0,-2" fill="#334155" />
                <polygon points="-3,67 3,67 0,72" fill="#334155" />
                <rect x="-34" y="28" width="28" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                <text x="-20" y="39" textAnchor="middle" fill="#1e293b" fontSize="10" fontWeight="bold">
                  2 m
                </text>
              </g>

              {/* JVN 1 to JVN 2: 2 m */}
              <g transform="translate(805, 270)">
                <line x1="0" y1="3" x2="0" y2="72" stroke="#334155" strokeWidth="1.5" />
                <polygon points="-3,3 3,3 0,-2" fill="#334155" />
                <polygon points="-3,72 3,72 0,77" fill="#334155" />
                <rect x="-34" y="30" width="28" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                <text x="-20" y="41" textAnchor="middle" fill="#1e293b" fontSize="10" fontWeight="bold">
                  2 m
                </text>
              </g>

              {/* JVN 2 to Lower Right Corner: 2 m */}
              <g transform="translate(805, 420)">
                <line x1="0" y1="3" x2="0" y2="52" stroke="#334155" strokeWidth="1.5" />
                <polygon points="-3,3 3,3 0,-2" fill="#334155" />
                <polygon points="-3,52 3,52 0,57" fill="#334155" />
                <rect x="-34" y="20" width="28" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                <text x="-20" y="31" textAnchor="middle" fill="#1e293b" fontSize="10" fontWeight="bold">
                  2 m
                </text>
              </g>

              {/* Bottom Side Distances */}
              {/* Passage to Class 1: 1 m */}
              <g transform="translate(180, 547)">
                <line x1="3" y1="0" x2="47" y2="0" stroke="#334155" strokeWidth="1.5" />
                <polygon points="3,-3 3,3 -2,0" fill="#334155" />
                <polygon points="47,-3 47,3 52,0" fill="#334155" />
                <rect x="11" y="-18" width="28" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                <text x="25" y="-7" textAnchor="middle" fill="#1e293b" fontSize="10" fontWeight="bold">
                  1 m
                </text>
              </g>

              {/* Class 1 to Class 2: 2 m */}
              <g transform="translate(385, 547)">
                <line x1="3" y1="0" x2="52" y2="0" stroke="#334155" strokeWidth="1.5" />
                <polygon points="3,-3 3,3 -2,0" fill="#334155" />
                <polygon points="52,-3 52,3 57,0" fill="#334155" />
                <rect x="15" y="-18" width="28" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                <text x="29" y="-7" textAnchor="middle" fill="#1e293b" fontSize="10" fontWeight="bold">
                  2 m
                </text>
              </g>

              {/* Class 2 to Lower Right Corner: 2 m */}
              <g transform="translate(595, 547)">
                <line x1="3" y1="0" x2="182" y2="0" stroke="#334155" strokeWidth="1.5" />
                <polygon points="3,-3 3,3 -2,0" fill="#334155" />
                <polygon points="182,-3 182,3 187,0" fill="#334155" />
                <rect x="80" y="-18" width="28" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                <text x="94" y="-7" textAnchor="middle" fill="#1e293b" fontSize="10" fontWeight="bold">
                  2 m
                </text>
              </g>
            </g>
          )}

          {/* Render Corridor Junction Nodes */}
          {showJunctionNodes && (
            <g id="junction-nodes">
              {CORRIDOR_JUNCTIONS.map((junc) => {
                const isHighlighted = highlightedStepNode === junc.id;
                const isInCalculated = calculatedPath.includes(junc.id);
                return (
                  <g
                    key={junc.id}
                    className="cursor-pointer"
                    onClick={() => onSelectNode(junc.id)}
                  >
                    <circle
                      cx={junc.x}
                      cy={junc.y}
                      r={isHighlighted ? '7' : isInCalculated ? '5' : '3.5'}
                      fill={
                        isHighlighted
                          ? '#f59e0b'
                          : isInCalculated
                          ? '#38bdf8'
                          : junc.isCorner
                          ? '#ec4899'
                          : '#64748b'
                      }
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <text
                      x={junc.x}
                      y={junc.y - 8}
                      textAnchor="middle"
                      fill="#475569"
                      fontSize="9"
                      className="font-medium pointer-events-none select-none"
                    >
                      {junc.name}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* ======================================================== */}
          {/* PATH RENDERING (Shortest Path, Travelled vs Remaining) */}
          {/* ======================================================== */}

          {/* 1. Base Shortest Path Glow and Line */}
          {fullPathString && (
            <g id="calculated-path-layer">
              {/* Outer Glow */}
              <path
                d={fullPathString}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="10"
                strokeOpacity="0.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow-path)"
              />

              {/* Travelled Route (already walked) - Muted Green dashed */}
              {travelledPathString && (
                <path
                  d={travelledPathString}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="5"
                  strokeDasharray="6 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Remaining Shortest Route - Glowing Sky Blue with animated pulse */}
              {remainingPathString && (
                <path
                  d={remainingPathString}
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  markerEnd="url(#route-arrow)"
                />
              )}

              {/* Intermediate Waypoint Dots */}
              {calculatedPath.map((nodeId, idx) => {
                const v = getV(nodeId);
                if (!v) return null;
                const isTravelled = travelledPathNodes.includes(nodeId);
                return (
                  <circle
                    key={`point-${nodeId}-${idx}`}
                    cx={v.x}
                    cy={v.y}
                    r={v.isRoom ? 5 : 4}
                    fill={isTravelled ? '#10b981' : '#0284c7'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                );
              })}
            </g>
          )}

          {/* ======================================================== */}
          {/* DYNAMIC MARKERS: START, DESTINATION, AND CURRENT USER */}
          {/* ======================================================== */}

          {/* 1. Start Marker */}
          {startVertex && (
            <g
              transform={`translate(${startVertex.x}, ${startVertex.y})`}
              className="pointer-events-none select-none"
            >
              <circle cx="0" cy="0" r="14" fill="#10b981" fillOpacity="0.3" />
              <circle cx="0" cy="0" r="9" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
              <text x="0" y="3.5" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                S
              </text>
            </g>
          )}

          {/* 2. Destination Marker */}
          {endVertex && (
            <g
              transform={`translate(${endVertex.x}, ${endVertex.y})`}
              className="pointer-events-none select-none"
            >
              <circle cx="0" cy="0" r="14" fill="#ef4444" fillOpacity="0.3" />
              <circle cx="0" cy="0" r="9" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
              <text x="0" y="3.5" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                D
              </text>
            </g>
          )}

          {/* 3. Current Confirmed Location Marker (Pulsing Amber Radar Ring) */}
          {currentVertex && calculatedPath.length > 0 && (
            <g
              transform={`translate(${currentVertex.x}, ${currentVertex.y})`}
              className="pointer-events-none select-none"
            >
              <circle cx="0" cy="0" r="18" fill="#f59e0b" fillOpacity="0.35">
                <animate attributeName="r" values="12;22;12" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0.1;0.7" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="0" cy="0" r="8" fill="#f59e0b" stroke="#ffffff" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="3" fill="#ffffff" />
            </g>
          )}

          {/* Compass Rose (Bottom Right corner matching reference image) */}
          <g transform={`translate(${MAP_DIMENSIONS.width - 95}, ${MAP_DIMENSIONS.height - 95})`}>
            {/* Compass arms */}
            <line x1="0" y1="-28" x2="0" y2="28" stroke="#475569" strokeWidth="1.5" />
            <line x1="-28" y1="0" x2="28" y2="0" stroke="#475569" strokeWidth="1.5" />
            {/* North pointer triangle */}
            <polygon points="0,-28 -5,-12 5,-12" fill="#ef4444" />
            {/* Labels */}
            <text x="0" y="-32" textAnchor="middle" fill="#ef4444" fontSize="12" fontWeight="bold">
              N
            </text>
            <text x="0" y="40" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="bold">
              S
            </text>
            <text x="36" y="3.5" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="bold">
              E
            </text>
            <text x="-36" y="3.5" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="bold">
              W
            </text>
          </g>
        </svg>
      </div>

      {/* Map Legend Bar at Bottom matching reference image */}
      <div className="bg-[#111111] border-t border-[#2a2a2a] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-[10px]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-[#333333] uppercase tracking-widest mr-1">Legend:</span>
          {MAP_LEGEND.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-sm border inline-block"
                style={{ backgroundColor: item.color, borderColor: item.border }}
              />
              <span className="font-mono text-[#555555]">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="font-mono text-[10px] text-[#333333]">
          * Distances from sketch. Central space is obstacle.
        </div>
      </div>
    </div>
  );
}

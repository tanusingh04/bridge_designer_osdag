import React from "react";

interface DrawingProps {
  carriagewayWidth?: number;
  girderSpacing?: number;
  numGirders?: number;
  overhang?: number;
  span?: number;
  skew?: number;
  footpath?: string;
}

export function BridgeCrossSectionSVG({
  carriagewayWidth = 12,
  girderSpacing = 3,
  numGirders = 4,
  overhang = 1.5,
  footpath = "Both",
}: DrawingProps) {
  // SVG viewBox
  const width = 800;
  const height = 300;
  
  // Base constants
  const deckY = 100;
  const deckHeight = 35;
  const footpathWidth = 80;
  const footpathHeight = 25;
  const startX = 50;
  const endX = 750;
  const totalWidth = endX - startX;

  // Footpath logic visibility
  const hasLeftFootpath = footpath === "Both" || footpath === "Single-sided";
  const hasRightFootpath = footpath === "Both";
  
  // The "Carriageway" starts after the left footpath area
  const carriagewayStartX = startX + (hasLeftFootpath ? footpathWidth : 0);
  const carriagewayEndX = endX - (hasRightFootpath ? footpathWidth : 0);
  const actualCarriagewayWidth = carriagewayEndX - carriagewayStartX;

  // Girder positions horizontally
  // We place the first and last girder relative to the actual deck edges (including overhangs)
  // To keep it simple and clear, we'll center them in the available width
  const firstGirderX = carriagewayStartX + (actualCarriagewayWidth * 0.1);
  const lastGirderX = carriagewayEndX - (actualCarriagewayWidth * 0.1);
  const girderRange = lastGirderX - firstGirderX;
  const spacingPx = numGirders > 1 ? girderRange / (numGirders - 1) : 0;
  
  const girders = Array.from({ length: numGirders }).map((_, i) => firstGirderX + i * spacingPx);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[350px] font-sans" style={{ minHeight: "250px" }}>
      <defs>
        <marker id="arrow-left-green" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto">
          <path d="M6,0 L0,3 L6,6 Z" fill="#16a34a" />
        </marker>
        <marker id="arrow-right-green" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#16a34a" />
        </marker>
      </defs>

      {/* Carriageway Dimension Line */}
      <line x1={carriagewayStartX} y1={50} x2={carriagewayEndX} y2={50} stroke="#16a34a" strokeWidth="1.5" markerStart="url(#arrow-left-green)" markerEnd="url(#arrow-right-green)" />
      <text x={(carriagewayStartX + carriagewayEndX) / 2} y={40} textAnchor="middle" className="text-xs font-bold fill-primary">Carriageway: {carriagewayWidth.toFixed(2)}m</text>

      {/* Labels for Footpaths */}
      {hasLeftFootpath && <text x={startX + footpathWidth / 2} y={65} textAnchor="middle" className="text-[10px] italic fill-slate-500">Footpath</text>}
      {hasRightFootpath && <text x={endX - footpathWidth / 2} y={65} textAnchor="middle" className="text-[10px] italic fill-slate-500">Footpath</text>}

      {/* Deck Substructure (Concrete) */}
      <rect x={startX} y={deckY} width={totalWidth} height={deckHeight} fill="#f1f5f9" stroke="#1e293b" strokeWidth="2" className="dark:fill-slate-800 dark:stroke-slate-300" />
      
      {/* Footpath Concrete Rects */}
      {hasLeftFootpath && <rect x={startX} y={deckY - footpathHeight} width={footpathWidth} height={footpathHeight} fill="#ffffff" stroke="#1e293b" strokeWidth="2" className="dark:fill-slate-900 dark:stroke-slate-300" />}
      {hasRightFootpath && <rect x={endX - footpathWidth} y={deckY - footpathHeight} width={footpathWidth} height={footpathHeight} fill="#ffffff" stroke="#1e293b" strokeWidth="2" className="dark:fill-slate-900 dark:stroke-slate-300" />}

      {/* Steel Girders & Bracing */}
      {girders.map((x, i) => (
        <g key={`girder-${i}`}>
          {/* I-Beam Web */}
          <rect x={x - 4} y={deckY + deckHeight} width={8} height={60} fill="#475569" className="dark:fill-slate-400" />
          {/* Flanges */}
          <rect x={x - 15} y={deckY + deckHeight} width={30} height={4} fill="#1e293b" className="dark:fill-slate-200" />
          <rect x={x - 15} y={deckY + deckHeight + 56} width={30} height={4} fill="#1e293b" className="dark:fill-slate-200" />
          
          {/* Cross Bracing */}
          {i < girders.length - 1 && (
            <>
              <line x1={x + 10} y1={deckY + deckHeight + 10} x2={girders[i + 1] - 10} y2={deckY + deckHeight + 50} stroke="#94a3b8" strokeWidth="1.5" className="dark:stroke-slate-500" />
              <line x1={x + 10} y1={deckY + deckHeight + 50} x2={girders[i + 1] - 10} y2={deckY + deckHeight + 10} stroke="#94a3b8" strokeWidth="1.5" className="dark:stroke-slate-500" />
            </>
          )}
        </g>
      ))}

      {/* Bottom Labels (Engineering style) */}
      <text x={width / 2} y={height - 20} textAnchor="middle" className="text-[10px] font-mono fill-slate-500 uppercase tracking-widest">
        {numGirders} Girders @ {girderSpacing?.toFixed(2)}m C/C
      </text>
    </svg>
  );
}

export function BridgePlanViewSVG({
  span = 30,
  skew = 0,
}: DrawingProps) {
  const width = 800;
  const height = 300;
  
  // A slightly slanted rectangle based on skew if required
  const skewRad = (skew * Math.PI) / 180;
  const skewOffset = Math.tan(skewRad) * 90; // offset based on half height (90px)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[350px] font-sans" style={{ minHeight: "250px" }}>
      <defs>
        <marker id="arrow-left-dark" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto">
          <path d="M6,0 L0,3 L6,6 Z" fill="#1e293b" />
        </marker>
        <marker id="arrow-right-dark" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#1e293b" />
        </marker>
      </defs>

      {/* Centerline CL */}
      <line x1={50} y1={height / 2} x2={width - 50} y2={height / 2} stroke="#94a3b8" strokeWidth="1" strokeDasharray="12 4 2 4" />
      <text x={width - 35} y={height / 2 + 4} className="text-[10px] font-mono fill-slate-500">CL</text>

      {/* Plan Rectangle with Skew */}
      <polygon 
        points={`
          ${200 + skewOffset},60 
          ${600 + skewOffset},60 
          ${600 - skewOffset},240 
          ${200 - skewOffset},240
        `} 
        fill="none" 
        stroke="#1e293b" 
        strokeWidth="3" 
        className="dark:stroke-slate-300 dark:fill-slate-900/40"
      />
      
      {/* Abutment lines (thick green) */}
      <line x1={200 + skewOffset} y1={60} x2={200 - skewOffset} y2={240} stroke="#16a34a" strokeWidth="8" />
      <line x1={600 + skewOffset} y1={60} x2={600 - skewOffset} y2={240} stroke="#16a34a" strokeWidth="8" />

      {/* Dimension - Span */}
      <line x1={200} y1={270} x2={600} y2={270} stroke="#1e293b" strokeWidth="1" markerStart="url(#arrow-left-dark)" markerEnd="url(#arrow-right-dark)" className="dark:stroke-slate-300" />
      <text x={400} y={285} textAnchor="middle" className="text-xs font-semibold fill-slate-800 dark:fill-slate-300">Total Span Length: {span.toFixed(2)}m</text>

      {/* Skew Tag */}
      {skew !== 0 && (
        <>
          <path d={`M 200,60 L 200,10 A 190,190 0 0 1 ${200 + skewOffset},10`} fill="none" stroke="#64748b" strokeWidth="1" />
          <text x={180} y={50} textAnchor="end" className="text-[10px] font-bold fill-primary">SKEW: {skew}°</text>
        </>
      )}

    </svg>
  );
}

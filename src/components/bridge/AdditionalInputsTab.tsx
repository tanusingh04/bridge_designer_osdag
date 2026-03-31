import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Loader2, AlertCircle, Save } from "lucide-react";
import { GeometryParams } from "./AdditionalGeometryModal";

interface Props {
  carriagewayWidth: number;
  geoParams: GeometryParams | null;
  setGeoParams: (params: GeometryParams | null) => void;
}

const API_CALCULATE = import.meta.env.VITE_API_CALCULATE || "http://localhost:8000/api/calculate/";

export default function AdditionalInputsTab({ carriagewayWidth, geoParams, setGeoParams }: Props) {
  const overallWidth = carriagewayWidth + 5;
  
  const [localSpacing, setLocalSpacing] = useState(geoParams?.girderSpacing ?? 3.0);
  const [localNum, setLocalNum] = useState(geoParams?.numGirders ?? 4);
  const [localOverhang, setLocalOverhang] = useState(geoParams?.deckOverhang ?? 1.5);
  
  const [isCalculating, setIsCalculating] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  // Sync with global geoParams if they change externally
  useEffect(() => {
    if (geoParams && !isDirty) {
      setLocalSpacing(geoParams.girderSpacing);
      setLocalNum(geoParams.numGirders);
      setLocalOverhang(geoParams.deckOverhang);
    }
  }, [geoParams, isDirty]);

  const recalculate = useCallback(
    async (
      spacing: number,
      girders: number,
      overhang: number,
      changedField: "spacing" | "num_girders" | "overhang"
    ) => {
      setIsCalculating(true);
      setIsDirty(true);
      try {
        const res = await fetch(API_CALCULATE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            carriageway_width: carriagewayWidth,
            girder_spacing: spacing,
            num_girders: girders,
            deck_overhang: overhang,
            changed_field: changedField,
          }),
        });
        const data = await res.json();
        
        // Update local state with API response
        setLocalSpacing(data.girder_spacing);
        setLocalNum(data.num_girders);
        setLocalOverhang(data.deck_overhang);
        setErrors(data.errors ?? []);
        
        // If valid, auto-sync to global state for drawing reactivity
        if (!data.errors || data.errors.length === 0) {
          setGeoParams({
            girderSpacing: data.girder_spacing,
            numGirders: data.num_girders,
            deckOverhang: data.deck_overhang,
          });
          setIsDirty(false);
        }
      } catch (err) {
        console.error("Geometry calculation error:", err);
        setErrors(["Could not connect to backend for validation."]);
      } finally {
        setIsCalculating(false);
      }
    },
    [carriagewayWidth, setGeoParams]
  );

  const handleSpacingChange = (val: number) => {
    setLocalSpacing(val);
    recalculate(val, localNum, localOverhang, "spacing");
  };

  const handleNumChange = (val: number) => {
    setLocalNum(val);
    recalculate(localSpacing, val, localOverhang, "num_girders");
  };

  const handleOverhangChange = (val: number) => {
    setLocalOverhang(val);
    recalculate(localSpacing, localNum, val, "overhang");
  };

  return (
    <div className="space-y-6">
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" /> Expert Geometry Settings
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The Overall Bridge Width is currently <span className="font-bold text-foreground">{overallWidth.toFixed(2)}m</span>.
          Expert parameters are mutually constrained by the formula: 
          <span className="block mt-1 font-mono text-primary bg-primary/10 p-1 rounded inline-block">
            (Overall Width − Overhang) / Spacing = No. of Girders
          </span>
        </p>
      </div>

      <div className="grid gap-6">
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Girder Spacing (m)</Label>
          <Input 
            type="number" 
            step="0.1" 
            className="h-11 text-lg" 
            value={localSpacing || ""} 
            onChange={e => handleSpacingChange(+e.target.value)}
            disabled={isCalculating}
          />
          <p className="text-[10px] text-muted-foreground italic">Distance between centerlines of individual girders.</p>
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Number of Girders</Label>
          <Input 
            type="number" 
            className="h-11 text-lg" 
            value={localNum || ""} 
            onChange={e => handleNumChange(+e.target.value)}
            disabled={isCalculating}
          />
          <p className="text-[10px] text-muted-foreground italic">Total count of main structural supports.</p>
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Deck Overhang Width (m)</Label>
          <Input 
            type="number" 
            step="0.1" 
            className="h-11 text-lg" 
            value={localOverhang || ""} 
            onChange={e => handleOverhangChange(+e.target.value)}
            disabled={isCalculating}
          />
          <p className="text-[10px] text-muted-foreground italic">Distance from the outer girder to the deck edge.</p>
        </div>
      </div>

      {isCalculating && (
        <div className="flex items-center gap-2 text-xs text-primary animate-pulse font-medium">
          <Loader2 className="h-3 w-3 animate-spin" /> Performing Engineering Recalculation...
        </div>
      )}

      {errors.length > 0 && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md space-y-1">
          {errors.map((err, i) => (
            <p key={i} className="text-xs text-destructive flex items-start gap-2 italic">
              <span>⚠</span> {err}
            </p>
          ))}
        </div>
      )}

      <div className="pt-4 border-t border-border flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-widest">
        <span>Status: {isCalculating ? "Calculating" : errors.length > 0 ? "Invalid" : "Synced"}</span>
        <span className="flex items-center gap-1">
          <Save className="h-3 w-3" /> Auto-Saving enabled
        </span>
      </div>
    </div>
  );
}

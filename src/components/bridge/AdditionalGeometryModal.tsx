import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export interface GeometryParams {
  girderSpacing: number;
  numGirders: number;
  deckOverhang: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (params: GeometryParams) => void;
  carriagewayWidth: number;
  initial?: GeometryParams | null;
}

const API_CALCULATE = import.meta.env.VITE_API_CALCULATE || "http://localhost:8000/api/calculate/";

export default function AdditionalGeometryModal({ open, onClose, onSave, carriagewayWidth, initial }: Props) {
  const overallWidth = carriagewayWidth + 5;

  const [girderSpacing, setGirderSpacing] = useState(initial?.girderSpacing ?? 3.0);
  const [numGirders, setNumGirders] = useState(initial?.numGirders ?? 4);
  const [deckOverhang, setDeckOverhang] = useState(initial?.deckOverhang ?? 1.5);
  const [errors, setErrors] = useState<string[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setGirderSpacing(initial?.girderSpacing ?? 3.0);
    setNumGirders(initial?.numGirders ?? 4);
    setDeckOverhang(initial?.deckOverhang ?? 1.5);
    setErrors([]);
  }, [open, initial]);

  /**
   * Calls the Django backend to recalculate geometry.
   * The backend handles the formula: (Overall Width - Overhang) / Spacing = No. of Girders
   * based on which field was changed.
   */
  const recalculate = useCallback(
    async (
      spacing: number,
      girders: number,
      overhang: number,
      changedField: "spacing" | "num_girders" | "overhang"
    ) => {
      setIsCalculating(true);
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
        setGirderSpacing(data.girder_spacing);
        setNumGirders(data.num_girders);
        setDeckOverhang(data.deck_overhang);
        setErrors(data.errors ?? []);
      } catch (err) {
        console.error("Geometry calculation error:", err);
        setErrors(["Could not connect to backend. Please ensure the server is running."]);
      } finally {
        setIsCalculating(false);
      }
    },
    [carriagewayWidth]
  );

  const handleSpacingChange = (val: number) => {
    setGirderSpacing(val);
    recalculate(val, numGirders, deckOverhang, "spacing");
  };

  const handleNumGirdersChange = (val: number) => {
    setNumGirders(val);
    recalculate(girderSpacing, val, deckOverhang, "num_girders");
  };

  const handleOverhangChange = (val: number) => {
    setDeckOverhang(val);
    recalculate(girderSpacing, numGirders, val, "overhang");
  };

  const handleSave = () => {
    if (errors.length === 0) {
      onSave({ girderSpacing, numGirders, deckOverhang });
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Additional Geometry</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Overall Bridge Width:{" "}
          <span className="font-mono font-medium text-foreground">{overallWidth.toFixed(1)} m</span>
          <span className="ml-2 text-xs text-muted-foreground">(Carriageway + 5 m)</span>
        </p>
        <p className="text-xs text-muted-foreground italic">
          Constraint: (Overall Width − Overhang) / Spacing = No. of Girders
        </p>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 items-center gap-3">
            <Label>Girder Spacing (m)</Label>
            <Input
              type="number"
              step="0.1"
              value={girderSpacing || ""}
              disabled={isCalculating}
              onChange={e => handleSpacingChange(+e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 items-center gap-3">
            <Label>Number of Girders</Label>
            <Input
              type="number"
              step="1"
              value={numGirders || ""}
              disabled={isCalculating}
              onChange={e => handleNumGirdersChange(+e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 items-center gap-3">
            <Label>Deck Overhang Width (m)</Label>
            <Input
              type="number"
              step="0.1"
              value={deckOverhang || ""}
              disabled={isCalculating}
              onChange={e => handleOverhangChange(+e.target.value)}
            />
          </div>
        </div>
        {isCalculating && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Recalculating via backend…
          </div>
        )}
        {errors.length > 0 && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive space-y-1">
            {errors.map((e, i) => <p key={i}>⚠ {e}</p>)}
          </div>
        )}
        <DialogFooter>
          <Button {...({variant: "outline"} as ButtonProps)} onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={errors.length > 0 || isCalculating}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

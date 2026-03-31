import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface CustomLoadingParams {
  windSpeed: number;
  seismicZone: string;
  seismicFactor: number;
  maxTemp: number;
  minTemp: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (params: CustomLoadingParams) => void;
  initial?: CustomLoadingParams | null;
}

const ZONES = ["II", "III", "IV", "V"];
const ZONE_FACTORS: Record<string, number> = { II: 0.10, III: 0.16, IV: 0.24, V: 0.36 };

export default function CustomLoadingModal({ open, onClose, onSave, initial }: Props) {
  const [windSpeed, setWindSpeed] = useState(initial?.windSpeed ?? 0);
  const [seismicZone, setSeismicZone] = useState(initial?.seismicZone ?? "II");
  const [maxTemp, setMaxTemp] = useState(initial?.maxTemp ?? 0);
  const [minTemp, setMinTemp] = useState(initial?.minTemp ?? 0);

  const handleSave = () => {
    onSave({ windSpeed, seismicZone, seismicFactor: ZONE_FACTORS[seismicZone], maxTemp, minTemp });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Custom Loading Parameters</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 items-center gap-3">
            <Label>Wind Speed (m/s)</Label>
            <Input type="number" value={windSpeed || ""} onChange={e => setWindSpeed(+e.target.value)} />
          </div>
          <div className="grid grid-cols-2 items-center gap-3">
            <Label>Seismic Zone</Label>
            <Select value={seismicZone} onValueChange={setSeismicZone}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ZONES.map(z => <SelectItem key={z} value={z}>Zone {z}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 items-center gap-3">
            <Label>Seismic Factor (Z)</Label>
            <Input value={ZONE_FACTORS[seismicZone]} readOnly className="bg-muted" />
          </div>
          <div className="grid grid-cols-2 items-center gap-3">
            <Label>Max Temperature (°C)</Label>
            <Input type="number" value={maxTemp || ""} onChange={e => setMaxTemp(+e.target.value)} />
          </div>
          <div className="grid grid-cols-2 items-center gap-3">
            <Label>Min Temperature (°C)</Label>
            <Input type="number" value={minTemp || ""} onChange={e => setMinTemp(+e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Parameters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

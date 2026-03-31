import React, { useState, useEffect, useCallback } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { STEEL_GRADES, CONCRETE_GRADES } from "@/data/locationData";
import CustomLoadingModal, { CustomLoadingParams } from "./CustomLoadingModal";
import AdditionalGeometryModal, { GeometryParams } from "./AdditionalGeometryModal";
import { AlertTriangle, CheckCircle, Loader2, RefreshCw } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api/locations";

interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

interface Props {
  span: number | "";
  setSpan: (v: number | "") => void;
  carriagewayWidth: number | "";
  setCarriagewayWidth: (v: number | "") => void;
  footpath: string;
  setFootpath: (v: string) => void;
  skewAngle: number | "";
  setSkewAngle: (v: number | "") => void;
  geoParams: GeometryParams | null;
  setGeoParams: (v: GeometryParams | null) => void;
  disabled?: boolean;
}

export default function BasicInputsTab({
  span, setSpan,
  carriagewayWidth, setCarriagewayWidth,
  footpath, setFootpath,
  skewAngle, setSkewAngle,
  geoParams, setGeoParams,
  disabled = false
}: Props) {
  // Local state for dropdowns & non-lifted values
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedZone, setSelectedZone] = useState("Zone II");
  const [girderSteel, setGirderSteel] = useState("E250 (Fe410W)");
  const [bracingSteel, setBracingSteel] = useState("E250 (Fe410W)");
  const [deckConcrete, setDeckConcrete] = useState("M30");

  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customParams, setCustomParams] = useState<CustomLoadingParams | null>(null);
  
  // Modals
  const [geoModalOpen, setGeoModalOpen] = useState(false);
  
  // Nexus Toggles
  const [enterLocationName, setEnterLocationName] = useState(true);
  const [tabulateCustomLoading, setTabulateCustomLoading] = useState(false);

  // Backend validation state
  const [validation, setValidation] = useState<ValidationResult>({ valid: true, errors: {}, warnings: {} });
  const [isValidating, setIsValidating] = useState(false);

  // Fetch locations on mount
  useEffect(() => {
    fetch(API_BASE)
      .then(res => res.json())
      .then(data => {
        setLocations(data.locations || []);
        if (data.locations?.length > 0) setSelectedLocation(data.locations[0]);
      })
      .catch(err => console.error("Could not fetch locations:", err));
  }, []);

  const validate = useCallback(async () => {
    if (span === "" || carriagewayWidth === "") return;
    setIsValidating(true);
    try {
      const res = await fetch(`${API_BASE}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ span, carriagewayWidth, skewAngle: skewAngle || 0 }),
      });
      const data = await res.json();
      setValidation(data);
    } catch (err) {
      console.error("Validation error:", err);
    } finally {
      setIsValidating(false);
    }
  }, [span, carriagewayWidth, skewAngle]);

  useEffect(() => {
    const timer = setTimeout(validate, 500);
    return () => clearTimeout(timer);
  }, [validate]);

  const cwError = validation.errors.carriageway_width;
  const spanError = validation.errors.span;

  return (
    <div className="space-y-6 pb-20">
      
      {/* 1. TYPE OF STRUCTURE */}
      <Section title="Type of Structure">
        <div className="space-y-2">
          <Select defaultValue="Highway">
            <SelectTrigger className="h-10 border-input bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Highway">Highway</SelectItem>
              <SelectItem value="Railway">Railway</SelectItem>
              <SelectItem value="Pedestrian">Pedestrian</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Section>

      {/* 2. PROJECT LOCATION */}
      <Section title="Project Location">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="location-name" 
                checked={enterLocationName} 
                onCheckedChange={(v) => setEnterLocationName(!!v)}
                className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 border-orange-500/50"
              />
              <Label htmlFor="location-name" className="text-sm font-medium text-slate-700">Enter Location Name</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="custom-loading" 
                checked={tabulateCustomLoading} 
                onCheckedChange={(v) => setTabulateCustomLoading(!!v)}
                className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 border-green-600/50"
              />
              <Label htmlFor="custom-loading" className="text-sm font-medium text-slate-700">Tabulate Custom Loading Parameters</Label>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <Label className="text-xs mb-1 block text-muted-foreground uppercase font-semibold">State</Label>
              <Select defaultValue="Select State">
                <SelectTrigger className="h-10 bg-white"><SelectValue placeholder="Select State" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                  <SelectItem value="Karnataka">Karnataka</SelectItem>
                  <SelectItem value="Delhi">Delhi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block text-muted-foreground uppercase font-semibold">District</Label>
              <Select defaultValue="Select District">
                <SelectTrigger className="h-10 bg-white"><SelectValue placeholder="Select District" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mumbai">Mumbai</SelectItem>
                  <SelectItem value="Bangalore">Bangalore</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Section>

      {/* 3. GEOMETRIC DETAILS */}
      <Section title="Geometric Details">
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-transparent">
            <Label className="text-sm font-semibold text-slate-800">Geometric Details</Label>
            <Button 
              {...({variant: "default"} as ButtonProps)} 
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-9 px-4 rounded shadow-sm border-none"
              onClick={() => setGeoModalOpen(true)}
            >
              Modify Additional Geometry
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <FieldWithError label="Span (m)" error={spanError} warning={validation.warnings.span}>
              <Input 
                type="text" 
                placeholder="20-45"
                className="h-10 bg-white" 
                value={span} 
                onChange={e => setSpan(e.target.value ? +e.target.value : "")} 
                disabled={disabled}
              />
            </FieldWithError>

            <FieldWithError label="Carriageway Width (m)" error={cwError} warning={validation.warnings.carriageway_width}>
              <Input 
                type="number" 
                className="h-10 bg-white font-mono" 
                value={carriagewayWidth} 
                onChange={e => setCarriagewayWidth(e.target.value ? +e.target.value : "")} 
                disabled={disabled}
              />
            </FieldWithError>

            <div className="space-y-1">
              <Label className="text-xs mb-1 block text-muted-foreground uppercase font-semibold">Footpath</Label>
              <Select value={footpath} onValueChange={setFootpath} disabled={disabled}>
                <SelectTrigger className="h-10 bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">None</SelectItem>
                  <SelectItem value="Single-sided">Single-sided</SelectItem>
                  <SelectItem value="Both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs mb-1 block text-muted-foreground uppercase font-semibold">Skew Angle (degrees)</Label>
              <div className="flex items-center gap-2">
                <Input 
                  type="text" 
                  placeholder="-15 to +15"
                  className="h-10 bg-white font-mono" 
                  value={skewAngle} 
                  onChange={e => setSkewAngle(e.target.value ? +e.target.value : "")} 
                  disabled={disabled}
                />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* 4. MATERIAL INPUTS */}
      <Section title="Material Specifications">
        <div className="grid grid-cols-3 gap-3 pt-1">
          <div>
            <Label className="text-xs mb-1 block text-muted-foreground font-semibold">Girder Steel</Label>
            <Select value={girderSteel} onValueChange={setGirderSteel}>
              <SelectTrigger className="h-9 bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>{STEEL_GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1 block text-muted-foreground font-semibold">Bracing Steel</Label>
            <Select value={bracingSteel} onValueChange={setBracingSteel}>
              <SelectTrigger className="h-9 bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>{STEEL_GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1 block text-muted-foreground font-semibold">Deck Concrete</Label>
            <Select value={deckConcrete} onValueChange={setDeckConcrete}>
              <SelectTrigger className="h-9 bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>{CONCRETE_GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </Section>

      {/* MODALS */}
      <CustomLoadingModal open={customModalOpen} onClose={() => setCustomModalOpen(false)} onSave={setCustomParams} initial={customParams} />
      <AdditionalGeometryModal
        open={geoModalOpen}
        onClose={() => setGeoModalOpen(false)}
        onSave={setGeoParams}
        carriagewayWidth={carriagewayWidth as number}
        initial={geoParams}
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/30 overflow-hidden shadow-sm">
      <div className="bg-green-700 text-white font-bold text-sm px-4 py-2 border-b border-green-800">
        {title}
      </div>
      <div className="p-4 space-y-4">
        {children}
      </div>
    </div>
  );
}

function FieldWithError({ label, error, warning, children }: { label: string; error: string | null; warning?: string | null; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs uppercase text-muted-foreground font-bold tracking-tight">{label}</Label>
      {children}
      {error && <p className="text-[11px] text-destructive flex items-center gap-1 font-semibold px-1 italic"><span>⚠</span> {error}</p>}
      {warning && <p className="text-[11px] text-orange-500 flex items-center gap-1 font-medium px-1 italic"><span>ℹ</span> {warning}</p>}
    </div>
  );
}

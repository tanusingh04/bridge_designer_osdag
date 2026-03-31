import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BasicInputsTab from "@/components/bridge/BasicInputsTab";
import AdditionalInputsTab from "@/components/bridge/AdditionalInputsTab";
import SettingsSheet from "@/components/SettingsSheet";
import { BridgeCrossSectionSVG, BridgePlanViewSVG } from "@/components/bridge/BridgeDrawings";
import { useTheme } from "@/components/ThemeProvider";
import { Moon, Sun, RotateCcw, Download, Image as ImageIcon, FileText } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef, useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { GeometryParams } from "@/components/bridge/AdditionalGeometryModal";

export default function Index() {
  const { setTheme, resolvedTheme } = useTheme();
  const exportRef = useRef<HTMLDivElement>(null);

  // Lifted Engineering State
  const [span, setSpan] = useState<number | "">(30);
  const [carriagewayWidth, setCarriagewayWidth] = useState<number | "">(12);
  const [footpath, setFootpath] = useState("Both");
  const [skewAngle, setSkewAngle] = useState<number | "">(0);
  const [geoParams, setGeoParams] = useState<GeometryParams | null>({
    numGirders: 4,
    girderSpacing: 3.0,
    deckOverhang: 1.5,
  });

  const handleExport = async (type: "png" | "pdf") => {
    if (!exportRef.current) return;
    try {
      const canvas = await html2canvas(exportRef.current, { scale: 2, backgroundColor: resolvedTheme === "dark" ? "#09090b" : "#ffffff" });
      if (type === "png") {
        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = "bridge-design.png";
        a.click();
      } else {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? "landscape" : "portrait",
          unit: "px",
          format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
        pdf.save("bridge-design.pdf");
      }
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <img 
            src="/osdag_logo_icon_1774960737396.png" 
            alt="Osdag Logo" 
            className="w-10 h-10 rounded-md object-cover shadow-sm bg-white p-1"
          />
          <h1 className="text-xl font-bold tracking-tight text-white">structura</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button {...({variant: "ghost", size: "icon"} as ButtonProps)} className="text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
            {resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <div className="text-primary-foreground/80 hover:text-primary-foreground transition-colors cursor-pointer">
            <SettingsSheet />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Form */}
        <div className="w-1/2 min-w-[500px] border-r border-border overflow-y-auto p-4 bg-muted/20">
          <Tabs defaultValue="basic" className="w-full">
            <div className="flex items-center gap-1 mb-4 border-b border-border pb-2">
              <TabsList className="bg-slate-100 p-1 h-9 rounded-md gap-1">
                <TabsTrigger 
                  value="basic" 
                  className="rounded-md data-[state=active]:bg-green-700 data-[state=active]:text-white data-[state=active]:shadow-sm px-4 py-1.5 transition-all text-xs font-semibold"
                >
                  Basic Inputs
                </TabsTrigger>
                <TabsTrigger 
                  value="additional" 
                  className="rounded-md data-[state=active]:bg-green-700 data-[state=active]:text-white data-[state=active]:shadow-sm px-4 py-1.5 transition-all text-xs font-semibold text-slate-500"
                >
                  Additional Inputs
                </TabsTrigger>
              </TabsList>
              <div className="ml-auto">
                <Button {...({variant: "ghost", size: "icon"} as ButtonProps)} className="h-8 w-8 text-slate-400 hover:text-green-700">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <TabsContent value="basic">
              <BasicInputsTab 
                span={span} setSpan={setSpan}
                carriagewayWidth={carriagewayWidth} setCarriagewayWidth={setCarriagewayWidth}
                footpath={footpath} setFootpath={setFootpath}
                skewAngle={skewAngle} setSkewAngle={setSkewAngle}
                geoParams={geoParams} setGeoParams={setGeoParams}
              />
            </TabsContent>
            <TabsContent value="additional">
              <div className="p-1">
                <AdditionalInputsTab 
                  carriagewayWidth={Number(carriagewayWidth) || 0}
                  geoParams={geoParams}
                  setGeoParams={setGeoParams}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel - Reference Image & Stats */}
        <div className="w-1/2 flex flex-col bg-muted/30 p-4 overflow-y-auto">
          <Tabs defaultValue="cross-section" className="w-full h-full flex flex-col">
            <div className="flex justify-end mb-4">
              <TabsList className="bg-card border border-border">
                <TabsTrigger value="cross-section" className="data-[state=active]:text-foreground">Cross Section</TabsTrigger>
                <TabsTrigger value="plan-view" className="data-[state=active]:text-foreground">Plan View</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 bg-card rounded-md border border-border flex flex-col overflow-hidden">
              <div className="bg-primary text-primary-foreground px-4 py-3 flex justify-between items-center text-sm font-semibold">
                <span>Bridge Cross Section (For Nomenclature Only)</span>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button {...({variant: "ghost", size: "sm"} as ButtonProps)} className="h-8 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground font-normal">
                      <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleExport("png")} className="cursor-pointer">
                      <ImageIcon className="mr-2 h-4 w-4" /> Export as Image (PNG)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("pdf")} className="cursor-pointer">
                      <FileText className="mr-2 h-4 w-4" /> Export as Document (PDF)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

              </div>
              <div ref={exportRef} className="flex-1 flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-950/20">
                <TabsContent value="cross-section" className="w-full flex flex-col items-center mt-0">
                  <BridgeCrossSectionSVG 
                    carriagewayWidth={Number(carriagewayWidth) || 0}
                    girderSpacing={geoParams?.girderSpacing}
                    numGirders={geoParams?.numGirders}
                    overhang={geoParams?.deckOverhang}
                  />
                  <div className="mt-8 text-center space-y-2">
                    <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
                      {geoParams?.numGirders} STEEL GIRDERS @ {geoParams?.girderSpacing.toFixed(2)}M C/C
                    </p>
                    <h3 className="font-bold text-foreground">COMPOSITE BRIDGE CROSS-SECTION</h3>
                    <p className="text-sm font-medium text-primary">
                      Total Deck Width: {((Number(carriagewayWidth) || 0) + (geoParams?.deckOverhang || 0) * 2).toFixed(2)}m
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="plan-view" className="w-full flex flex-col items-center mt-0">
                  <BridgePlanViewSVG 
                    span={Number(span) || 0}
                    skew={Number(skewAngle) || 0}
                  />
                </TabsContent>
              </div>
              
              {/* Summary Stats Grid */}
              <div className="grid grid-cols-4 divide-x divide-border bg-muted/40 border-t border-border mt-auto">
                <div className="p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-xs text-muted-foreground font-medium mb-1">Clear Width</span>
                  <span className="text-lg font-bold text-primary">{Number(carriagewayWidth).toFixed(2)}m</span>
                </div>
                <div className="p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-xs text-muted-foreground font-medium mb-1">Girders</span>
                  <span className="text-lg font-bold text-primary">{geoParams?.numGirders} Nos.</span>
                </div>
                <div className="p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-xs text-muted-foreground font-medium mb-1">Girder Spacing</span>
                  <span className="text-lg font-bold text-primary">{geoParams?.girderSpacing.toFixed(2)}m</span>
                </div>
                <div className="p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-xs text-muted-foreground font-medium mb-1">Span</span>
                  <span className="text-lg font-bold text-primary">{Number(span).toFixed(2)}m</span>
                </div>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

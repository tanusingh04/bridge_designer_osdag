import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Settings, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useState } from "react";
import { toast } from "sonner";

export default function SettingsSheet() {
  const { theme, setTheme } = useTheme();
  const [units, setUnits] = useState(() => localStorage.getItem("gd-units") || "metric");
  const [autoSave, setAutoSave] = useState(() => localStorage.getItem("gd-autosave") !== "false");
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem("gd-contrast") === "true");
  const [language, setLanguage] = useState("english");

  const handleUnitsChange = (val: string) => {
    setUnits(val);
    localStorage.setItem("gd-units", val);
  };

  const handleThemeChange = (val: "light" | "dark") => {
    setTheme(val);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button {...({variant: "ghost", size: "icon"} as ButtonProps)} className="text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          
          {/* Language */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="border-primary text-foreground focus:ring-primary">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Theme */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Theme</Label>
            <div className="flex p-1 bg-muted rounded-md border border-border">
              <button
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-sm transition-colors ${theme === "light" ? "bg-primary text-primary-foreground shadow-sm" : "hover:text-foreground text-muted-foreground"}`}
                onClick={() => handleThemeChange("light")}
              >
                <Sun className="h-4 w-4" /> Light
              </button>
              <button
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-sm transition-colors ${theme === "dark" ? "bg-primary text-primary-foreground shadow-sm" : "hover:text-foreground text-muted-foreground"}`}
                onClick={() => handleThemeChange("dark")}
              >
                <Moon className="h-4 w-4" /> Dark
              </button>
            </div>
          </div>

          {/* Settings Toggles List */}
          <div className="space-y-5 pt-2">
            
            {/* unitsDisplay */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">unitsDisplay</Label>
                <p className="text-[11px] text-muted-foreground">unitsDesc</p>
              </div>
              <div className="flex cursor-pointer text-xs font-medium rounded-md overflow-hidden bg-muted border border-border">
                <div 
                  className={`px-3 py-1.5 transition-colors ${units === "metric" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                  onClick={() => handleUnitsChange("metric")}
                >
                  Metric (m)
                </div>
                <div 
                  className={`px-3 py-1.5 transition-colors ${units === "imperial" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                  onClick={() => handleUnitsChange("imperial")}
                >
                  Imperial (ft)
                </div>
              </div>
            </div>

            {/* autoSave */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">autoSave</Label>
                <p className="text-[11px] text-muted-foreground">autoSaveDesc</p>
              </div>
              <Switch checked={autoSave} onCheckedChange={setAutoSave} className="data-[state=checked]:bg-primary" />
            </div>

            {/* highContrast */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">highContrast</Label>
                <p className="text-[11px] text-muted-foreground">accessibilityMode</p>
              </div>
              <Switch checked={highContrast} onCheckedChange={setHighContrast} className="data-[state=checked]:bg-primary" />
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

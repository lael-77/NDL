import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ScoreSliderProps {
  label: string;
  weight: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
  min?: number;
  step?: number;
  disabled?: boolean;
  autoScore?: number;
  description?: string;
}

export const ScoreSlider = ({
  label,
  weight,
  value,
  onChange,
  max = 10,
  min = 0,
  step = 0.5,
  disabled = false,
  autoScore,
  description,
}: ScoreSliderProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-[#1A1A1A]">
            {label} ({weight})
          </Label>
          {description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-[#4A4A4A] cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {autoScore !== undefined && (
            <span className="text-xs text-[#4A4A4A] ml-2">
              Auto: {Math.round(autoScore / 10)}/10
            </span>
          )}
        </div>
        <span className="text-sm font-semibold text-[#0077CC]">{value}/10</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(vals) => onChange(vals[0])}
        max={max}
        min={min}
        step={step}
        disabled={disabled}
        className="w-full"
      />
    </div>
  );
};


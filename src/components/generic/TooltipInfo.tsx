// components/ui/TooltipInfo.tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { tooltipConfig, type TooltipKey } from "@/config/tooltipsConfig";

interface TooltipInfoProps {
  item: TooltipKey;
  side?: "top" | "right" | "bottom" | "left";
}

export function TooltipInfo({ item, side = "right" }: TooltipInfoProps) {
  const data = tooltipConfig[item];

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ---------- MOBILE = POPOVER ----------
  if (isMobile) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="
              p-1 rounded-lg transition-all duration-300
              text-slate-300 hover:text-indigo-400
              bg-slate-800/40 hover:bg-slate-700
              border border-slate-700/40 hover:border-indigo-500/40
              shadow-md hover:shadow-indigo-500/20
            "
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="
            max-w-xs p-4 rounded-xl
            bg-slate-800/90 border border-slate-700 
            text-slate-200 shadow-2xl backdrop-blur-md
            space-y-2
          "
        >
          <h4 className="font-semibold text-white text-sm">{data.title}</h4>
          <p className="text-slate-300 text-xs leading-relaxed">{data.description}</p>
        </PopoverContent>
      </Popover>
    );
  }

  // ---------- DESKTOP = TOOLTIP ----------
  return (
    <TooltipProvider>
      <Tooltip delayDuration={150}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="
              p-1 rounded-lg transition-all duration-300
              text-slate-300 hover:text-indigo-400
              bg-slate-800/40 hover:bg-slate-700
              border border-slate-700/40 hover:border-indigo-500/40
              shadow-md hover:shadow-indigo-500/20
            "
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </TooltipTrigger>

        <TooltipContent
          side={side}
          className="
            max-w-xs p-4 rounded-xl
            bg-slate-800/90 border border-slate-700 
            text-slate-200 shadow-2xl backdrop-blur-md
            space-y-2
          "
        >
          <h4 className="font-semibold text-white text-sm">{data.title}</h4>
          <p className="text-slate-300 text-xs leading-relaxed">{data.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

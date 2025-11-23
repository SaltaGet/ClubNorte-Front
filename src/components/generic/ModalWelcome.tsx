// src/components/ModalWelcome.tsx

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { tooltipConfig } from "@/config/tooltipsConfig";

export default function ModalWelcome() {
  const info = tooltipConfig.appGeneral;

  return (
    <Dialog>
      {/* TRIGGER DESTACADO */}
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="
            rounded-full p-3
            bg-indigo-600/20 
            hover:bg-indigo-600/40 
            border border-indigo-500/40 
            hover:border-indigo-400 
            shadow-md hover:shadow-indigo-500/20
            transition-all
          "
        >
          <BookOpen className="w-6 h-6 md:w-7 md:h-7 text-indigo-300" />
        </Button>
      </DialogTrigger>

      {/* MODAL AMPLIO Y PROFESIONAL */}
      <DialogContent
        className="
          max-w-4xl 
          bg-slate-950/95 
          border border-indigo-500/40 
          shadow-2xl 
          text-slate-200
        "
      >
        <DialogHeader>
          <DialogTitle className="text-2xl md:text-3xl font-bold text-white">
            {info.title}
          </DialogTitle>
        </DialogHeader>

        {/* CONTENIDO SCROLLEABLE */}
        <div
          className="
            mt-4 h-[70vh] 
            overflow-y-auto 
            pr-3
            whitespace-pre-line 
            leading-relaxed 
            text-slate-300
            text-sm md:text-base
            scrollbar-thin scrollbar-thumb-indigo-600/40 scrollbar-track-transparent
          "
        >
          {info.description}
        </div>
      </DialogContent>
    </Dialog>
  );
}

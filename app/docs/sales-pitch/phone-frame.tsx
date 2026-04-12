import type { ReactNode } from "react";

export function PhoneFrame({ children, caption }: { children: ReactNode; caption?: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-[280px] rounded-[32px] border-[6px] border-[#1a1118] bg-[#faf7f2] overflow-hidden shadow-2xl relative">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#1a1118] rounded-b-xl z-10" />
        {/* Screen */}
        <div className="pt-6 pb-4 min-h-[500px] text-[10px] leading-tight">
          {children}
        </div>
        {/* Home indicator */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-20 h-1 bg-[#1a1118]/30 rounded-full" />
      </div>
      {caption && <p className="text-sm text-[#675d66] mt-3 text-center">{caption}</p>}
    </div>
  );
}

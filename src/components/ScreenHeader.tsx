import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface ScreenHeaderProps {
  onBack?: () => void;
  title: string;
  rightAction?: React.ReactNode;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  onBack, title, rightAction,
}) => {
  return (
    <div 
      className="sticky top-0 z-30 bg-[#0a0a08] py-3 mb-3 -mx-4 px-4 border-b border-white/[0.04] flex items-center justify-between sticky-header-ios"
      style={{ top: 'var(--sat, env(safe-area-inset-top))' }}
    >
      {onBack ? (
        <button
          onClick={onBack}
          className="w-10 h-10 -ml-1.5 rounded-full flex items-center justify-center text-[#f0eeeb]/40 hover:text-white hover:bg-white/5 active:scale-90 transition-all duration-500"
          style={{ transitionTimingFunction: 'var(--ease-spring)' }}
        >
          <ChevronLeft className="w-6 h-6 stroke-[2]" />
        </button>
      ) : <span className="w-10" />}

      <div className="text-center">
        <h2 className="text-base font-black text-[#f0eeeb]/80 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          {title}
        </h2>
      </div>

      {rightAction || <span className="w-10" />}
    </div>
  );
};

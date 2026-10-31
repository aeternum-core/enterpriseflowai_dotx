import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { formatIndia12HourTime, formatIndiaDate } from '../../utils/timeUtils';

export const LiveIndiaClock: React.FC<{ className?: string; compact?: boolean }> = ({
  className = '',
  compact = false
}) => {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = formatIndia12HourTime(now, true);
  const dateStr = formatIndiaDate(now);

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-medium border border-slate-200 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <Clock className="w-3.5 h-3.5 text-slate-500" />
        <span>{timeStr}</span>
        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1 py-0.2 rounded">IST</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-100 border border-slate-200/90 text-xs shadow-2xs transition select-none ${className}`}>
      <div className="flex items-center gap-1.5 text-slate-500">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live System Time (India IST)" />
        <Clock className="w-3.5 h-3.5 text-blue-600" />
      </div>
      <div className="flex flex-col text-left leading-tight">
        <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800 text-[11px]">
          <span>{timeStr}</span>
          <span className="text-[9px] font-extrabold uppercase px-1 py-0.2 rounded bg-blue-100 text-blue-700 tracking-tight">
            IST
          </span>
        </div>
        <div className="text-[10px] text-slate-400 font-medium">
          {dateStr} &bull; UTC+5:30
        </div>
      </div>
    </div>
  );
};


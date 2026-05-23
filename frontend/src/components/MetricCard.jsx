import React from 'react';

export default function MetricCard({ 
  title, 
  value, 
  subtext, 
  icon: Icon, 
  trend
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 flex flex-col justify-between gap-2 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
            {title}
          </span>
          <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-0.5">
            {value}
          </h3>
        </div>
        <div className="p-1.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg text-zinc-500 dark:text-zinc-400">
          <Icon size={15} />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {trend && (
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
            trend.isPositive ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' : 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10'
          }`}>
            {trend.value}
          </span>
        )}
        <span className="text-[10px] text-zinc-500 font-medium">
          {subtext}
        </span>
      </div>
    </div>
  );
}

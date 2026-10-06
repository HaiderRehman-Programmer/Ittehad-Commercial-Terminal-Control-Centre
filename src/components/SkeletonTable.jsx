import React from 'react';

const SkeletonTable = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="w-full bg-slate-900/5 rounded-2xl border border-slate-200 overflow-hidden animate-entrant">
      {/* Header Skeleton */}
      <div className="w-full h-14 bg-slate-900 border-b border-slate-800 flex items-center px-8 gap-6 relative overflow-hidden">
        <div className="shimmer-hc-layer opacity-40" />
        {Array(columns).fill(0).map((_, i) => (
          <div key={`header-${i}`} className="flex-1 h-2 bg-slate-800 rounded-full opacity-50" />
        ))}
      </div>
      
      {/* Body Rows Skeleton */}
      <div className="flex flex-col p-2 gap-2 bg-slate-50/50">
        {Array(rows).fill(0).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="w-full h-16 bg-white border border-slate-100 rounded-xl flex items-center px-6 gap-6 shadow-sm relative overflow-hidden group">
             {Array(columns).fill(0).map((_, colIndex) => (
               <div key={`cell-${rowIndex}-${colIndex}`} className="flex-1 relative">
                 <div 
                   className="skeleton-container h-3 w-4/5" 
                   style={{ 
                     width: `${Math.floor(Math.random() * (90 - 40 + 1) + 40)}%`,
                     opacity: 0.15 + (colIndex * 0.05)
                   }}
                 >
                   <div className="shimmer-hc-layer" />
                 </div>
               </div>
             ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonTable;

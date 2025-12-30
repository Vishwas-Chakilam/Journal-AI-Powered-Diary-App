
import React, { useMemo } from 'react';
import { JournalEntry } from '../types';

interface HeatmapProps {
  entries: JournalEntry[];
}

const Heatmap: React.FC<HeatmapProps> = ({ entries }) => {
  const data = useMemo(() => {
    const today = new Date();
    const endDate = today;
    
    // Calculate start date (52 weeks ago, aligned to Sunday)
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 364); // Approx 1 year
    while (startDate.getDay() !== 0) {
      startDate.setDate(startDate.getDate() - 1);
    }

    // Generate count map
    const counts: Record<string, number> = {};
    entries.forEach(e => {
      const key = new Date(e.date).toISOString().split('T')[0];
      counts[key] = (counts[key] || 0) + 1;
    });

    // Generate array of days
    const days = [];
    let current = new Date(startDate);
    while (current <= endDate) {
      const key = current.toISOString().split('T')[0];
      days.push({
        date: new Date(current),
        count: counts[key] || 0
      });
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [entries]);

  const getColor = (count: number) => {
    if (count === 0) return 'bg-stone-800/50';
    if (count === 1) return 'bg-amber-900/60';
    if (count === 2) return 'bg-amber-700/80';
    return 'bg-amber-500';
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto pb-2 scrollbar-hide">
        <div className="grid grid-rows-7 grid-flow-col gap-1 w-max">
          {data.map((day, i) => (
            <div
              key={i}
              title={`${day.date.toDateString()}: ${day.count} memories`}
              className={`w-3 h-3 rounded-[2px] transition-all duration-300 ${getColor(day.count)} hover:ring-1 hover:ring-white/50 hover:scale-125`}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-stone-500 mt-2 font-bold uppercase tracking-wider">
        <span>1 Year Ago</span>
        <div className="flex gap-2 items-center">
            <span>Less</span>
            <div className="flex gap-0.5">
                <div className="w-2 h-2 rounded-[1px] bg-stone-800/50"></div>
                <div className="w-2 h-2 rounded-[1px] bg-amber-900/60"></div>
                <div className="w-2 h-2 rounded-[1px] bg-amber-700/80"></div>
                <div className="w-2 h-2 rounded-[1px] bg-amber-500"></div>
            </div>
            <span>More</span>
        </div>
        <span>Today</span>
      </div>
    </div>
  );
};

export default Heatmap;


import React from 'react';
import { JournalEntry } from '../types';
import { Icons } from '../constants';

interface EntryCardProps {
  entry: JournalEntry;
  onClick: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

export const EntryCard: React.FC<EntryCardProps> = ({ entry, onClick, onDelete, onToggleFavorite }) => {
  const dateObj = new Date(entry.date);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString('default', { month: 'short' });
  const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div 
      onClick={onClick}
      className="group bg-stone-900 rounded-2xl p-5 mb-4 shadow-sm border border-stone-800 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all duration-300 relative overflow-hidden"
    >
      <div className="flex items-start gap-4">
        {/* Date Box */}
        <div className="flex flex-col items-center justify-center min-w-[3.5rem] h-[3.5rem] bg-stone-800 rounded-xl border border-stone-700">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">{month}</span>
          <span className="text-xl font-serif font-bold text-stone-200">{day}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold font-serif text-stone-100 truncate pr-2">
              {entry.title}
            </h3>
            <span className="text-xl">{entry.mood}</span>
          </div>
          
          <p className="text-stone-400 text-sm line-clamp-2 leading-relaxed mb-3">
            {entry.content}
          </p>

          {entry.aiSummary && (
             <div className="mb-3 px-3 py-2 bg-indigo-900/20 border border-indigo-500/10 rounded-lg">
                <p className="text-xs text-indigo-300 italic">✨ "{entry.aiSummary}"</p>
             </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {entry.location && (
                <span className="text-xs text-stone-500 flex items-center gap-1 max-w-[100px] truncate">
                  <div className="scale-75"><Icons.MapPin /></div>
                  {entry.location}
                </span>
              )}
              {entry.images && entry.images.length > 0 && (
                <span className="text-xs bg-stone-800 text-stone-500 px-2 py-1 rounded-md flex items-center gap-1">
                  <Icons.Camera /> {entry.images.length}
                </span>
              )}
              <span className="text-xs text-stone-500 font-medium pl-1">{time}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite();
                }}
                className={`p-2 rounded-full transition-colors ${entry.isFavorite ? 'text-amber-400' : 'text-stone-600 hover:text-amber-400'}`}
              >
                <Icons.Star filled={entry.isFavorite} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-2 text-stone-600 hover:text-red-500 hover:bg-red-900/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
              >
                <Icons.Trash />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

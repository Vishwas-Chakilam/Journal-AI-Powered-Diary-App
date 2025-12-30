
import React from 'react';
import { Icons } from '../constants';
import { JournalEntry } from '../types';

interface JournalViewerProps {
  entry: JournalEntry;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

const JournalViewer: React.FC<JournalViewerProps> = ({ entry, onClose, onEdit, onDelete, onToggleFavorite }) => {
  const dateObj = new Date(entry.date);
  
  return (
    <div className="fixed inset-0 z-40 bg-stone-950 flex flex-col animate-in slide-in-from-bottom-5 duration-300">
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between bg-stone-900/80 backdrop-blur-md border-b border-stone-800 z-10">
        <button 
          onClick={onClose} 
          className="p-2 -ml-2 text-stone-400 hover:text-white transition-colors flex items-center gap-1"
        >
          <Icons.ChevronLeft />
          <span className="font-medium">Back</span>
        </button>
        
        <div className="flex items-center gap-3">
           <button 
            onClick={onToggleFavorite}
            className={`p-2 rounded-full hover:bg-stone-800 transition-all ${entry.isFavorite ? 'text-amber-400' : 'text-stone-400'}`}
            title="Toggle Favorite"
           >
             <Icons.Star filled={entry.isFavorite} />
           </button>
           
           <button 
            onClick={onDelete}
            className="p-2 rounded-full text-stone-400 hover:text-red-500 hover:bg-red-900/10 transition-colors"
            title="Delete Entry"
           >
             <Icons.Trash />
           </button>

           <button 
            onClick={onEdit}
            className="flex items-center gap-2 bg-stone-100 text-stone-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-stone-900/10 active:scale-95 transition-all ml-2"
           >
            <Icons.Edit />
            <span>Edit</span>
          </button>
        </div>
      </header>

      {/* Content Scroll Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-10 pb-24">
          
          {/* Meta Header */}
          <div className="flex flex-col gap-4 mb-8 text-center">
            <div className="text-stone-500 text-xs font-bold uppercase tracking-[0.2em]">
              {dateObj.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-100 leading-tight">
              {entry.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-stone-400 text-sm mt-2">
               <span className="text-2xl" title="Mood">{entry.mood}</span>
               {entry.location && (
                 <span className="flex items-center gap-1 border-l border-stone-800 pl-4">
                   <Icons.MapPin /> {entry.location}
                 </span>
               )}
               <span className="border-l border-stone-800 pl-4">
                 {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </span>
            </div>
          </div>

          {/* AI Summary Block */}
          {entry.aiSummary && (
            <div className="mb-10 p-6 bg-gradient-to-r from-indigo-900/20 to-stone-900 rounded-2xl border border-indigo-500/10 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5 text-indigo-400 text-6xl"><Icons.MagicWand /></div>
               <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 block flex items-center gap-2">
                 <Icons.MagicWand /> AI Summary
               </span>
               <p className="text-indigo-200 italic font-serif text-lg leading-relaxed">
                 "{entry.aiSummary}"
               </p>
            </div>
          )}

          {/* Images */}
          {entry.images && entry.images.length > 0 && (
            <div className={`grid gap-4 mb-10 ${entry.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {entry.images.map((img, idx) => (
                <img 
                  key={idx} 
                  src={img} 
                  alt={`Memory attachment ${idx + 1}`} 
                  className="w-full h-auto rounded-xl border border-stone-800 shadow-lg object-cover max-h-[500px]" 
                />
              ))}
            </div>
          )}

          {/* Main Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            <p className="font-serif text-stone-300 text-xl leading-8 whitespace-pre-wrap">
              {entry.content}
            </p>
          </div>

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-stone-800">
              <div className="flex flex-wrap gap-2">
                {entry.tags.map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-stone-900 text-stone-400 border border-stone-800 rounded-lg text-xs font-bold uppercase tracking-wider">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JournalViewer;

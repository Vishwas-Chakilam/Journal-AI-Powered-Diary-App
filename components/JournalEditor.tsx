
import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../constants';
import { JournalEntry, Mood } from '../types';
import { enhanceText, summarizeEntry, generateTags } from '../services/geminiService';

interface JournalEditorProps {
  entry?: JournalEntry;
  onSave: (entry: JournalEntry) => void;
  onClose: () => void;
  isDark: boolean;
}

const JournalEditor: React.FC<JournalEditorProps> = ({ entry, onSave, onClose }) => {
  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || '');
  const [mood, setMood] = useState<Mood>(entry?.mood || Mood.NEUTRAL);
  const [tags, setTags] = useState<string[]>(entry?.tags || []);
  const [images, setImages] = useState<string[]>(entry?.images || []);
  const [location, setLocation] = useState(entry?.location || '');
  const [aiSummary, setAiSummary] = useState(entry?.aiSummary || '');
  
  const [newTag, setNewTag] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!title && !content) return;
    onSave({
      id: entry?.id || crypto.randomUUID(),
      title: title || 'Untitled Entry',
      content,
      date: entry?.date || new Date().toISOString(),
      mood,
      tags,
      images,
      location,
      aiSummary,
      isFavorite: entry?.isFavorite || false
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const applyAI = async (mode: 'grammar' | 'expand' | 'tone_positive') => {
    if (!content) return;
    setIsEnhancing(true);
    const result = await enhanceText(content, mode);
    setContent(result);
    setIsEnhancing(false);
  };

  const generateSummary = async () => {
    if (!content) return;
    setIsEnhancing(true);
    const result = await summarizeEntry(content);
    setAiSummary(result);
    setIsEnhancing(false);
  }

  const handleGenerateTags = async () => {
    if (!content && !title) return;
    setIsEnhancing(true);
    const result = await generateTags(`${title}\n${content}`);
    // Filter out tags already present
    setSuggestedTags(result.filter(t => !tags.includes(t)));
    setIsEnhancing(false);
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-stone-950 animate-in slide-in-from-bottom-10 duration-300">
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between bg-stone-900/80 backdrop-blur-md border-b border-stone-800 z-10">
        <button onClick={onClose} className="p-2 -ml-2 text-stone-500 hover:text-stone-200 transition-colors">
          <span className="sr-only">Back</span>
          <span className="text-lg font-medium text-stone-300">Cancel</span>
        </button>
        <div className="flex items-center space-x-2">
           <button 
             onClick={() => setShowMoodSelector(!showMoodSelector)}
             className="text-2xl hover:scale-110 transition-transform"
             title="Set Mood"
           >
             {mood}
           </button>
           <button 
            onClick={handleSave}
            className="bg-stone-100 text-stone-900 px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-stone-900/10 active:scale-95 transition-all"
           >
            Save
          </button>
        </div>
      </header>

      {/* Mood Selector Overlay */}
      {showMoodSelector && (
        <div className="absolute top-16 left-0 right-0 p-4 bg-stone-900/95 backdrop-blur shadow-xl z-20 border-b border-stone-800 flex justify-center gap-4 flex-wrap animate-in fade-in slide-in-from-top-2">
          {Object.values(Mood).map(m => (
            <button key={m} onClick={() => { setMood(m); setShowMoodSelector(false); }} className="text-3xl hover:scale-125 transition-transform p-2">
              {m}
            </button>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8 max-w-3xl mx-auto w-full">
        <div className="mb-6 flex items-center gap-2">
          <div className="text-stone-500"><Icons.MapPin /></div>
          <input 
            type="text" 
            placeholder="Add Location..."
            className="bg-transparent border-none outline-none text-stone-400 placeholder-stone-600 focus:ring-0 text-sm w-full"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <input
          type="text"
          placeholder="Title your memory..."
          className="w-full text-3xl md:text-4xl font-serif font-bold bg-transparent border-none outline-none focus:ring-0 placeholder-stone-700 text-stone-100 mb-6"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        
        {/* Images Grid */}
        {images.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-4 mb-4 scrollbar-hide">
            {images.map((img, idx) => (
              <div key={idx} className="relative flex-shrink-0 group">
                <img src={img} alt="Attachment" className="h-40 w-auto rounded-xl object-cover shadow-sm border border-stone-800" />
                <button 
                  onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                  className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Icons.X />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* AI Summary Section */}
        {aiSummary && (
           <div className="mb-6 p-4 bg-indigo-900/20 border border-indigo-500/10 rounded-xl relative group">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1 block">AI Summary</span>
              <p className="text-indigo-200 italic font-serif">{aiSummary}</p>
              <button onClick={() => setAiSummary('')} className="absolute top-2 right-2 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"><Icons.X /></button>
           </div>
        )}

        <textarea
          placeholder="Start writing..."
          className="w-full h-[40vh] bg-transparent border-none outline-none focus:ring-0 text-lg md:text-xl leading-relaxed text-stone-300 placeholder-stone-700 resize-none font-serif"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        
        {/* Tags Input */}
        <div className="mt-8 pt-6 border-t border-stone-800">
          {/* Suggested Tags */}
          {suggestedTags.length > 0 && (
            <div className="mb-4 animate-in fade-in">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 block flex items-center gap-1">
                <Icons.MagicWand /> Suggested Tags
              </span>
              <div className="flex flex-wrap gap-2">
                {suggestedTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      setTags([...tags, tag]);
                      setSuggestedTags(prev => prev.filter(t => t !== tag));
                    }}
                    className="px-3 py-1 bg-indigo-900/20 text-indigo-300 border border-indigo-500/20 text-xs font-bold rounded-full hover:bg-indigo-900/40 transition-colors flex items-center gap-1"
                  >
                    <span>+</span> {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-stone-800 text-stone-300 text-xs font-bold uppercase tracking-wider rounded-md flex items-center gap-2">
                #{tag}
                <button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-red-500"><Icons.X /></button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Add tags... (Press Enter)"
            className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm text-stone-400 font-medium"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={addTag}
          />
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="px-4 py-3 bg-stone-900/50 border-t border-stone-800 flex items-center justify-between backdrop-blur-md">
        <div className="flex space-x-2">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-stone-400 hover:text-stone-200 bg-stone-800 rounded-lg shadow-sm"
          >
            <Icons.Camera />
          </button>
        </div>
        
        {/* AI Tools */}
        <div className="flex items-center space-x-2 overflow-x-auto">
          <button
             onClick={generateSummary}
             disabled={isEnhancing || !content}
             className="px-3 py-1.5 bg-indigo-900/30 text-indigo-300 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-indigo-900/50 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {isEnhancing ? '...' : 'Summarize'}
          </button>
           <button
             onClick={handleGenerateTags}
             disabled={isEnhancing || (!content && !title)}
             className="px-3 py-1.5 bg-indigo-900/30 text-indigo-300 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-indigo-900/50 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {isEnhancing ? '...' : 'Tags'}
          </button>
          <button 
            onClick={() => applyAI('grammar')}
            disabled={isEnhancing || !content}
            className="px-3 py-1.5 bg-stone-800 text-stone-300 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-stone-700 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            Fix Grammar
          </button>
          <button 
            onClick={() => applyAI('expand')}
            disabled={isEnhancing || !content}
            className="px-3 py-1.5 bg-purple-900/20 text-purple-300 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-purple-900/40 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
             <Icons.MagicWand /> Expand
          </button>
        </div>
      </div>
    </div>
  );
};

export default JournalEditor;

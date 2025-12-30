
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, JournalEntry, AIInsight, Mood } from './types';
import Layout from './components/Layout';
import Onboarding from './components/Onboarding';
import JournalEditor from './components/JournalEditor';
import JournalViewer from './components/JournalViewer';
import { EntryCard } from './components/EntryCard';
import Heatmap from './components/Heatmap';
import { Icons } from './constants';
import { getDailyInsight } from './services/geminiService';
import { generateJournalPDF } from './services/pdfService';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [activeTab, setActiveTab] = useState('home');
  
  // View/Edit States
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null | undefined>(undefined);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [unlockPin, setUnlockPin] = useState('');
  
  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMood, setFilterMood] = useState<Mood | 'ALL'>('ALL');
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({ start: '', end: '' });

  // Home Filter States
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState<Partial<UserProfile>>({});

  // PIN Change State
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [pinChangeStep, setPinChangeStep] = useState<'old' | 'new' | 'confirm'>('old');
  const [tempOldPin, setTempOldPin] = useState('');
  const [tempNewPin, setTempNewPin] = useState('');
  const [tempConfirmPin, setTempConfirmPin] = useState('');

  // Export State
  const [exportRange, setExportRange] = useState<'all' | 'custom'>('all');
  const [exportStart, setExportStart] = useState('');
  const [exportEnd, setExportEnd] = useState('');

  // --- Persistence ---
  useEffect(() => {
    const savedUser = localStorage.getItem('journal_user');
    const savedEntries = localStorage.getItem('journal_entries');
    if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        if (parsedUser.securityPin) {
            setIsLocked(true);
        } else {
            setIsLocked(false);
        }
    } else {
        setIsLocked(false);
    }

    if (savedEntries) setEntries(JSON.parse(savedEntries));
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('journal_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('journal_entries', JSON.stringify(entries));
  }, [entries]);

  // --- AI Insights ---
  useEffect(() => {
    if (user && entries.length > 0 && activeTab === 'home') {
      if (!insight) {
        getDailyInsight(user, entries.slice(0, 5)).then(setInsight);
      }
    }
  }, [user, entries.length, activeTab]);

  // --- Handlers ---
  const handleSaveEntry = (entry: JournalEntry) => {
    setEntries(prev => {
      const idx = prev.findIndex(e => e.id === entry.id);
      return idx > -1 ? prev.map(e => e.id === entry.id ? entry : e) : [entry, ...prev];
    });
    
    // If we were viewing this entry, update the view to show changes
    if (viewingEntry && viewingEntry.id === entry.id) {
        setViewingEntry(entry);
    }
    
    setIsEditorOpen(false);
  };

  const handleDeleteEntry = (id: string) => {
    if (!confirm("Permanently delete this memory?")) return;
    
    setEntries(prev => prev.filter(e => e.id !== id));
    
    // Close viewer if we're currently viewing the deleted entry
    if (viewingEntry?.id === id) {
      setViewingEntry(null);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent | null, id: string) => {
    if (e) e.stopPropagation();
    let updatedEntry: JournalEntry | null = null;
    
    setEntries(prev => prev.map(entry => {
      if (entry.id === id) {
        updatedEntry = { ...entry, isFavorite: !entry.isFavorite };
        return updatedEntry;
      }
      return entry;
    }));

    if (viewingEntry?.id === id && updatedEntry) {
        setViewingEntry(updatedEntry);
    }
  };

  const handleProfileUpdate = () => {
    if (user) {
      setUser({ ...user, ...editProfileData });
      setIsEditingProfile(false);
    }
  };

  const handleExportPDF = () => {
    if (!user) return;
    
    let entriesToExport = entries;

    if (exportRange === 'custom' && exportStart && exportEnd) {
      const start = new Date(exportStart);
      const end = new Date(exportEnd);
      end.setHours(23, 59, 59, 999);
      
      entriesToExport = entries.filter(e => {
        const d = new Date(e.date);
        return d >= start && d <= end;
      });
    }

    if (entriesToExport.length === 0) {
      alert("No entries found in the selected range to export.");
      return;
    }

    generateJournalPDF(user, entriesToExport);
  };

  const handleUnlock = (pin: string) => {
      setUnlockPin(pin);
      if (pin.length === 4) {
          if (user?.securityPin === pin) {
              setIsLocked(false);
              setUnlockPin('');
          } else {
              // Simple error feedback: clear pin
              setTimeout(() => setUnlockPin(''), 200);
          }
      }
  };

  const handleChangePin = () => {
      if (pinChangeStep === 'old') {
          if (tempOldPin === user?.securityPin) {
              setPinChangeStep('new');
              setTempOldPin('');
          } else {
              setTempOldPin('');
              alert("Incorrect Old PIN");
          }
      } else if (pinChangeStep === 'new') {
          if (tempNewPin.length === 4) {
              setPinChangeStep('confirm');
          }
      } else if (pinChangeStep === 'confirm') {
          if (tempConfirmPin === tempNewPin) {
              setUser(prev => prev ? ({ ...prev, securityPin: tempNewPin }) : null);
              setIsChangingPin(false);
              setPinChangeStep('old');
              setTempNewPin('');
              setTempConfirmPin('');
              alert("PIN Updated Successfully");
          } else {
              alert("PINs do not match");
              setTempConfirmPin('');
          }
      }
  };

  // --- Derived State ---
  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries]);

  const homeDisplayEntries = useMemo(() => {
    return showFavoritesOnly ? sortedEntries.filter(e => e.isFavorite) : sortedEntries;
  }, [sortedEntries, showFavoritesOnly]);

  const filteredEntries = useMemo(() => {
    let result = sortedEntries;

    // Text Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => 
        e.title.toLowerCase().includes(q) || 
        e.content.toLowerCase().includes(q) ||
        e.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Mood Filter
    if (filterMood !== 'ALL') {
      result = result.filter(e => e.mood === filterMood);
    }

    // Date Range Filter
    if (dateRange.start) {
      result = result.filter(e => new Date(e.date) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      result = result.filter(e => new Date(e.date) <= endDate);
    }

    return result;
  }, [sortedEntries, searchQuery, filterMood, dateRange]);

  // --- Render Views ---
  if (!user) return <Onboarding onComplete={setUser} />;

  if (isLocked) {
      return (
          <div className="fixed inset-0 bg-stone-950 flex flex-col items-center justify-center p-8 z-[200]">
              <div className="w-16 h-16 bg-stone-800 rounded-2xl flex items-center justify-center mb-6 text-stone-300">
                  <Icons.Lock />
              </div>
              <h2 className="text-2xl font-serif font-bold text-white mb-2">Welcome Back, {user.name.split(' ')[0]}</h2>
              <p className="text-stone-500 mb-8">Enter your PIN to unlock</p>
              
              <div className="flex gap-4 mb-8">
                  {[0, 1, 2, 3].map(i => (
                      <div key={i} className={`w-4 h-4 rounded-full transition-all duration-200 ${i < unlockPin.length ? 'bg-amber-500 scale-110' : 'bg-stone-800'}`} />
                  ))}
              </div>

              <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  autoFocus
                  className="absolute opacity-0 w-full h-full inset-0 cursor-pointer"
                  value={unlockPin}
                  onChange={e => handleUnlock(e.target.value.replace(/[^0-9]/g, ''))}
              />
              
              <p className="text-xs text-stone-600 mt-8">Your secrets are safe.</p>
          </div>
      );
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onAdd={() => { setEditingEntry(null); setIsEditorOpen(true); }}
      isDark={true}
    >
      {/* --- Home View --- */}
      {activeTab === 'home' && (
        <div className="animate-in fade-in duration-500 space-y-6">
          <header className="flex flex-col gap-1 pb-4">
            <span className="text-stone-400 text-sm font-bold uppercase tracking-widest">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
            <div className="flex justify-between items-end">
              <h1 className="text-4xl font-serif font-bold text-white">
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user.name.split(' ')[0]}
              </h1>
            </div>
          </header>

          {/* AI Insight Card */}
          {insight && (
            <div className="bg-gradient-to-br from-indigo-950/30 to-purple-900/20 p-6 rounded-2xl border border-indigo-900/50 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">✨</div>
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Icons.MagicWand /> Weekly Insight
              </h3>
              <p className="text-lg font-serif italic text-stone-200 leading-relaxed">
                "{insight.text}"
              </p>
            </div>
          )}

          {/* Home Filters */}
          <div className="flex items-center gap-4 border-b border-stone-800 pb-2">
            <button 
              onClick={() => setShowFavoritesOnly(false)}
              className={`text-sm font-bold transition-colors pb-2 -mb-2.5 border-b-2 ${!showFavoritesOnly ? 'text-white border-white' : 'text-stone-500 border-transparent hover:text-stone-300'}`}
            >
              All Memories
            </button>
            <button 
              onClick={() => setShowFavoritesOnly(true)}
              className={`text-sm font-bold transition-colors pb-2 -mb-2.5 border-b-2 flex items-center gap-1 ${showFavoritesOnly ? 'text-amber-400 border-amber-400' : 'text-stone-500 border-transparent hover:text-stone-300'}`}
            >
              <Icons.Star filled={true} /> Favorites
            </button>
          </div>

          <div className="space-y-1">
             {homeDisplayEntries.length === 0 ? (
               <div className="text-center py-20 opacity-50">
                 <div className="mb-4 inline-block p-4 bg-stone-800 rounded-full"><Icons.Edit /></div>
                 <p className="text-lg font-serif">{showFavoritesOnly ? "No favorite memories yet." : "Your journal is waiting."}</p>
               </div>
             ) : (
               homeDisplayEntries.map(entry => (
                 <EntryCard 
                   key={entry.id}
                   entry={entry}
                   onClick={() => setViewingEntry(entry)}
                   onDelete={() => handleDeleteEntry(entry.id)}
                   onToggleFavorite={(e) => handleToggleFavorite(e, entry.id)}
                 />
               ))
             )}
          </div>
        </div>
      )}

      {/* --- Search View --- */}
      {activeTab === 'search' && (
        <div className="animate-in fade-in duration-300 space-y-6">
          <h1 className="text-3xl font-serif font-bold">Search</h1>
          
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search memories, tags, feelings..."
                className="w-full pl-12 pr-4 py-4 bg-stone-900 rounded-xl border border-stone-800 focus:ring-2 focus:ring-stone-500 outline-none text-white placeholder-stone-600"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus
              />
              <div className="absolute left-4 top-4 text-stone-500">
                <Icons.Search />
              </div>
            </div>

            {/* Filters */}
            <div className="bg-stone-900/50 p-4 rounded-xl border border-stone-800 space-y-4">
               {/* Mood Filter */}
               <div>
                 <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Filter by Mood</label>
                 <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                   <button 
                      onClick={() => setFilterMood('ALL')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${filterMood === 'ALL' ? 'bg-stone-100 text-stone-900' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}
                   >
                     All
                   </button>
                   {Object.values(Mood).map(m => (
                     <button 
                        key={m}
                        onClick={() => setFilterMood(m)}
                        className={`px-3 py-1.5 rounded-lg text-xl transition-colors ${filterMood === m ? 'bg-stone-700 ring-2 ring-stone-500' : 'bg-stone-800 hover:bg-stone-700'}`}
                     >
                       {m}
                     </button>
                   ))}
                 </div>
               </div>

               {/* Date Range Filter */}
               <div>
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Date Range</label>
                  <div className="flex gap-2">
                    <input 
                      type="date" 
                      className="bg-stone-800 border-none rounded-lg text-sm text-stone-300 p-2 w-full"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    />
                    <input 
                      type="date" 
                      className="bg-stone-800 border-none rounded-lg text-sm text-stone-300 p-2 w-full"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    />
                  </div>
               </div>
            </div>
          </div>

          <div className="space-y-2">
             {filteredEntries.length === 0 ? (
               <div className="text-center py-10">
                  <div className="text-4xl mb-2">🔍</div>
                  <p className="text-stone-400 font-serif">No memories found.</p>
               </div>
             ) : (
               filteredEntries.map(entry => (
                 <EntryCard 
                   key={entry.id}
                   entry={entry}
                   onClick={() => setViewingEntry(entry)}
                   onDelete={() => handleDeleteEntry(entry.id)}
                   onToggleFavorite={(e) => handleToggleFavorite(e, entry.id)}
                 />
               ))
             )}
          </div>
        </div>
      )}

      {/* --- Calendar / History View --- */}
      {activeTab === 'calendar' && (
        <div className="animate-in fade-in duration-300 space-y-6">
          <h1 className="text-3xl font-serif font-bold">History</h1>
          
          <div className="bg-stone-900 p-6 rounded-3xl border border-stone-800">
            <h3 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-4">Consistency</h3>
            <Heatmap entries={entries} />
            <div className="mt-8 pt-6 border-t border-stone-800 text-center">
              <p className="text-4xl font-bold text-white">{entries.length}</p>
              <p className="text-stone-500 text-sm">Total Memories</p>
            </div>
          </div>
        </div>
      )}

      {/* --- Settings / Profile View --- */}
      {activeTab === 'profile' && (
        <div className="animate-in fade-in duration-300 space-y-6 pb-20">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-serif font-bold">Settings</h1>
            {!isEditingProfile && !isChangingPin ? (
              <button 
                onClick={() => {
                  setEditProfileData({ bio: user.bio, location: user.location });
                  setIsEditingProfile(true);
                }}
                className="text-stone-400 hover:text-white transition-colors"
              >
                <Icons.UserEdit />
              </button>
            ) : isEditingProfile ? (
               <button 
                onClick={handleProfileUpdate}
                className="text-amber-400 font-bold text-sm"
              >
                Done
              </button>
            ) : null}
          </div>
          
          {/* User Info Card */}
          <div className="bg-stone-900 p-6 rounded-3xl border border-stone-800">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-stone-800 rounded-full flex items-center justify-center text-2xl font-serif font-bold text-stone-400">
                {user.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-stone-500 text-sm">{user.email}</p>
              </div>
            </div>
            
            <div className="space-y-3 pt-2 border-t border-stone-800">
              {/* Bio Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-600 uppercase">Bio</label>
                {isEditingProfile ? (
                  <textarea
                    className="w-full bg-stone-800 rounded-lg p-2 text-sm text-stone-200 resize-none border-none focus:ring-1 focus:ring-stone-500"
                    rows={2}
                    value={editProfileData.bio || ''}
                    onChange={e => setEditProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  />
                ) : (
                  <p className="text-stone-300 text-sm italic">{user.bio || 'No bio yet.'}</p>
                )}
              </div>

              {/* Location Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-600 uppercase">Location</label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    className="w-full bg-stone-800 rounded-lg p-2 text-sm text-stone-200 border-none focus:ring-1 focus:ring-stone-500"
                    value={editProfileData.location || ''}
                    onChange={e => setEditProfileData(prev => ({ ...prev, location: e.target.value }))}
                  />
                ) : (
                  <div className="flex items-center gap-2 text-stone-300 text-sm">
                    <Icons.MapPin />
                    <span>{user.location || 'Unknown'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-stone-900 rounded-3xl border border-stone-800 p-6 space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <Icons.Shield />
                <h3 className="font-bold text-lg">Security</h3>
             </div>
             
             {!isChangingPin ? (
               <button 
                  onClick={() => { setIsChangingPin(true); setPinChangeStep('old'); setTempOldPin(''); setTempNewPin(''); setTempConfirmPin(''); }}
                  className="w-full bg-stone-800 hover:bg-stone-700 text-stone-200 py-3 rounded-xl transition-colors flex items-center justify-between px-4"
               >
                 <span className="font-medium">Change PIN</span>
                 <Icons.Lock />
               </button>
             ) : (
               <div className="space-y-3 bg-stone-800/50 p-4 rounded-xl border border-stone-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-stone-400">
                      {pinChangeStep === 'old' ? 'Verify Current PIN' : pinChangeStep === 'new' ? 'New 4-Digit PIN' : 'Confirm New PIN'}
                    </span>
                    <button onClick={() => setIsChangingPin(false)} className="text-xs text-stone-500">Cancel</button>
                  </div>
                  
                  <input 
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg p-3 text-center tracking-[0.5em] font-mono"
                    value={pinChangeStep === 'old' ? tempOldPin : pinChangeStep === 'new' ? tempNewPin : tempConfirmPin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      if (pinChangeStep === 'old') setTempOldPin(val);
                      else if (pinChangeStep === 'new') setTempNewPin(val);
                      else setTempConfirmPin(val);
                    }}
                  />
                  <button 
                    onClick={handleChangePin}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-bold text-sm"
                  >
                    {pinChangeStep === 'confirm' ? 'Set New PIN' : 'Next'}
                  </button>
               </div>
             )}
          </div>

          {/* Export Section */}
          <div className="bg-stone-900 rounded-3xl border border-stone-800 p-6 space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <Icons.Download />
                <h3 className="font-bold text-lg">Export Journal</h3>
             </div>
             
             <div className="flex gap-4 mb-2">
               <label className="flex items-center gap-2 cursor-pointer">
                 <input 
                    type="radio" 
                    name="exportRange" 
                    checked={exportRange === 'all'} 
                    onChange={() => setExportRange('all')}
                    className="text-amber-500 focus:ring-amber-500 bg-stone-800 border-stone-700"
                 />
                 <span className="text-sm">All Memories</span>
               </label>
               <label className="flex items-center gap-2 cursor-pointer">
                 <input 
                    type="radio" 
                    name="exportRange" 
                    checked={exportRange === 'custom'} 
                    onChange={() => setExportRange('custom')}
                    className="text-amber-500 focus:ring-amber-500 bg-stone-800 border-stone-700"
                 />
                 <span className="text-sm">Custom Range</span>
               </label>
             </div>

             {exportRange === 'custom' && (
               <div className="flex gap-2 animate-in fade-in slide-in-from-top-1">
                 <input 
                   type="date" 
                   className="flex-1 bg-stone-800 border-none rounded-lg text-sm text-stone-300 p-2"
                   value={exportStart}
                   onChange={(e) => setExportStart(e.target.value)}
                 />
                 <input 
                   type="date" 
                   className="flex-1 bg-stone-800 border-none rounded-lg text-sm text-stone-300 p-2"
                   value={exportEnd}
                   onChange={(e) => setExportEnd(e.target.value)}
                 />
               </div>
             )}

             <button 
               onClick={handleExportPDF}
               className="w-full bg-stone-100 text-stone-900 font-bold py-3 rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2"
             >
               <Icons.Download /> Download PDF
             </button>
             <p className="text-xs text-stone-500 text-center">Exported in "Diary" skin format</p>
          </div>

          {/* Developer Card */}
          <div className="bg-stone-900 p-6 rounded-3xl border border-stone-800 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-2xl rounded-full pointer-events-none"></div>
             <h3 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-4">About the Developer</h3>
             
             <div className="space-y-1">
               <p className="text-lg font-serif font-bold text-white">Vishwas Chakilam</p>
               <p className="text-stone-400 text-sm">Crafting digital experiences.</p>
             </div>

             <div className="flex flex-col gap-3 mt-6">
               <a href="https://github.com/vishwas-chakilam" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-stone-400 hover:text-white transition-colors group">
                 <div className="p-2 bg-stone-800 rounded-lg group-hover:bg-stone-700"><Icons.Github /></div>
                 <span className="text-sm">github.com/vishwas-chakilam</span>
               </a>
               <a href="https://linkedin.com/in/vishwas-chakilam" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-stone-400 hover:text-white transition-colors group">
                 <div className="p-2 bg-stone-800 rounded-lg group-hover:bg-stone-700"><Icons.Linkedin /></div>
                 <span className="text-sm">linkedin.com/in/vishwas-chakilam</span>
               </a>
               <a href="mailto:work.vishwas1@gmail.com" className="flex items-center gap-3 text-stone-400 hover:text-white transition-colors group">
                 <div className="p-2 bg-stone-800 rounded-lg group-hover:bg-stone-700"><Icons.Mail /></div>
                 <span className="text-sm">work.vishwas1@gmail.com</span>
               </a>
             </div>
          </div>

          <div className="bg-stone-900 rounded-3xl border border-stone-800 overflow-hidden">
             <div className="p-4 flex items-center justify-between hover:bg-stone-800/50 cursor-pointer text-red-500" onClick={() => { localStorage.clear(); location.reload(); }}>
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-red-900/20 rounded-lg">
                    <Icons.Trash />
                 </div>
                 <span className="font-medium">Reset Journal Data</span>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* --- Viewer Modal --- */}
      {viewingEntry && !isEditorOpen && (
        <JournalViewer 
          entry={viewingEntry}
          onClose={() => setViewingEntry(null)}
          onEdit={() => {
            setEditingEntry(viewingEntry);
            setIsEditorOpen(true);
          }}
          onDelete={() => handleDeleteEntry(viewingEntry.id)}
          onToggleFavorite={() => handleToggleFavorite(null, viewingEntry.id)}
        />
      )}

      {/* --- Editor Modal --- */}
      {isEditorOpen && (
        <JournalEditor 
          entry={editingEntry || undefined}
          onSave={handleSaveEntry}
          onClose={() => setIsEditorOpen(false)}
          isDark={true}
        />
      )}
    </Layout>
  );
};

export default App;

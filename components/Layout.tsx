
import React from 'react';
import { Icons } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAdd: () => void;
  isDark: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onAdd, isDark }) => {
  const tabs = [
    { id: 'home', icon: Icons.Home, label: 'Journal' },
    { id: 'search', icon: Icons.Search, label: 'Search' },
    { id: 'calendar', icon: Icons.Calendar, label: 'History' },
    { id: 'profile', icon: Icons.Settings, label: 'Settings' },
  ];

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'dark bg-stone-950 text-stone-100' : 'bg-stone-50 text-stone-900'}`}>
      <main className="flex-1 pb-28 max-w-2xl mx-auto w-full px-4 pt-10">
        {children}
      </main>

      {/* Floating Bottom Nav */}
      <div className="fixed bottom-6 left-4 right-4 z-40 max-w-md mx-auto">
        <nav className="glass-panel rounded-2xl p-1.5 flex justify-between items-center shadow-xl shadow-stone-900/5 dark:shadow-black/40">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-3 rounded-xl transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-md' 
                  : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100/50 dark:hover:bg-stone-800/50'
              }`}
            >
              <div className={activeTab === tab.id ? "scale-105" : ""}>
                <tab.icon />
              </div>
            </button>
          ))}
          
          <div className="w-[1px] h-8 bg-stone-200 dark:bg-stone-800 mx-1"></div>

          <button
            onClick={onAdd}
            className="flex-1 flex items-center justify-center py-3 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-colors"
          >
            <Icons.Plus />
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Layout;

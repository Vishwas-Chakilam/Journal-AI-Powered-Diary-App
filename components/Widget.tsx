
import React from 'react';
import { JournalEntry } from '../types';

interface WidgetProps {
  entries: JournalEntry[];
  userName: string;
}

const Widget: React.FC<WidgetProps> = ({ entries, userName }) => {
  const latestEntry = entries.length > 0 ? entries[entries.length - 1] : null;
  const streak = 3; // Mocked streak for visual appeal

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div className="glass p-6 rounded-3xl border border-white/20 shadow-sm dark:border-white/10">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Welcome back</h3>
        <p className="text-2xl font-bold dark:text-white">{userName}</p>
        <div className="mt-4 flex items-center space-x-2">
          <span className="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-semibold">
            {entries.length} Entries
          </span>
          <span className="bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300 px-3 py-1 rounded-full text-xs font-semibold">
            🔥 {streak} Day Streak
          </span>
        </div>
      </div>

      <div className="glass p-6 rounded-3xl border border-white/20 shadow-sm dark:border-white/10">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Last Entry</h3>
        {latestEntry ? (
          <div>
            <p className="text-lg font-semibold dark:text-white truncate">{latestEntry.title}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {latestEntry.content}
            </p>
          </div>
        ) : (
          <p className="text-gray-400 italic">No entries yet. Start writing!</p>
        )}
      </div>
    </div>
  );
};

export default Widget;

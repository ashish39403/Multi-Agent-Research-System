import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  History, Settings, Sun, Moon, ChevronLeft, Zap,
  Clock, Sliders, FileText, Share2, Sparkles, Trash2,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatDistanceToNow } from '../../utils/time';

export default function Sidebar() {
  const { 
    isDark, 
    toggleTheme, 
    sidebarOpen, 
    toggleSidebar, 
    history, 
    loadHistory, 
    deleteHistoryItem,
    clearHistory,
    activeHistoryId, 
    settings, 
    updateSettings 
  } = useAppStore();
  
  const [activeSection, setActiveSection] = useState<'history' | 'settings'>('history');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 280, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="glass-sidebar flex-shrink-0 h-screen flex flex-col overflow-hidden relative z-20"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-theme">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2.5"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-emerald-500 flex items-center justify-center">
                <Zap size={14} className="text-white" />
              </div>
              <span className="font-semibold text-sm tracking-tight text-primary">MARS</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20">
                LIVE
              </span>
            </motion.div>
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-secondary hover:text-primary"
            >
              <ChevronLeft size={16} />
            </button>
          </div>

          {/* Nav tabs */}
          <div className="flex gap-1 p-3 border-b border-theme">
            {(['history', 'settings'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSection(tab)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeSection === tab
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'text-secondary hover:text-primary hover:bg-white/5'
                }`}
              >
                {tab === 'history' ? <History size={13} /> : <Settings size={13} />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            <AnimatePresence mode="wait">
              {activeSection === 'history' ? (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1"
                >
                  <div className="flex items-center justify-between px-2 py-1">
                    <p className="text-xs font-medium text-secondary uppercase tracking-wider">Recent</p>
                    {history.length > 0 && (
                      <button
                        onClick={() => {
                          if (confirm('Delete all history?')) {
                            clearHistory();
                          }
                        }}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        Clear All
                      </button>
                    )}
                  </div>
                  {history.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="relative group"
                      onMouseEnter={() => setHoveredId(item.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      <button
                        onClick={() => loadHistory(item.id)}
                        className={`w-full text-left p-3 rounded-xl transition-all relative overflow-hidden ${
                          activeHistoryId === item.id
                            ? 'bg-blue-500/10 border border-blue-500/20'
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <FileText size={13} className={`mt-0.5 flex-shrink-0 ${activeHistoryId === item.id ? 'text-blue-400' : 'text-secondary'}`} />
                          <div className="min-w-0 flex-1">
                            <p className={`text-xs font-medium truncate ${activeHistoryId === item.id ? 'text-blue-300' : 'text-primary'}`}>
                              {item.title}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock size={10} className="text-secondary" />
                              <span className="text-xs text-secondary">{formatDistanceToNow(item.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* ✅ Delete Button - Individual */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete "${item.title}"?`)) {
                            deleteHistoryItem(item.id);
                          }
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all"
                        title="Delete this report"
                      >
                        <Trash2 size={14} />
                      </button>

                      {/* Hover preview tooltip */}
                      <AnimatePresence>
                        {hoveredId === item.id && activeHistoryId !== item.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute left-full ml-2 top-0 w-52 glass rounded-xl p-3 z-50 pointer-events-none"
                            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
                          >
                            <p className="text-xs text-primary font-medium mb-1">{item.title}</p>
                            <p className="text-xs text-secondary leading-relaxed line-clamp-3">{item.preview}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <SettingSection
                    icon={<Sliders size={13} />}
                    label="Research Depth"
                    options={['quick', 'standard', 'deep']}
                    value={settings.researchDepth}
                    onChange={(v) => updateSettings({ researchDepth: v as 'quick' | 'standard' | 'deep' })}
                  />
                  <SettingSection
                    icon={<FileText size={13} />}
                    label="Output Style"
                    options={['concise', 'detailed', 'academic']}
                    value={settings.outputStyle}
                    onChange={(v) => updateSettings({ outputStyle: v as 'concise' | 'detailed' | 'academic' })}
                  />
                  <SettingSection
                    icon={<Share2 size={13} />}
                    label="Export Format"
                    options={['markdown', 'pdf', 'docx']}
                    value={settings.exportFormat}
                    onChange={(v) => updateSettings({ exportFormat: v as 'markdown' | 'pdf' | 'docx' })}
                  />
                  <SettingSection
                    icon={<Sparkles size={13} />}
                    label="Animations"
                    options={['full', 'reduced', 'none']}
                    value={settings.animations}
                    onChange={(v) => updateSettings({ animations: v as 'full' | 'reduced' | 'none' })}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer: theme toggle */}
          <div className="p-3 border-t border-theme">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group"
            >
              <div className={`w-8 h-4.5 rounded-full relative transition-colors ${isDark ? 'bg-indigo-600' : 'bg-amber-400'}`}
                style={{ height: '18px', width: '36px' }}>
                <motion.div
                  animate={{ x: isDark ? 18 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm flex items-center justify-center"
                  style={{ width: '14px', height: '14px' }}
                >
                  {isDark
                    ? <Moon size={7} className="text-indigo-600" />
                    : <Sun size={7} className="text-amber-500" />
                  }
                </motion.div>
              </div>
              <span className="text-xs font-medium text-secondary group-hover:text-primary transition-colors">
                {isDark ? 'Dark mode' : 'Light mode'}
              </span>
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function SettingSection({
  icon, label, options, value, onChange,
}: {
  icon: React.ReactNode;
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 px-1">
        <span className="text-secondary">{icon}</span>
        <p className="text-xs font-medium text-secondary uppercase tracking-wider">{label}</p>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`py-1.5 px-1 rounded-lg text-xs font-medium transition-all capitalize ${
              value === opt
                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                : 'text-secondary hover:text-primary hover:bg-white/5 border border-transparent'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Search, CornerDownLeft, Loader2, RotateCcw } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { SUGGESTED_QUERIES } from '../../data/mockData';

const MAX_CHARS = 500;

export default function ResearchInput() {
  const { query, setQuery, phase, startResearch, resetResearch } = useAppStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);

  const isActive = phase !== 'idle';
  const isRunning = phase !== 'idle' && phase !== 'complete';

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !isRunning) {
      e.preventDefault();
      if (phase === 'complete') resetResearch();
      else startResearch();
    }
  };

  const handleSubmit = () => {
    if (phase === 'complete') {
      resetResearch();
    } else if (!isRunning) {
      startResearch();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="px-6 md:px-8"
    >
      <div className={`relative rounded-2xl glass transition-all duration-300 ${
        focused ? 'ring-2 ring-blue-500/40 shadow-lg shadow-blue-500/10' : ''
      }`}>
        {/* Textarea */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value.slice(0, MAX_CHARS))}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="What would you like to research today?"
            disabled={isRunning}
            rows={1}
            className="w-full bg-transparent resize-none rounded-2xl px-5 pt-4 pb-3 text-sm text-primary placeholder:text-secondary focus:outline-none disabled:opacity-60 transition-opacity leading-relaxed"
            style={{ minHeight: '56px', maxHeight: '200px' }}
          />
          {/* Character count */}
          <AnimatePresence>
            {query.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-3 right-4 text-xs text-secondary"
              >
                {query.length}/{MAX_CHARS}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-4 pb-3 pt-1 gap-3">
          {/* Suggested queries */}
          <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
            {!isActive && SUGGESTED_QUERIES.slice(0, 3).map((q, i) => (
              <motion.button
                key={q}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i }}
                onClick={() => setQuery(q)}
                className="px-2.5 py-1 rounded-lg text-xs text-secondary hover:text-primary border border-theme hover:border-blue-500/30 hover:bg-blue-500/5 transition-all whitespace-nowrap"
              >
                {q}
              </motion.button>
            ))}
            {isActive && !isRunning && (
              <span className="text-xs text-secondary">Research complete</span>
            )}
          </div>

          {/* Action area */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-secondary hidden sm:flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 font-mono text-xs border border-theme">⌘</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 font-mono text-xs border border-theme">↵</kbd>
            </span>

            {phase === 'complete' && (
              <button
                onClick={resetResearch}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-secondary hover:text-primary hover:bg-white/5 transition-all"
              >
                <RotateCcw size={13} />
                New
              </button>
            )}

            <motion.button
              onClick={handleSubmit}
              disabled={!query.trim() || isRunning}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                !query.trim() || isRunning
                  ? 'bg-white/5 text-secondary cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40'
              }`}
            >
              {isRunning ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Researching…
                </>
              ) : (
                <>
                  <Search size={14} />
                  Start Research
                  <CornerDownLeft size={12} className="opacity-60" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* All suggested queries on idle */}
      <AnimatePresence>
        {!isActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 mt-3 px-1"
          >
            <span className="text-xs text-secondary self-center">Try:</span>
            {SUGGESTED_QUERIES.map((q, i) => (
              <motion.button
                key={q}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => setQuery(q)}
                className="px-3 py-1.5 rounded-full text-xs font-medium glass border border-theme hover:border-blue-500/30 text-secondary hover:text-primary transition-all"
              >
                {q}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

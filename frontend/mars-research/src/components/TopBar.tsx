import { motion } from 'framer-motion';
import { Menu, Zap } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function TopBar() {
  const { toggleSidebar, sidebarOpen } = useAppStore();

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-12 flex items-center px-4 border-b border-theme glass-sidebar sticky top-0 z-30"
    >
      <div className="flex items-center gap-3">
        {!sidebarOpen && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-secondary hover:text-primary"
          >
            <Menu size={16} />
          </motion.button>
        )}
        {!sidebarOpen && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-emerald-500 flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-primary">MARS</span>
          </div>
        )}
      </div>
    </motion.header>
  );
}

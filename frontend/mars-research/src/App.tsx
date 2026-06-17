import { motion } from 'framer-motion';
import Sidebar from './components/sidebar/Sidebar';
import HeroSection from './components/HeroSection';
import ResearchInput from './components/input/ResearchInput';
import AgentPipeline from './components/pipeline/AgentPipeline';
import ResearchResults from './components/results/ResearchResults';
import TopBar from './components/TopBar';
import { useAppStore } from './store/useAppStore';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

export default function App() {
  const { phase } = useAppStore();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-gradient)' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />

        <main className="flex-1 overflow-y-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto py-6 space-y-8 pb-24"
          >
            {/* Hero */}
            <motion.div variants={sectionVariants}>
              <HeroSection />
            </motion.div>

            {/* Research Input */}
            <motion.div variants={sectionVariants}>
              <ResearchInput />
            </motion.div>

            {/* Agent Pipeline */}
            {phase !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <AgentPipeline />
              </motion.div>
            )}

            {/* Results */}
            <ResearchResults />
          </motion.div>
        </main>
      </div>
    </div>
  );
}

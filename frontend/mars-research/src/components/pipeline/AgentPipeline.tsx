import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  Search, BookOpen, PenLine,
  CheckCircle2, Loader2, Clock, ChevronDown, ChevronUp,
  Terminal,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Agent, AgentStatus } from '../../types';

const AGENT_ICONS = {
  search: Search,
  reader: BookOpen,
  writer: PenLine,
};

const STATUS_CONFIG: Record<AgentStatus, { label: string; icon: React.ElementType }> = {
  idle: { label: 'Idle', icon: Clock },
  processing: { label: 'Processing', icon: Loader2 },
  completed: { label: 'Completed', icon: CheckCircle2 },
  error: { label: 'Error', icon: Clock },
};

const LOG_COLORS = {
  info: 'text-slate-400',
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  action: 'text-blue-400',
};

export default function AgentPipeline() {
  const { agents, phase } = useAppStore();
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  if (phase === 'idle') return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="px-6 md:px-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        <h2 className="text-sm font-semibold text-primary">Agent Pipeline</h2>
      </div>

      <div className="relative">
        {/* Connecting lines between agents */}
        <div className="hidden md:flex absolute top-10 left-0 right-0 items-center justify-center pointer-events-none z-0">
          <div className="flex items-center gap-0 w-full px-24">
            <div className="flex-1" />
            <ConnectorLine agent={agents[0]} nextAgent={agents[1]} />
            <div className="flex-1" />
            <ConnectorLine agent={agents[1]} nextAgent={agents[2]} />
            <div className="flex-1" />
          </div>
        </div>

        {/* Agent Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          {agents.map((agent, i) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              index={i}
              isExpanded={expandedAgent === agent.id}
              onToggle={() => setExpandedAgent(expandedAgent === agent.id ? null : agent.id)}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function ConnectorLine({ agent, nextAgent }: { agent: Agent; nextAgent: Agent }) {
  const active = agent.status === 'completed' && nextAgent.status !== 'idle';
  const color = agent.color;

  return (
    <div className="flex-1 flex items-center justify-center overflow-hidden h-px relative">
      <div className={`w-full h-px transition-all duration-500 ${
        active ? 'opacity-100' : 'opacity-20'
      }`} style={{ background: active ? `linear-gradient(90deg, ${color}, ${nextAgent.color})` : '#334155' }} />
      {active && (
        <motion.div
          animate={{ x: ['0%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="absolute left-0 w-8 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
        />
      )}
    </div>
  );
}

function AgentCard({
  agent, index, isExpanded, onToggle,
}: {
  agent: Agent;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const Icon = AGENT_ICONS[agent.id];
  const statusCfg = STATUS_CONFIG[agent.status];
  const StatusIcon = statusCfg.icon;

  const glowStyle = agent.status === 'processing'
    ? { boxShadow: `0 0 24px ${agent.color}30, 0 0 48px ${agent.color}10` }
    : agent.status === 'completed'
    ? { boxShadow: `0 0 16px ${agent.color}20` }
    : {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-2xl glass overflow-hidden transition-all duration-500"
      style={glowStyle}
    >
      {/* Progress bar top strip */}
      <div className="h-0.5 w-full bg-white/5 relative overflow-hidden">
        <motion.div
          animate={{ width: `${agent.progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="h-full absolute left-0 top-0"
          style={{ background: `linear-gradient(90deg, ${agent.color}80, ${agent.color})` }}
        />
      </div>

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <motion.div
            animate={agent.status === 'processing' ? {
              scale: [1, 1.08, 1],
              transition: { duration: 1.5, repeat: Infinity }
            } : { scale: 1 }}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${agent.color}18`, border: `1px solid ${agent.color}30` }}
          >
            <Icon size={18} style={{ color: agent.color }} />
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-primary">{agent.name}</h3>
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                agent.status === 'idle' ? 'bg-slate-500/10 text-slate-400' :
                agent.status === 'processing' ? 'bg-blue-500/10 text-blue-400' :
                agent.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                'bg-red-500/10 text-red-400'
              }`}>
                <StatusIcon
                  size={10}
                  className={agent.status === 'processing' ? 'animate-spin' : agent.status === 'completed' ? '' : ''}
                />
                {statusCfg.label}
              </div>
            </div>
            <p className="text-xs text-secondary mt-0.5 leading-relaxed">{agent.description}</p>
          </div>
        </div>

        {/* Progress */}
        {(agent.status === 'processing' || agent.status === 'completed') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-secondary">Progress</span>
              <span className="text-xs font-medium" style={{ color: agent.color }}>{agent.progress}%</span>
            </div>
            <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
              <motion.div
                animate={{ width: `${agent.progress}%` }}
                transition={{ duration: 0.3 }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${agent.color}80, ${agent.color})` }}
              />
            </div>
          </motion.div>
        )}

        {/* Completed checkmark bounce */}
        <AnimatePresence>
          {agent.status === 'completed' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="mt-3 flex items-center gap-1.5"
            >
              <CheckCircle2 size={13} style={{ color: agent.color }} />
              <span className="text-xs" style={{ color: agent.color }}>Task complete</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logs toggle */}
        {agent.logs.length > 0 && (
          <button
            onClick={onToggle}
            className="mt-3 w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/3 hover:bg-white/6 transition-all text-xs text-secondary hover:text-primary"
          >
            <div className="flex items-center gap-1.5">
              <Terminal size={11} />
              Agent logs ({agent.logs.length})
            </div>
            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}
      </div>

      {/* Logs panel */}
      <AnimatePresence>
        {isExpanded && agent.logs.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="bg-black/20 border-t border-white/5 p-3 space-y-1.5 max-h-40 overflow-y-auto">
              {agent.logs.map((log, i) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-2"
                >
                  <span className="text-slate-600 text-xs font-mono mt-0.5 flex-shrink-0">›</span>
                  <span className={`text-xs font-mono leading-relaxed ${LOG_COLORS[log.type]}`}>{log.message}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

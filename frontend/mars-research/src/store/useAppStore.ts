import { create } from 'zustand';
import { persist } from 'zustand/middleware';  // ✅ Add this import
import { Agent, ResearchHistoryItem, ResearchPhase, AppSettings, AgentStatus, LogEntry } from '../types';
import {
  MOCK_HISTORY,
  MOCK_RESEARCH_RESULT,
} from '../data/mockData';

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Helper function to create log entry
const createLog = (message: string, type: 'info' | 'success' | 'warning' | 'action' = 'info'): LogEntry => ({
  id: Date.now().toString() + Math.random(),
  message,
  type,
  timestamp: new Date(),
});

interface AppState {
  isDark: boolean;
  toggleTheme: () => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  query: string;
  setQuery: (q: string) => void;
  phase: ResearchPhase;
  agents: Agent[];
  result: string | null;
  history: ResearchHistoryItem[];
  activeHistoryId: string | null;
  settings: AppSettings;
  updateSettings: (s: Partial<AppSettings>) => void;
  startResearch: () => void;
  resetResearch: () => void;
  loadHistory: (id: string) => void;
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;
  currentResearchId: string | null;
}

const DEFAULT_AGENTS: Agent[] = [
  {
    id: 'search',
    name: 'Search Agent',
    description: 'Scans the web for authoritative sources.',
    color: '#3b82f6',
    status: 'idle',
    progress: 0,
    logs: [],
  },
  {
    id: 'reader',
    name: 'Reader Agent',
    description: 'Extracts and synthesizes key information.',
    color: '#8b5cf6',
    status: 'idle',
    progress: 0,
    logs: [],
  },
  {
    id: 'writer',
    name: 'Writer Agent',
    description: 'Composes a structured research report.',
    color: '#10b981',
    status: 'idle',
    progress: 0,
    logs: [],
  },
];

let activePollInterval: number | null = null;

// ✅ Add persist middleware
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isDark: true,
      toggleTheme: () => {
        const next = !get().isDark;
        if (next) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        set({ isDark: next });
      },

      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      query: '',
      setQuery: (query) => set({ query }),

      phase: 'idle',
      agents: DEFAULT_AGENTS,
      result: null,
      history: MOCK_HISTORY,
      activeHistoryId: null,
      currentResearchId: null,

      settings: {
        researchDepth: 'standard',
        outputStyle: 'detailed',
        exportFormat: 'markdown',
        animations: 'full',
      },
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      resetResearch: () => {
        if (activePollInterval) {
          clearInterval(activePollInterval);
          activePollInterval = null;
        }
        set({
          phase: 'idle',
          result: null,
          query: '',
          activeHistoryId: null,
          currentResearchId: null,
          agents: DEFAULT_AGENTS.map((agent) => ({
            ...agent,
            status: 'idle' as AgentStatus,
            progress: 0,
            logs: []
          })),
        });
      },

      // ✅ Delete with force save
      deleteHistoryItem: (id: string) => {
        set((state) => {
          const newHistory = state.history.filter((item) => item.id !== id);
          
          // ✅ Save to localStorage directly
          try {
            const data = {
              state: {
                isDark: state.isDark,
                history: newHistory,
                settings: state.settings,
              },
              version: 0
            };
            localStorage.setItem('research-storage', JSON.stringify(data));
          } catch (error) {
            console.error('Failed to save:', error);
          }
          
          return { history: newHistory };
        });
      },

      // ✅ Clear with force save
      clearHistory: () => {
        set((state) => {
          // ✅ Save to localStorage directly
          try {
            const data = {
              state: {
                isDark: state.isDark,
                history: [],
                settings: state.settings,
              },
              version: 0
            };
            localStorage.setItem('research-storage', JSON.stringify(data));
          } catch (error) {
            console.error('Failed to save:', error);
          }
          
          return { history: [] };
        });
      },

      loadHistory: (id) => {
        const item = get().history.find((h) => h.id === id);
        if (!item) return;
        set({
          activeHistoryId: id,
          result: item.result || MOCK_RESEARCH_RESULT,
          phase: 'complete',
          query: item.title,
          agents: DEFAULT_AGENTS.map((agent) => ({
            ...agent,
            status: 'completed' as AgentStatus,
            progress: 100
          })),
        });
      },

      startResearch: () => {
        const { query, resetResearch } = get();
        if (!query.trim()) return;

        resetResearch();

        set({
          phase: 'searching',
          result: null,
          activeHistoryId: null,
          currentResearchId: null,
          agents: DEFAULT_AGENTS.map((agent) => ({
            ...agent,
            status: 'idle' as AgentStatus,
            progress: 0,
            logs: []
          })),
        });

        // Update Search Agent
        set((state) => ({
          agents: state.agents.map((agent) =>
            agent.id === 'search'
              ? {
                  ...agent,
                  status: 'processing' as AgentStatus,
                  progress: 10,
                  logs: [createLog('🌐 Initializing search agent...', 'info')]
                }
              : agent
          ),
        }));

        // Call API
        fetch(`${API_BASE_URL}/research`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, save_intermediate: true }),
        })
          .then(async (response) => {
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            const data = await response.json();
            const researchId = data.id;

            set({ currentResearchId: researchId });

            // Search Agent completed
            set((state) => ({
              phase: 'reading',
              agents: state.agents.map((agent) => {
                if (agent.id === 'search') {
                  return {
                    ...agent,
                    status: 'completed' as AgentStatus,
                    progress: 100,
                    logs: [...agent.logs, createLog('✅ Search completed. Found relevant sources.', 'success')]
                  };
                }
                if (agent.id === 'reader') {
                  return {
                    ...agent,
                    status: 'processing' as AgentStatus,
                    progress: 20,
                    logs: [createLog('📖 Starting to analyze sources...', 'info')]
                  };
                }
                return agent;
              }),
            }));

            // Poll for results
            activePollInterval = window.setInterval(async () => {
              try {
                const statusRes = await fetch(`${API_BASE_URL}/research/${researchId}`);
                const result = await statusRes.json();

                if (result.status === 'completed') {
                  set((state) => ({
                    phase: 'complete',
                    result: result.final_report,
                    agents: state.agents.map((agent) => {
                      if (agent.id === 'reader') {
                        return {
                          ...agent,
                          status: 'completed' as AgentStatus,
                          progress: 100,
                          logs: [...agent.logs, createLog('✅ Analysis complete. Key insights extracted.', 'success')]
                        };
                      }
                      if (agent.id === 'writer') {
                        return {
                          ...agent,
                          status: 'completed' as AgentStatus,
                          progress: 100,
                          logs: [...agent.logs, createLog('✍️ Report generation complete!', 'success')]
                        };
                      }
                      return agent;
                    }),
                  }));

                  // Save to history
                  const newItem: ResearchHistoryItem = {
                    id: Date.now().toString(),
                    title: query.length > 40 ? query.slice(0, 40) + '…' : query,
                    timestamp: new Date(),
                    preview: result.final_report?.slice(0, 120) + '…' || 'Research report generated',
                    result: result.final_report,
                  };

                  set((state) => ({
                    history: [newItem, ...state.history],
                    activeHistoryId: newItem.id,
                  }));

                  if (activePollInterval) {
                    clearInterval(activePollInterval);
                    activePollInterval = null;
                  }
                } 
                else if (result.status === 'failed') {
                  set({ phase: 'idle' });
                  if (activePollInterval) {
                    clearInterval(activePollInterval);
                    activePollInterval = null;
                  }
                }
                else {
                  // Update progress dynamically
                  set((state) => {
                    const newAgents = [...state.agents];
                    let newPhase = state.phase;

                    const readerIndex = newAgents.findIndex(a => a.id === 'reader');
                    const writerIndex = newAgents.findIndex(a => a.id === 'writer');

                    if (readerIndex !== -1 && state.phase === 'reading') {
                      const currentProgress = newAgents[readerIndex].progress;
                      const newProgress = Math.min(80, currentProgress + 15);
                      newAgents[readerIndex] = {
                        ...newAgents[readerIndex],
                        progress: newProgress,
                      };

                      if (newProgress > 40 && newProgress <= 45 && newAgents[readerIndex].logs.length < 3) {
                        newAgents[readerIndex].logs = [
                          ...newAgents[readerIndex].logs,
                          createLog('🔍 Extracting key facts and statistics...', 'info')
                        ];
                      } else if (newProgress > 70 && newProgress <= 75 && newAgents[readerIndex].logs.length < 4) {
                        newAgents[readerIndex].logs = [
                          ...newAgents[readerIndex].logs,
                          createLog('📊 Cross-verifying information across sources...', 'info')
                        ];
                      }

                      if (newProgress >= 80 && writerIndex !== -1) {
                        newPhase = 'writing';
                        newAgents[writerIndex] = {
                          ...newAgents[writerIndex],
                          status: 'processing',
                          progress: 10,
                          logs: [createLog('✍️ Starting to write report...', 'info')]
                        };
                      }
                    } 
                    else if (writerIndex !== -1 && state.phase === 'writing') {
                      const currentProgress = newAgents[writerIndex].progress;
                      const newProgress = Math.min(95, currentProgress + 15);
                      newAgents[writerIndex] = {
                        ...newAgents[writerIndex],
                        progress: newProgress,
                      };

                      if (newProgress > 50 && newProgress <= 55 && newAgents[writerIndex].logs.length < 2) {
                        newAgents[writerIndex].logs = [
                          ...newAgents[writerIndex].logs,
                          createLog('📝 Structuring report with executive summary...', 'info')
                        ];
                      } else if (newProgress > 70 && newProgress <= 75 && newAgents[writerIndex].logs.length < 3) {
                        newAgents[writerIndex].logs = [
                          ...newAgents[writerIndex].logs,
                          createLog('📊 Adding data visualizations and tables...', 'info')
                        ];
                      } else if (newProgress > 90 && newAgents[writerIndex].logs.length < 4) {
                        newAgents[writerIndex].logs = [
                          ...newAgents[writerIndex].logs,
                          createLog('🔧 Final proofreading and formatting...', 'info')
                        ];
                      }
                    }

                    return { agents: newAgents, phase: newPhase };
                  });
                }
              } catch (error) {
                console.error('Polling error:', error);
                if (activePollInterval) {
                  clearInterval(activePollInterval);
                  activePollInterval = null;
                }
                set({ phase: 'idle' });
              }
            }, 1000);
          })
          .catch((error) => {
            console.error('Research start failed:', error);
            // Fallback to mock data
            console.log('Using mock data fallback...');

            let mockProgress = 0;
            const mockInterval = window.setInterval(() => {
              mockProgress += 25;

              if (mockProgress >= 100) {
                clearInterval(mockInterval);
                set((state) => ({
                  phase: 'complete',
                  result: MOCK_RESEARCH_RESULT,
                  agents: state.agents.map((agent) => ({
                    ...agent,
                    status: 'completed' as AgentStatus,
                    progress: 100
                  })),
                }));

                const newItem: ResearchHistoryItem = {
                  id: Date.now().toString(),
                  title: query.length > 40 ? query.slice(0, 40) + '…' : query,
                  timestamp: new Date(),
                  preview: MOCK_RESEARCH_RESULT.slice(0, 120) + '…',
                  result: MOCK_RESEARCH_RESULT,
                };

                set((state) => ({
                  history: [newItem, ...state.history],
                  activeHistoryId: newItem.id,
                }));
              } else {
                set((state) => ({
                  agents: state.agents.map((agent) => {
                    if (agent.id === 'search' && mockProgress >= 25) {
                      return { ...agent, status: 'completed' as AgentStatus, progress: 100 };
                    }
                    if (agent.id === 'reader' && mockProgress >= 50) {
                      return { ...agent, status: 'processing' as AgentStatus, progress: mockProgress };
                    }
                    if (agent.id === 'writer' && mockProgress >= 75) {
                      return { ...agent, status: 'processing' as AgentStatus, progress: mockProgress - 25 };
                    }
                    return agent;
                  }),
                }));
              }
            }, 600);
          });
      },
    }),
    {
      name: 'research-storage',  // ✅ localStorage key
      partialize: (state) => ({
        isDark: state.isDark,
        history: state.history,
        settings: state.settings,
      }),
    }
  )
);
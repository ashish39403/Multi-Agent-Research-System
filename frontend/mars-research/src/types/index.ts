export type AgentStatus = 'idle' | 'processing' | 'completed' | 'error';

export interface Agent {
  id: 'search' | 'reader' | 'writer';
  name: string;
  description: string;
  color: string;
  status: AgentStatus;
  progress: number;
  logs: LogEntry[];
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'warning' | 'action';
}

export interface ResearchHistoryItem {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
  result?: string;
}

export type ResearchPhase = 'idle' | 'searching' | 'reading' | 'writing' | 'complete';

export interface AppSettings {
  researchDepth: 'quick' | 'standard' | 'deep';
  outputStyle: 'concise' | 'detailed' | 'academic';
  exportFormat: 'markdown' | 'pdf' | 'docx';
  animations: 'full' | 'reduced' | 'none';
}

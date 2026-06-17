import { ResearchHistoryItem, LogEntry } from '../types';

export const MOCK_HISTORY: ResearchHistoryItem[] = [
  {
    id: '1',
    title: 'AI Developments 2024',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    preview: 'Comprehensive overview of breakthroughs in large language models, multimodal AI, and autonomous agents...',
  },
  {
    id: '2',
    title: 'Quantum Computing Frontiers',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    preview: 'Analysis of recent quantum supremacy milestones, error correction advances, and near-term applications...',
  },
  {
    id: '3',
    title: 'Climate Technology Solutions',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    preview: 'Deep dive into carbon capture, renewable energy scaling, and green hydrogen viability for 2025...',
  },
  {
    id: '4',
    title: 'Space Exploration Update',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    preview: 'Mars mission timelines, lunar economy prospects, and commercial spaceflight competitive landscape...',
  },
  {
    id: '5',
    title: 'Robotics & Automation Trends',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    preview: 'Humanoid robot progress, warehouse automation ROI, and the future of dexterous manipulation...',
  },
];

export const SEARCH_AGENT_LOGS: LogEntry[] = [
  { id: 's1', timestamp: new Date(), message: 'Initializing web search protocols...', type: 'info' },
  { id: 's2', timestamp: new Date(), message: 'Querying 14 authoritative sources', type: 'action' },
  { id: 's3', timestamp: new Date(), message: 'Found 847 relevant results — filtering by recency', type: 'info' },
  { id: 's4', timestamp: new Date(), message: 'Deduplicating and ranking top 32 sources', type: 'action' },
  { id: 's5', timestamp: new Date(), message: 'Cross-referencing citations for credibility', type: 'info' },
  { id: 's6', timestamp: new Date(), message: 'Source collection complete — 18 high-quality sources identified', type: 'success' },
];

export const READER_AGENT_LOGS: LogEntry[] = [
  { id: 'r1', timestamp: new Date(), message: 'Ingesting 18 source documents...', type: 'info' },
  { id: 'r2', timestamp: new Date(), message: 'Extracting key facts and claims', type: 'action' },
  { id: 'r3', timestamp: new Date(), message: 'Identifying consensus views vs. contested claims', type: 'action' },
  { id: 'r4', timestamp: new Date(), message: 'Building knowledge graph of entities and relationships', type: 'info' },
  { id: 'r5', timestamp: new Date(), message: 'Detecting 3 contradictory data points — flagging for synthesis', type: 'warning' },
  { id: 'r6', timestamp: new Date(), message: 'Reading complete — 2,400 tokens of distilled insight ready', type: 'success' },
];

export const WRITER_AGENT_LOGS: LogEntry[] = [
  { id: 'w1', timestamp: new Date(), message: 'Structuring research narrative...', type: 'info' },
  { id: 'w2', timestamp: new Date(), message: 'Drafting executive summary', type: 'action' },
  { id: 'w3', timestamp: new Date(), message: 'Composing 6 thematic sections', type: 'action' },
  { id: 'w4', timestamp: new Date(), message: 'Integrating citations and evidence', type: 'info' },
  { id: 'w5', timestamp: new Date(), message: 'Resolving contradictions with nuanced analysis', type: 'action' },
  { id: 'w6', timestamp: new Date(), message: 'Final report compiled — 1,847 words', type: 'success' },
];

export const MOCK_RESEARCH_RESULT = `# The Current State of AI: Breakthroughs & What Comes Next

## Executive Summary

Artificial intelligence in 2024 has crossed several inflection points simultaneously — not through a single breakthrough, but through the convergence of scale, architecture innovation, and new training paradigms. This report synthesizes findings from 18 primary sources to provide a clear-eyed assessment of where the field stands and where it is headed.

---

## 1. Foundation Models Reach New Capability Thresholds

The past year saw foundation models cross what researchers call the **"reliable reasoning threshold"** — the ability to chain multi-step logical deductions with consistent accuracy across diverse domains.

Key developments include:

- **Chain-of-thought scaling**: Extended reasoning at inference time has shown dramatic improvements on mathematical olympiad problems, legal analysis, and software verification tasks
- **Multimodal unification**: Vision, audio, and text processing are increasingly handled by single unified architectures rather than modality-specific systems
- **Long context windows**: Models now maintain coherent context across entire codebases, books, and multi-hour video recordings

> "We are no longer building AI that responds to prompts. We are building AI that thinks before it speaks." — AI Safety Researcher, NeurIPS 2024

## 2. Autonomous Agents: From Demo to Deployment

Perhaps the most consequential shift is the movement of autonomous AI agents from research demonstrations into real-world deployment:

| Domain | Agent Type | Adoption Stage |
|--------|-----------|----------------|
| Software Engineering | Code generation + review | Early production |
| Scientific Research | Literature synthesis + hypothesis generation | Active pilots |
| Customer Operations | Multi-turn resolution agents | Wide deployment |
| Healthcare Administration | Record processing + scheduling | Regulatory review |

The pattern across all domains is consistent: agents excel at well-defined tasks with clear success criteria and struggle when goals are ambiguous or require real-world physical feedback.

## 3. The Efficiency Revolution

Raw capability is only part of the story. Equally important is the dramatic improvement in computational efficiency:

- Training a GPT-3-class model now costs approximately **95% less** than in 2020
- Edge deployment of capable models on consumer hardware has become viable
- Energy consumption per useful output has fallen by an estimated 40x since 2022

This efficiency gain is democratizing access — startups and research institutions that previously couldn't afford frontier AI experiments can now iterate rapidly.

## 4. Safety Research Matures

The safety research field has moved from largely theoretical to empirically-grounded:

1. **Interpretability**: Tools for understanding model internals have advanced significantly, with circuits analysis now feasible for targeted behaviors
2. **Alignment benchmarks**: New evaluation frameworks measure value alignment more rigorously than capability benchmarks alone
3. **Red-teaming at scale**: Automated adversarial testing has replaced purely manual red-teaming for most commercial deployments

Critically, the gap between safety research pace and capability deployment pace remains a point of significant concern among leading researchers.

## 5. Geopolitical Dimensions

AI development is now explicitly a dimension of great-power competition:

- Export controls on advanced AI chips have reshaped global supply chains
- Sovereign AI initiatives are accelerating in the EU, India, Japan, and the Gulf states
- Open-source models have complicated the technology control landscape — capable models are now globally accessible regardless of export policy

## 6. What to Watch in 2025

Based on current trajectories, the following developments appear most likely in the near term:

- **Reasoning model proliferation**: The techniques pioneered in frontier models will cascade down to smaller, cheaper models
- **Agent infrastructure maturation**: Tooling for deploying, monitoring, and auditing autonomous agents will become a major market category
- **Regulatory crystallization**: The EU AI Act implementation will produce the first real-world case law around AI liability and compliance
- **Embodied AI acceleration**: Robotics will benefit disproportionately from improved reasoning capabilities

---

## Conclusion

The AI landscape in 2024 is best characterized as the moment when many years of foundational research simultaneously became practically useful. The question is no longer whether AI will transform industries, but which transformation pathways will prove most durable, and whether safety and governance can keep pace with capability.

*Research compiled from 18 sources including Nature, arXiv, IEEE Spectrum, and original industry reports. Last updated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.*
`;

export const SUGGESTED_QUERIES = [
  'Latest AI breakthroughs',
  'Future of Quantum Computing',
  'Climate Change Solutions',
  'Space Exploration Updates',
  'Robotics Trends',
];

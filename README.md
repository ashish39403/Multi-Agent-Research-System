# 🚀 Multi-Agent Research System

An AI-powered research assistant that uses multiple autonomous agents to perform end-to-end research, source analysis, report generation, and automatic visualization creation.

Simply enter a topic, and the system handles everything from searching the web to generating a professional research report with charts and citations.

---

## 🎯 Features

### 🔍 Intelligent Research

* Searches multiple authoritative sources
* Extracts relevant information automatically
* Cross-references findings from different sources
* Provides source-backed insights

### 📖 Multi-Agent Workflow

The system uses specialized AI agents that collaborate together:

| Agent           | Role                  | Description                                                                  |
| --------------- | --------------------- | ---------------------------------------------------------------------------- |
| 🔍 Search Agent | Web Explorer          | Searches the internet and collects relevant sources                          |
| 📖 Reader Agent | Information Extractor | Reads sources and extracts facts, statistics, dates, and key insights        |
| ✍️ Writer Agent | Report Generator      | Creates professional research reports with citations and structured analysis |

### 📊 Automatic Visualizations

* Timeline Charts
* Bar Charts
* Pie Charts
* Statistical Summaries

Charts are automatically generated whenever structured numerical data is found.

### 📄 Professional Reports

Generated reports include:

* Executive Summary
* Key Findings
* Detailed Analysis
* Statistics & Trends
* Visual Charts
* Citations & References
* Conclusion

### 🎨 Modern User Interface

* Responsive Design
* Dark / Light Mode
* Real-Time Progress Tracking
* Smooth Animations
* Research History Management

### 💾 Report History

* Save Reports
* View Previous Research
* Delete Individual Reports
* Persistent Local Storage

### 📥 Export Support

* Markdown Export
* PDF Export
* Copy to Clipboard

---

# 🛠️ Tech Stack

## Frontend

```text
React 19
TypeScript
Tailwind CSS
Framer Motion
Zustand
Vite
```

## Backend

```text
FastAPI
Python 3.10+
LangChain
OpenAI GPT
Matplotlib
Seaborn
BeautifulSoup
DuckDuckGo Search
```

---

# 🏗️ Architecture

```text
USER QUERY
      │
      ▼
┌───────────────────────┐
│      Frontend         │
│       React           │
└───────────────────────┘
      │
      ▼
┌───────────────────────┐
│      FastAPI API      │
└───────────────────────┘
      │
      ▼

┌───────────────────────┐
│   🔍 Search Agent     │
└───────────────────────┘
      │
      ▼
┌───────────────────────┐
│   📖 Reader Agent     │
└───────────────────────┘
      │
      ▼
┌───────────────────────┐
│   ✍️ Writer Agent     │
└───────────────────────┘
      │
      ▼

┌───────────────────────┐
│ Visualization Engine  │
│ Matplotlib + Seaborn  │
└───────────────────────┘
      │
      ▼

Professional Research Report
with Charts & Citations
```

---

# 📊 Sample Report Structure

```markdown
# Research Report: Artificial Intelligence Trends

## Executive Summary

## Key Findings

## Detailed Analysis

## Statistics & Trends

## Timeline

## Charts & Visualizations

## Conclusion

## References
```

---

# 🎯 Use Cases

| Category                 | Example            |
| ------------------------ | ------------------ |
| 📚 Academic Research     | Literature Reviews |
| 💼 Business Intelligence | Market Research    |
| 📈 Trend Analysis        | Industry Reports   |
| 📝 Content Creation      | Blogs & Articles   |
| 🔬 Scientific Research   | Research Summaries |
| 💹 Financial Research    | Market Insights    |

---

# ✨ Why This Project?

| Problem                              | Solution                       |
| ------------------------------------ | ------------------------------ |
| Manual research is time-consuming    | Automated research pipeline    |
| Information scattered across sources | Consolidated reports           |
| Charts require manual work           | Auto-generated visualizations  |
| Difficult report formatting          | Professional report generation |
| Hard to manage previous research     | Built-in history management    |

---

# 💡 Highlights

* Multi-Agent Architecture
* Automatic Report Generation
* Auto Visualization Creation
* Source Citations
* Modern React UI
* FastAPI Backend
* Export to PDF & Markdown
* Open Source

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/multi-agent-research.git
cd multi-agent-research
```

## Backend Setup

```bash
uv sync

uvicorn app.main:app --reload
```

Backend:

```text
http://localhost:8000
```

API Docs:

```text
http://localhost:8000/docs
```

---

## Frontend Setup

```bash
cd frontend/mars-research

npm install

npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🔮 Future Roadmap

* PostgreSQL Integration
* User Authentication
* WebSocket Streaming
* More Visualization Types
* Report Sharing
* Collaboration Features
* Multi-Language Support
* AI-Powered Recommendations

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Submit a Pull Request

---

# 📄 License

MIT License

---

# ⭐ Support

If you found this project useful:

* Star the repository
* Open issues for bugs
* Suggest improvements
* Share feedback

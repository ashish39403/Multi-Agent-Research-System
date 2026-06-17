// src/components/results/ResearchResults.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Copy,
  Download,
  Share2,
  RefreshCw,
  Check,
  FileDown,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import confetti from 'canvas-confetti';

// ✅ Custom component to render images properly
const MarkdownImage = ({ src, alt }: { src?: string; alt?: string }) => {
  const [imageError, setImageError] = useState(false);
  
  if (!src) return null;
  
  // Check if it's a base64 image
  const isBase64 = src.startsWith('data:image');
  
  return (
    <div className="my-4">
      {!imageError ? (
        <img
          src={src}
          alt={alt || 'Chart'}
          className="max-w-full h-auto rounded-lg shadow-md border border-slate-200 dark:border-slate-700"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      ) : (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
          ⚠️ Chart could not be loaded
        </div>
      )}
      {isBase64 && alt && (
        <p className="text-xs text-center text-slate-400 mt-1">{alt}</p>
      )}
    </div>
  );
};

export default function ResearchResults() {
  const { result, phase, startResearch, query, resetResearch } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasLaunched = useRef(false);

  // Confetti on completion
  useEffect(() => {
    if (phase === 'complete' && result && !hasLaunched.current) {
      hasLaunched.current = true;
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'],
          ticks: 200,
          gravity: 1.2,
          scalar: 0.8,
        });
      }, 400);
    }
    if (phase === 'idle') hasLaunched.current = false;
  }, [phase, result]);

  // Scroll progress
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      setScrollProgress(
        scrollHeight <= clientHeight ? 0 : scrollTop / (scrollHeight - clientHeight)
      );
    };
    el.addEventListener('scroll', handler);
    return () => el.removeEventListener('scroll', handler);
  }, [result]);

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportMd = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (!result) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Popup blocked! Please allow popups for this site.');
      return;
    }

    // Convert markdown to HTML with proper image handling
    let htmlContent = result;

    // Convert base64 images to proper img tags
    htmlContent = htmlContent.replace(
      /!\[([^\]]*)\]\(data:image\/[^;]+;base64,([^)]+)\)/g,
      (match, alt, base64Data) => {
        return `<img src="data:image/png;base64,${base64Data}" alt="${alt || 'Chart'}" style="max-width:100%; height:auto; margin:20px 0; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1);" />`;
      }
    );

    // Convert regular markdown images
    htmlContent = htmlContent.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      (match, alt, url) => {
        return `<img src="${url}" alt="${alt || 'Image'}" style="max-width:100%; height:auto; margin:20px 0; border-radius:8px;" />`;
      }
    );

    // Convert headers
    htmlContent = htmlContent.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    htmlContent = htmlContent.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    htmlContent = htmlContent.replace(/^# (.*$)/gm, '<h1>$1</h1>');

    // Convert bold
    htmlContent = htmlContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convert italic
    htmlContent = htmlContent.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Convert links
    htmlContent = htmlContent.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Convert inline code
    htmlContent = htmlContent.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Convert code blocks
    htmlContent = htmlContent.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');

    // Convert tables
    const tableRegex = /\|(.+)\|\n\|[-:| ]+\|\n((?:\|.+\|\n?)+)/g;
    htmlContent = htmlContent.replace(tableRegex, (_match: string, headerRow: string, bodyRows: string) => {
      const headers = headerRow.split('|').filter((cell: string) => cell.trim());
      const headerHtml = `<thead><tr>${headers
        .map((h: string) => `<th>${h.trim()}</th>`)
        .join('')}</tr></thead>`;

      const bodyHtml = bodyRows
        .trim()
        .split('\n')
        .map((row: string) => {
          const cells = row.split('|').filter((cell: string) => cell.trim());
          return `<tr>${cells.map((c: string) => `<td>${c.trim()}</td>`).join('')}</tr>`;
        })
        .join('');

      return `<table>${headerHtml}<tbody>${bodyHtml}</tbody></table>`;
    });

    // Convert line breaks
    htmlContent = htmlContent.replace(/\n\n/g, '</p><p>');
    htmlContent = htmlContent.replace(/\n/g, '<br/>');

    // Wrap in paragraphs
    if (!htmlContent.startsWith('<')) {
      htmlContent = `<p>${htmlContent}</p>`;
    }

    const currentQueryText = query || 'Research Report';
    const currentDate = new Date().toLocaleString();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Research Report - ${currentQueryText.slice(0, 50)}</title>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            padding: 40px;
            max-width: 1100px;
            margin: 0 auto;
            background: #ffffff;
            color: #1a202c;
          }
          .report-header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #3b82f6;
          }
          .report-header h1 { font-size: 32px; font-weight: 800; margin-bottom: 10px; color: #0f172a; }
          .report-header .date { color: #64748b; font-size: 14px; margin: 5px 0; }
          .report-header .topic {
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            display: inline-block;
            padding: 6px 16px;
            border-radius: 20px;
            color: white;
            font-size: 13px;
            font-weight: 600;
            margin-top: 15px;
          }
          h1 { font-size: 28px; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin: 35px 0 20px; color: #0f172a; }
          h2 { font-size: 24px; font-weight: 700; margin: 30px 0 15px; color: #1e293b; }
          h3 { font-size: 20px; font-weight: 600; margin: 25px 0 12px; color: #334155; }
          p { margin-bottom: 16px; font-size: 15px; line-height: 1.7; color: #334155; }
          img { max-width: 100%; height: auto; margin: 25px 0; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          table { width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 14px; }
          th { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 12px; font-weight: 700; text-align: left; color: #0f172a; }
          td { border: 1px solid #cbd5e1; padding: 10px 12px; color: #334155; }
          blockquote {
            border-left: 4px solid #3b82f6;
            margin: 20px 0;
            padding: 12px 24px;
            background: #f8fafc;
            border-radius: 0 8px 8px 0;
            font-style: italic;
          }
          code { background: #f1f5f9; padding: 3px 8px; border-radius: 6px; font-family: monospace; font-size: 13px; color: #d946ef; }
          pre { background: #0f172a; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 20px 0; }
          pre code { background: none; color: #e2e8f0; padding: 0; }
          ul, ol { margin: 16px 0; padding-left: 32px; }
          li { margin: 8px 0; color: #334155; }
          hr { border: none; border-top: 2px solid #e2e8f0; margin: 40px 0; }
          @media print {
            body { padding: 20px; }
            img { page-break-inside: avoid; }
            table, pre, blockquote { page-break-inside: avoid; }
            h1, h2, h3, h4 { page-break-after: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="report-header">
          <h1>🔬 Research Report</h1>
          <div class="date">📅 Generated: ${currentDate}</div>
          <div class="topic">📌 ${currentQueryText.slice(0, 100)}</div>
        </div>
        <div class="report-content">
          ${htmlContent}
        </div>
        <div class="no-print" style="text-align: center; margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 11px;">
          Generated by Multi-Agent Research System
        </div>
        <script>
          const images = document.querySelectorAll('img');
          let loadedCount = 0;
          
          function printPage() {
            window.print();
            setTimeout(() => window.close(), 1000);
          }
          
          if (images.length === 0) {
            setTimeout(printPage, 500);
          } else {
            images.forEach(img => {
              if (img.complete) {
                loadedCount++;
                if (loadedCount === images.length) setTimeout(printPage, 500);
              } else {
                img.addEventListener('load', () => {
                  loadedCount++;
                  if (loadedCount === images.length) setTimeout(printPage, 500);
                });
                img.addEventListener('error', () => {
                  loadedCount++;
                  if (loadedCount === images.length) setTimeout(printPage, 500);
                });
              }
            });
          }
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  if (!result) return null;

  return (
    <AnimatePresence>
      {result && (
        <motion.section
          initial={{ opacity: 0, y: 32, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="px-6 md:px-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                <Sparkles size={16} className="text-purple-400" />
              </motion.div>
              <h2 className="text-sm font-semibold text-primary">Research Report</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Ready
              </span>
            </div>

            {/* Action bar */}
            <div className="flex items-center gap-1.5">
              <ActionButton
                onClick={handleCopy}
                icon={copied ? Check : Copy}
                label={copied ? 'Copied!' : 'Copy'}
                active={copied}
              />
              <ActionButton onClick={handleExportMd} icon={Download} label="Export .md" />
              <ActionButton onClick={handleExportPDF} icon={FileDown} label="Export PDF" />
              <ActionButton onClick={() => {}} icon={Share2} label="Share" />
              <ActionButton
                onClick={() => startResearch()}
                icon={RefreshCw}
                label="Regenerate"
                className="border-blue-500/20 hover:bg-blue-500/5 text-blue-400"
              />
            </div>
          </div>

          {/* Result card */}
          <div className="glass rounded-2xl overflow-hidden relative">
            {/* Scroll progress strip */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/5 z-10">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"
                style={{ width: `${scrollProgress * 100}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            </div>

            <div
              ref={scrollRef}
              className="overflow-y-auto p-6 md:p-8"
              style={{ maxHeight: '70vh' }}
            >
              <div className="markdown-body max-w-none text-primary">
                <ReactMarkdown
                  components={{
                    // ✅ Custom image renderer for base64 images
                    img: ({ src, alt }) => (
                      <MarkdownImage src={src} alt={alt} />
                    ),
                  }}
                >
                  {result}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Word count footer */}
          <div className="flex items-center justify-between mt-3 px-1">
            <p className="text-xs text-secondary">
              {result.split(/\s+/).length.toLocaleString()} words · Generated from{' '}
              {query || 'your query'}
            </p>
            <p className="text-xs text-secondary">Scroll to read</p>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

function ActionButton({
  onClick,
  icon: Icon,
  label,
  active,
  className = '',
}: {
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  active?: boolean;
  className?: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.96 }}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium glass border border-theme hover:bg-white/5 transition-all ${
        active
          ? 'text-emerald-400 border-emerald-500/20'
          : 'text-secondary hover:text-primary'
      } ${className}`}
    >
      <Icon size={12} className={active ? 'text-emerald-400' : ''} />
      <span className="hidden sm:inline">{label}</span>
    </motion.button>
  );
}
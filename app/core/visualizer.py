import matplotlib.pyplot as plt
import seaborn as sns
import json
import base64
import re
from io import BytesIO
from typing import Dict, List, Optional

class ReportVisualizer:
    def __init__(self):
        """Initialize visualizer with styles"""
        try:
            plt.style.use('seaborn-v0_8-darkgrid')
        except:
            plt.style.use('default')
        sns.set_palette("husl")
    
    def create_timeline_chart(self, data: Dict, title: str) -> str:
        """Create timeline chart and return as base64"""
        fig, ax = plt.subplots(figsize=(10, 6))
        
        dates = data.get('dates', [])
        values = data.get('values', [])
        
        ax.plot(dates, values, marker='o', linewidth=2, markersize=8, color='#3b82f6')
        ax.set_title(title, fontsize=14, fontweight='bold')
        ax.set_xlabel('Timeline', fontsize=12)
        ax.set_ylabel('Value', fontsize=12)
        ax.grid(True, alpha=0.3)
        
        # Rotate x-axis labels if too many
        if len(dates) > 5:
            plt.xticks(rotation=45, ha='right')
        
        plt.tight_layout()
        
        # Convert to base64
        buffer = BytesIO()
        plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.read()).decode()
        plt.close()
        
        return f"![{title}](data:image/png;base64,{image_base64})"
    
    def create_comparison_chart(self, data: Dict, title: str) -> str:
        """Create bar chart for comparisons"""
        fig, ax = plt.subplots(figsize=(10, 6))
        
        categories = data.get('categories', [])
        values = data.get('values', [])
        
        colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']
        bars = ax.bar(categories, values, color=colors[:len(categories)])
        ax.set_title(title, fontsize=14, fontweight='bold')
        ax.set_ylabel('Value', fontsize=12)
        ax.grid(True, alpha=0.3, axis='y')
        
        # Add value labels on bars
        for bar, value in zip(bars, values):
            ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + max(values)*0.02,
                   f'{value}', ha='center', va='bottom', fontweight='bold', fontsize=10)
        
        plt.tight_layout()
        
        buffer = BytesIO()
        plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.read()).decode()
        plt.close()
        
        return f"![{title}](data:image/png;base64,{image_base64})"
    
    def create_pie_chart(self, data: Dict, title: str) -> str:
        """Create pie chart for distributions"""
        fig, ax = plt.subplots(figsize=(8, 8))
        
        labels = data.get('labels', [])
        sizes = data.get('sizes', [])
        
        colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec489a', '#06b6d4']
        wedges, texts, autotexts = ax.pie(sizes, labels=labels, autopct='%1.1f%%',
                                           colors=colors[:len(labels)], startangle=90)
        
        ax.set_title(title, fontsize=14, fontweight='bold')
        
        # Style the text
        for text in texts:
            text.set_fontsize(11)
        for autotext in autotexts:
            autotext.set_color('white')
            autotext.set_fontweight('bold')
            autotext.set_fontsize(10)
        
        plt.tight_layout()
        
        buffer = BytesIO()
        plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.read()).decode()
        plt.close()
        
        return f"![{title}](data:image/png;base64,{image_base64})"
    
    def process_report_charts(self, report: str) -> str:
        """Find and replace chart placeholders in report"""
        chart_pattern = r'\[CHART: (timeline|comparison|pie)/([^\]]+)\]\s*Data:\s*(\{[^}]+\})'
        
        def replace_chart(match):
            chart_type = match.group(1)
            title = match.group(2)
            data_str = match.group(3)
            
            try:
                # Clean and parse JSON data
                data_str_clean = data_str.replace("'", '"')
                data = json.loads(data_str_clean)
                
                if chart_type == "timeline":
                    return self.create_timeline_chart(data, title)
                elif chart_type == "comparison":
                    return self.create_comparison_chart(data, title)
                elif chart_type == "pie":
                    return self.create_pie_chart(data, title)
                else:
                    return f"\n*Chart type '{chart_type}' not supported*\n"
            except Exception as e:
                return f"\n*Chart could not be generated for {title}: {str(e)}*\n"
        
        return re.sub(chart_pattern, replace_chart, report, flags=re.DOTALL)

# Helper function for quick chart generation
def add_simple_ascii_chart(report: str) -> str:
    """Fallback: Add simple ASCII charts if matplotlib fails"""
    # Simple ASCII bar chart generator
    import re
    
    def create_ascii_bar_chart(data: Dict, title: str) -> str:
        categories = data.get('categories', data.get('labels', []))
        values = data.get('values', data.get('sizes', []))
        
        if not categories or not values:
            return ""
        
        max_value = max(values)
        chart = f"\n**{title}**\n```\n"
        
        for cat, val in zip(categories, values):
            bar_length = int((val / max_value) * 30)
            bar = '█' * bar_length
            chart += f"{cat:<15} | {bar} {val}\n"
        
        chart += "```\n"
        return chart
    
    # Find chart patterns and replace with ASCII
    pattern = r'\[CHART: [^/]+/([^\]]+)\]\s*Data:\s*\{[^}]+\}'
    matches = re.finditer(pattern, report)
    
    for match in matches:
        # Extract data
        data_match = re.search(r'Data:\s*(\{[^}]+\})', match.group(0))
        if data_match:
            try:
                data = json.loads(data_match.group(1).replace("'", '"'))
                title = match.group(1)
                ascii_chart = create_ascii_bar_chart(data, title)
                report = report.replace(match.group(0), ascii_chart)
            except:
                pass
    
    return report
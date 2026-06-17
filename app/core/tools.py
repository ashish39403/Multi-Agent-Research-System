from langchain_core.tools import tool
from langchain_community.utilities import DuckDuckGoSearchAPIWrapper
import os
from dotenv import load_dotenv
from bs4 import BeautifulSoup
import requests
load_dotenv()



search_wrapper = DuckDuckGoSearchAPIWrapper()
@tool
def web_search(query: str, max_results: int = 6) -> str:
    """Useful for searching the web to get real-time information or current events.
    
    Args:
        query: The search query string.
        max_results: The maximum number of results to return (default is 6).
    """
    try:
        results = search_wrapper.results(query, max_results=max_results)
        if not results:
            return "No results found."
            
        formatted_results = []
        for res in results:
            formatted_results.append(f"Title: {res['title']}\nLink: {res['link']}\nSnippet: {res['snippet']}\n---")
            
        return "\n".join(formatted_results)
        
    except Exception as e:
        return f"Search Failed due to error: {str(e)}"


@tool
def web_scrape_url(url: str) -> str:
    """Useful for extracting clean text content from a specific webpage URL. 
    Use this when you have a specific link and need to read its content.
    
    Args:
        url: The exact HTTP/HTTPS URL of the website to scrape.
    """
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        
        response = requests.get(url=url, headers=headers, timeout=8)
        if response.status_code != 200:
            return f"Failed to fetch URL. Status code: {response.status_code}"
        soup = BeautifulSoup(response.text, "html.parser")
        for tag in soup(["script", "style", "nav", "footer", "header"]):
            tag.decompose()
            
        
        clean_text = soup.get_text(separator=" ", strip=True)
        return clean_text[:4000] 
        
    except Exception as e:
        return f"Could not scrape URL due to error: {str(e)}"




import React from 'react';
import { NewsSentiment, NewsArticle } from '../types';

interface NewsCardProps {
  icon: React.ReactNode;
  title: string;
  news: NewsSentiment;
}

const getSentimentClasses = (sentiment: NewsArticle['sentiment'] | NewsSentiment['overallSentiment']) => {
  switch (sentiment) {
    case 'Positive': return 'bg-green-900/50 border-green-500 text-green-300';
    case 'Negative': return 'bg-red-900/50 border-red-500 text-red-300';
    default: return 'bg-gray-700/50 border-gray-600 text-gray-300';
  }
};

const isSpecificArticleUrl = (url?: string): boolean => {
    if (!url || !url.startsWith('http')) return false;
    try {
        const urlObj = new URL(url);
        const path = urlObj.pathname.toLowerCase().replace(/\/$/, '');
        
        // Reject root
        if (path === '' || path === '/') return false;

        // Reject generic landing pages
        const genericPaths = [
            '/news', '/markets', '/finance', '/investing', 
            '/stock', '/stocks', '/quote', '/ticker', '/search', '/business'
        ];
        if (genericPaths.includes(path)) return false;
        
        // Reject if the URL seems to be just a ticker page (often dynamic and not the specific article)
        // e.g. finance.yahoo.com/quote/AAPL
        if (path.includes('/quote/') && path.split('/').length <= 3) return false;

        return true;
    } catch {
        return false;
    }
}

const Article: React.FC<{ article: NewsArticle }> = ({ article }) => {
    // If the AI provides a URL, use it. Otherwise, fallback to a Google Search for the title.
    // This prevents "broken" links if the AI hallucinates a URL or leaves it empty.
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(article.title + ' ' + article.source)}`;
    
    // STRICT VALIDATION: Only use the provided URL if it's a specific article link, not a generic landing page.
    const finalUrl = isSpecificArticleUrl(article.url) ? article.url : searchUrl;

    return (
        <div className="border-t border-gray-700 py-3">
            <div className="flex justify-between items-start mb-1">
                <a 
                    href={finalUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline text-sm pr-2 transition-colors"
                    title={isSpecificArticleUrl(article.url) ? "Open Article" : "Search on Google"}
                >
                    {article.title}
                </a>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${getSentimentClasses(article.sentiment)}`}>
                {article.sentiment}
                </span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                <span>Source: {article.source}</span>
                {article.date && (
                    <>
                        <span>•</span>
                        <span>{article.date}</span>
                    </>
                )}
            </div>
            <p className="text-gray-400 text-sm">{article.summary}</p>
        </div>
    );
};


const NewsCard: React.FC<NewsCardProps> = ({ icon, title, news }) => {
  return (
    <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-700">
      <h3 className="text-2xl font-bold mb-4 flex items-center text-white">{icon} <span className="ml-2">{title}</span></h3>
      <div className="mb-4">
        <span className={`inline-block font-bold px-3 py-1 rounded-md text-sm ${getSentimentClasses(news.overallSentiment)}`}>
          Overall: {news.overallSentiment}
        </span>
        <p className="text-gray-400 text-sm mt-2">{news.summary}</p>
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {news.articles.map((article, index) => (
          <Article key={index} article={article} />
        ))}
      </div>
    </div>
  );
};

export default NewsCard;

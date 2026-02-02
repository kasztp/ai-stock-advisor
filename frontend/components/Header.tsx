
import React from 'react';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-gray-800">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
            {onToggleSidebar && (
                <button 
                    onClick={onToggleSidebar}
                    className="p-2 mr-2 text-gray-400 hover:text-white rounded-md hover:bg-gray-800 transition-colors focus:outline-none"
                    title="Open Portfolio"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            )}
          <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          <h1 className="text-xl font-bold text-white hidden sm:block">AI Stock Advisor</h1>
          <h1 className="text-xl font-bold text-white sm:hidden">AI Stocks</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;

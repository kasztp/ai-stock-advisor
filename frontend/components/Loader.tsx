
import React, { useState, useEffect } from 'react';

interface LoaderProps {
  ticker?: string;
}

const Loader: React.FC<LoaderProps> = ({ ticker }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    `Initializing secure connection...`,
    `Retrieving historical market data for ${ticker || 'ticker'}...`,
    `Scanning global news sources & sentiment...`,
    `Calculating valuation models (DCF, P/E)...`,
    `Analysing growth metrics...`,
    `Formulating final investment recommendation...`
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1500); // Change step every 1.5 seconds

    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="flex flex-col items-center justify-center my-12 max-w-md mx-auto p-6 bg-gray-800/30 rounded-xl border border-gray-700/50 backdrop-blur-sm">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-600 rounded-full opacity-20"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
             <span className="text-xs font-bold text-cyan-500">AI</span>
        </div>
      </div>
      
      <div className="w-full space-y-3">
        {steps.map((step, index) => (
          <div 
            key={index} 
            className={`flex items-center transition-all duration-500 ${
              index <= currentStep ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute'
            }`}
            style={{ display: index > currentStep ? 'none' : 'flex' }}
          >
            <div className={`w-2 h-2 rounded-full mr-3 ${
                index === currentStep ? 'bg-cyan-400 animate-pulse' : 'bg-green-500'
            }`}></div>
            <span className={`text-sm ${
                index === currentStep ? 'text-cyan-100 font-medium' : 'text-gray-500'
            }`}>
              {step}
            </span>
            {index < currentStep && (
                <svg className="w-4 h-4 ml-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loader;

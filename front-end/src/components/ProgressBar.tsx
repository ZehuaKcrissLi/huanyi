import React from 'react';

interface ProgressBarProps {
  currentStep?: number;
  totalSteps?: number;
  status: 'idle' | 'processing' | 'completed' | 'error';
  message?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  status,
  message
}) => {
  const progress = currentStep && totalSteps 
    ? Math.round((currentStep / totalSteps) * 100)
    : 0;

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'bg-blue-600';
      case 'completed':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      default:
        return 'bg-gray-200';
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">
          {status === 'processing' ? `处理中 (${progress}%)` : status === 'completed' ? '处理完成' : status === 'error' ? '处理出错' : '等待处理'}
        </span>
        {currentStep && totalSteps && (
          <span className="text-sm font-medium text-gray-700">
            {currentStep}/{totalSteps}
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full transition-all duration-300 ${getStatusColor()}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      {message && (
        <p className={`mt-1 text-sm ${status === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default ProgressBar; 
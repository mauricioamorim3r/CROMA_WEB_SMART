import React, { memo } from 'react';

interface ProgressBarProps {
  progress: number;
  showPercentage?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = memo(({ 
  progress, 
  showPercentage = true, 
  className = '' 
}) => {
  // Sanitize progress value
  const safeProgress = Math.max(0, Math.min(100, isNaN(progress) ? 0 : progress));
  
  const getProgressColor = (progress: number): string => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 60) return 'bg-yellow-500';
    if (progress < 90) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const progressColor = getProgressColor(safeProgress);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">
          Progresso do Preenchimento
        </span>
        {showPercentage && (
          <span className="text-sm font-medium text-gray-700">
            {safeProgress}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
        <div
          className={`h-3 rounded-full transition-all duration-500 ease-out ${progressColor}`}
          style={{ width: `${safeProgress}%` }}
        />
      </div>
      <div className="mt-1 text-xs text-gray-500">
        {safeProgress < 30 && 'Começando...'}
        {safeProgress >= 30 && safeProgress < 60 && 'Progredindo bem'}
        {safeProgress >= 60 && safeProgress < 90 && 'Quase lá!'}
        {safeProgress >= 90 && safeProgress < 100 && 'Quase concluído'}
        {safeProgress === 100 && 'Concluído!'}
      </div>
    </div>
  );
});

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar; 
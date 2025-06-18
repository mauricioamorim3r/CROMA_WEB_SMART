
import React from 'react';
import { ValidationStatus } from '../../types';

interface StatusBadgeProps {
  status: ValidationStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let bgColor = 'bg-gray-400';
  let textColor = 'text-white';

  switch (status) {
    case ValidationStatus.OK:
      bgColor = 'bg-green-500';
      break;
    case ValidationStatus.ForaDaFaixa:
      bgColor = 'bg-red-500';
      break;
    case ValidationStatus.Pendente:
      bgColor = 'bg-yellow-400';
      textColor = 'text-gray-800';
      break;
    case ValidationStatus.NA:
      bgColor = 'bg-gray-300';
      textColor = 'text-gray-700';
      break;
  }

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${bgColor} ${textColor}`}>
      {status}
    </span>
  );
};

export default StatusBadge;

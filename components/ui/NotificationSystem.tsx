import React from 'react';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
}

interface NotificationSystemProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications, onRemove }) => {
  const getNotificationStyles = (type: Notification['type']) => {
    const baseStyles = "mb-3 p-4 rounded-lg border-l-4 shadow-md transition-all duration-300 ease-in-out";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-400 text-green-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-400 text-yellow-800`;
      case 'error':
        return `${baseStyles} bg-red-50 border-red-400 text-red-800`;
      case 'info':
        return `${baseStyles} bg-blue-50 border-blue-400 text-blue-800`;
      default:
        return `${baseStyles} bg-gray-50 border-gray-400 text-gray-800`;
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      default:
        return '📝';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full space-y-2 pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getNotificationStyles(notification.type)} pointer-events-auto`}
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-2">
              <span className="text-lg flex-shrink-0">{getIcon(notification.type)}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{notification.title}</h4>
                <p className="text-xs mt-1 opacity-90 break-words">{notification.message}</p>
                <p className="text-xs mt-1 opacity-70">
                  {notification.timestamp.toLocaleTimeString('pt-BR')}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                try {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemove(notification.id);
                } catch (error) {
                  console.warn('Erro ao remover notificação:', error);
                }
              }}
              className="text-gray-500 hover:text-gray-700 font-bold text-lg leading-none flex-shrink-0 ml-2"
              aria-label="Fechar notificação"
              type="button"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationSystem; 
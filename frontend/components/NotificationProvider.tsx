import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto remove after duration (default 5 seconds)
    setTimeout(() => {
      removeNotification(id);
    }, notification.duration || 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`
              p-4 rounded-lg shadow-lg border flex items-start space-x-3
              ${notification.type === 'success' ? 'bg-green-50 border-green-200' : ''}
              ${notification.type === 'error' ? 'bg-red-50 border-red-200' : ''}
              ${notification.type === 'info' ? 'bg-blue-50 border-blue-200' : ''}
            `}
          >
            <div className="flex-shrink-0">
              {notification.type === 'success' && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              {notification.type === 'error' && (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              {notification.type === 'info' && (
                <AlertCircle className="w-5 h-5 text-blue-500" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className={`
                text-sm font-medium
                ${notification.type === 'success' ? 'text-green-800' : ''}
                ${notification.type === 'error' ? 'text-red-800' : ''}
                ${notification.type === 'info' ? 'text-blue-800' : ''}
              `}>
                {notification.title}
              </p>
              {notification.message && (
                <p className={`
                  text-sm mt-1
                  ${notification.type === 'success' ? 'text-green-600' : ''}
                  ${notification.type === 'error' ? 'text-red-600' : ''}
                  ${notification.type === 'info' ? 'text-blue-600' : ''}
                `}>
                  {notification.message}
                </p>
              )}
            </div>
            
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

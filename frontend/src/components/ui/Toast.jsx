import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="text-green-500" size={20} />,
    error: <AlertCircle className="text-red-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />
  };

  const bgs = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200'
  };

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-50 flex items-start rounded-lg border p-4 shadow-lg animate-fade-in sm:left-auto sm:max-w-sm ${bgs[type]}`}>
      <div className="mr-3 mt-0.5 shrink-0">{icons[type]}</div>
      <p className="mr-3 min-w-0 flex-1 break-words text-sm font-medium text-gray-800">{message}</p>
      <button type="button" onClick={onClose} className="-m-2 flex min-h-11 min-w-11 items-center justify-center text-gray-500 hover:text-gray-700">
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;

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
    <div className={`fixed bottom-4 right-4 flex items-center p-4 border rounded-lg shadow-lg animate-fade-in z-50 ${bgs[type]}`}>
      <div className="mr-3">{icons[type]}</div>
      <p className="text-gray-800 text-sm font-medium mr-4">{message}</p>
      <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
